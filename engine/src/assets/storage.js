// 资产存储服务
// 为未来迁移到数据库预留接口

const ASSETS_KEY = 'beu_assets';
const PRODUCTS_KEY = 'beu_products';
const AUTHOR_PROFILES_KEY = 'beu_author_profiles';
const ASSETS_VERSION = '1.0.0';

/**
 * 资产存储服务
 */
export class AssetStorageService {
  /**
   * 保存所有资产
   */
  static saveAssets(assets) {
    try {
      const dataToSave = {
        version: ASSETS_VERSION,
        timestamp: new Date().toISOString(),
        data: assets
      };
      localStorage.setItem(ASSETS_KEY, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error('保存资产失败:', error);
      return false;
    }
  }

  /**
   * 加载所有资产
   */
  static loadAssets() {
    try {
      const savedData = localStorage.getItem(ASSETS_KEY);
      if (!savedData) {
        return [];
      }

      const parsed = JSON.parse(savedData);
      
      // 版本检查
      if (parsed.version !== ASSETS_VERSION) {
        console.warn('资产数据版本不匹配，可能需要迁移');
      }

      return parsed.data || [];
    } catch (error) {
      console.error('加载资产失败:', error);
      return [];
    }
  }

  /**
   * 保存单个资产
   */
  static saveAsset(asset) {
    try {
      const assets = this.loadAssets();
      const existingIndex = assets.findIndex(a => a.id === asset.id);
      
      if (existingIndex >= 0) {
        assets[existingIndex] = asset;
      } else {
        assets.push(asset);
      }

      return this.saveAssets(assets);
    } catch (error) {
      console.error('保存资产失败:', error);
      return false;
    }
  }

  /**
   * 加载单个资产
   */
  static loadAsset(assetId) {
    try {
      const assets = this.loadAssets();
      return assets.find(a => a.id === assetId) || null;
    } catch (error) {
      console.error('加载资产失败:', error);
      return null;
    }
  }

  /**
   * 删除资产
   */
  static deleteAsset(assetId) {
    try {
      const assets = this.loadAssets();
      const filteredAssets = assets.filter(a => a.id !== assetId);
      return this.saveAssets(filteredAssets);
    } catch (error) {
      console.error('删除资产失败:', error);
      return false;
    }
  }

  /**
   * 按类型筛选资产
   */
  static filterAssetsByType(type) {
    const assets = this.loadAssets();
    return assets.filter(a => a.type === type);
  }

  /**
   * 按状态筛选资产
   */
  static filterAssetsByStatus(status) {
    const assets = this.loadAssets();
    return assets.filter(a => a.status === status);
  }

  /**
   * 按作者筛选资产
   */
  static filterAssetsByAuthor(author) {
    const assets = this.loadAssets();
    return assets.filter(a => a.author === author);
  }

  /**
   * 搜索资产
   */
  static searchAssets(query) {
    const assets = this.loadAssets();
    const lowerQuery = query.toLowerCase();
    
    return assets.filter(a => 
      a.title.toLowerCase().includes(lowerQuery) ||
      a.description.toLowerCase().includes(lowerQuery) ||
      a.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 获取关联资产
   */
  static getRelatedAssets(assetId) {
    const asset = this.loadAsset(assetId);
    if (!asset || !asset.relatedAssets) {
      return [];
    }

    const assets = this.loadAssets();
    return assets.filter(a => asset.relatedAssets.includes(a.id));
  }

  /**
   * 清除所有资产
   */
  static clearAssets() {
    try {
      localStorage.removeItem(ASSETS_KEY);
      return true;
    } catch (error) {
      console.error('清除资产失败:', error);
      return false;
    }
  }

  /**
   * 导出资产
   */
  static exportAssets() {
    try {
      const assets = this.loadAssets();
      const exportData = {
        version: ASSETS_VERSION,
        exportDate: new Date().toISOString(),
        data: assets
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('导出资产失败:', error);
      return false;
    }
  }

  /**
   * 导入资产
   */
  static importAssets(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          
          // 验证数据格式
          if (!imported.data || !Array.isArray(imported.data)) {
            throw new Error('无效的数据格式');
          }

          // 合并导入的数据
          const existingAssets = this.loadAssets();
          const mergedAssets = [...existingAssets];
          
          imported.data.forEach(importedAsset => {
            const existingIndex = mergedAssets.findIndex(a => a.id === importedAsset.id);
            if (existingIndex >= 0) {
              mergedAssets[existingIndex] = importedAsset;
            } else {
              mergedAssets.push(importedAsset);
            }
          });

          this.saveAssets(mergedAssets);
          resolve(mergedAssets);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }
}

/**
 * 产品存储服务
 */
export class ProductStorageService {
  /**
   * 保存所有产品
   */
  static saveProducts(products) {
    try {
      const dataToSave = {
        version: ASSETS_VERSION,
        timestamp: new Date().toISOString(),
        data: products
      };
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error('保存产品失败:', error);
      return false;
    }
  }

  /**
   * 加载所有产品
   */
  static loadProducts() {
    try {
      const savedData = localStorage.getItem(PRODUCTS_KEY);
      if (!savedData) {
        return [];
      }

      const parsed = JSON.parse(savedData);
      return parsed.data || [];
    } catch (error) {
      console.error('加载产品失败:', error);
      return [];
    }
  }

  /**
   * 保存单个产品
   */
  static saveProduct(product) {
    try {
      const products = this.loadProducts();
      const existingIndex = products.findIndex(p => p.id === product.id);
      
      if (existingIndex >= 0) {
        products[existingIndex] = product;
      } else {
        products.push(product);
      }

      return this.saveProducts(products);
    } catch (error) {
      console.error('保存产品失败:', error);
      return false;
    }
  }

  /**
   * 加载单个产品
   */
  static loadProduct(productId) {
    try {
      const products = this.loadProducts();
      return products.find(p => p.id === productId) || null;
    } catch (error) {
      console.error('加载产品失败:', error);
      return null;
    }
  }

  /**
   * 删除产品
   */
  static deleteProduct(productId) {
    try {
      const products = this.loadProducts();
      const filteredProducts = products.filter(p => p.id !== productId);
      return this.saveProducts(filteredProducts);
    } catch (error) {
      console.error('删除产品失败:', error);
      return false;
    }
  }

  /**
   * 按作者筛选产品
   */
  static filterProductsByAuthor(author) {
    const products = this.loadProducts();
    return products.filter(p => p.author === author);
  }

  /**
   * 按状态筛选产品
   */
  static filterProductsByStatus(status) {
    const products = this.loadProducts();
    return products.filter(p => p.status === status);
  }

  /**
   * 清除所有产品
   */
  static clearProducts() {
    try {
      localStorage.removeItem(PRODUCTS_KEY);
      return true;
    } catch (error) {
      console.error('清除产品失败:', error);
      return false;
    }
  }
}

/**
 * 作者档案存储服务
 */
export class AuthorProfileStorageService {
  /**
   * 保存作者档案
   */
  static saveAuthorProfile(profile) {
    try {
      const dataToSave = {
        version: ASSETS_VERSION,
        timestamp: new Date().toISOString(),
        data: profile
      };
      localStorage.setItem(AUTHOR_PROFILES_KEY, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error('保存作者档案失败:', error);
      return false;
    }
  }

  /**
   * 加载作者档案
   */
  static loadAuthorProfile() {
    try {
      const savedData = localStorage.getItem(AUTHOR_PROFILES_KEY);
      if (!savedData) {
        return null;
      }

      const parsed = JSON.parse(savedData);
      return parsed.data || null;
    } catch (error) {
      console.error('加载作者档案失败:', error);
      return null;
    }
  }

  /**
   * 清除作者档案
   */
  static clearAuthorProfile() {
    try {
      localStorage.removeItem(AUTHOR_PROFILES_KEY);
      return true;
    } catch (error) {
      console.error('清除作者档案失败:', error);
      return false;
    }
  }
}