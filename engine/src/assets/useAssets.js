import { useState, useEffect, useCallback } from 'react';
import { AssetStorageService, ProductStorageService, AuthorProfileStorageService } from './storage';
import { createAsset, createSkill, createPrompt, createWorkflow, createTemplate, createTutorial, createCase, createProduct, createAuthorProfile, AssetType, AssetStatus, ProductStatus } from './models';

/**
 * 资产管理 Hook
 * 提供资产 CRUD 操作的核心能力
 */
export const useAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载所有资产
  const loadAssets = useCallback(() => {
    setLoading(true);
    try {
      const loadedAssets = AssetStorageService.loadAssets();
      setAssets(loadedAssets);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化时加载资产
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // 创建资产
  const createAssetItem = useCallback((assetData) => {
    let newAsset;
    
    // 根据类型选择创建函数
    switch (assetData.type) {
      case AssetType.SKILL:
        newAsset = createSkill(assetData);
        break;
      case AssetType.PROMPT:
        newAsset = createPrompt(assetData);
        break;
      case AssetType.WORKFLOW:
        newAsset = createWorkflow(assetData);
        break;
      case AssetType.TEMPLATE:
        newAsset = createTemplate(assetData);
        break;
      case AssetType.TUTORIAL:
        newAsset = createTutorial(assetData);
        break;
      case AssetType.CASE:
        newAsset = createCase(assetData);
        break;
      default:
        newAsset = createAsset(assetData);
    }

    const success = AssetStorageService.saveAsset(newAsset);
    if (success) {
      setAssets(prev => [...prev, newAsset]);
      return newAsset;
    }
    return null;
  }, []);

  // 更新资产
  const updateAsset = useCallback((assetId, updates) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return null;

    const updatedAsset = {
      ...asset,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const success = AssetStorageService.saveAsset(updatedAsset);
    if (success) {
      setAssets(prev => prev.map(a => a.id === assetId ? updatedAsset : a));
      return updatedAsset;
    }
    return null;
  }, [assets]);

  // 删除资产
  const deleteAsset = useCallback((assetId) => {
    const success = AssetStorageService.deleteAsset(assetId);
    if (success) {
      setAssets(prev => prev.filter(a => a.id !== assetId));
      return true;
    }
    return false;
  }, []);

  // 按类型筛选
  const filterByType = useCallback((type) => {
    return assets.filter(a => a.type === type);
  }, [assets]);

  // 按状态筛选
  const filterByStatus = useCallback((status) => {
    return assets.filter(a => a.status === status);
  }, [assets]);

  // 按作者筛选
  const filterByAuthor = useCallback((author) => {
    return assets.filter(a => a.author === author);
  }, [assets]);

  // 搜索资产
  const searchAssets = useCallback((query) => {
    if (!query) return assets;
    return AssetStorageService.searchAssets(query);
  }, [assets]);

  // 获取关联资产
  const getRelatedAssets = useCallback((assetId) => {
    return AssetStorageService.getRelatedAssets(assetId);
  }, []);

  // 导出资产
  const exportAssets = useCallback(() => {
    return AssetStorageService.exportAssets();
  }, []);

  // 导入资产
  const importAssets = useCallback((file) => {
    return AssetStorageService.importAssets(file).then(mergedAssets => {
      setAssets(mergedAssets);
      return mergedAssets;
    });
  }, []);

  return {
    assets,
    loading,
    error,
    loadAssets,
    createAsset: createAssetItem,
    updateAsset,
    deleteAsset,
    filterByType,
    filterByStatus,
    filterByAuthor,
    searchAssets,
    getRelatedAssets,
    exportAssets,
    importAssets,
  };
};

/**
 * 产品管理 Hook
 * 提供产品 CRUD 操作的核心能力
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载所有产品
  const loadProducts = useCallback(() => {
    setLoading(true);
    try {
      const loadedProducts = ProductStorageService.loadProducts();
      setProducts(loadedProducts);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化时加载产品
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // 创建产品
  const createProductItem = useCallback((productData) => {
    const newProduct = createProduct(productData);
    const success = ProductStorageService.saveProduct(newProduct);
    if (success) {
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    }
    return null;
  }, []);

  // 更新产品
  const updateProduct = useCallback((productId, updates) => {
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const success = ProductStorageService.saveProduct(updatedProduct);
    if (success) {
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      return updatedProduct;
    }
    return null;
  }, [products]);

  // 删除产品
  const deleteProduct = useCallback((productId) => {
    const success = ProductStorageService.deleteProduct(productId);
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      return true;
    }
    return false;
  }, []);

  // 添加资产到产品
  const addAssetToProduct = useCallback((productId, assetId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    if (product.assets.includes(assetId)) {
      return product; // 已经存在
    }

    const updatedProduct = {
      ...product,
      assets: [...product.assets, assetId],
      updatedAt: new Date().toISOString(),
    };

    const success = ProductStorageService.saveProduct(updatedProduct);
    if (success) {
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      return updatedProduct;
    }
    return null;
  }, [products]);

  // 从产品移除资产
  const removeAssetFromProduct = useCallback((productId, assetId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    const updatedProduct = {
      ...product,
      assets: product.assets.filter(id => id !== assetId),
      updatedAt: new Date().toISOString(),
    };

    const success = ProductStorageService.saveProduct(updatedProduct);
    if (success) {
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      return updatedProduct;
    }
    return null;
  }, [products]);

  // 按状态筛选
  const filterByStatus = useCallback((status) => {
    return products.filter(p => p.status === status);
  }, [products]);

  // 按作者筛选
  const filterByAuthor = useCallback((author) => {
    return products.filter(p => p.author === author);
  }, [products]);

  // 搜索产品
  const searchProducts = useCallback((query) => {
    if (!query) return products;
    const lowerQuery = query.toLowerCase();
    return products.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  }, [products]);

  // 发布产品
  const publishProduct = useCallback((productId) => {
    return updateProduct(productId, {
      status: ProductStatus.PUBLISHED,
      publishedAt: new Date().toISOString(),
    });
  }, [updateProduct]);

  // 归档产品
  const archiveProduct = useCallback((productId) => {
    return updateProduct(productId, {
      status: ProductStatus.ARCHIVED,
    });
  }, [updateProduct]);

  return {
    products,
    loading,
    error,
    loadProducts,
    createProduct: createProductItem,
    updateProduct,
    deleteProduct,
    addAssetToProduct,
    removeAssetFromProduct,
    filterByStatus,
    filterByAuthor,
    searchProducts,
    publishProduct,
    archiveProduct,
  };
};

/**
 * 作者档案管理 Hook
 * 提供作者档案 CRUD 操作的核心能力
 */
export const useAuthorProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载所有作者档案
  const loadProfiles = useCallback(() => {
    setLoading(true);
    try {
      const loadedProfiles = AuthorProfileStorageService.loadAuthorProfiles();
      setProfiles(loadedProfiles);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化时加载作者档案
  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // 创建作者档案
  const createProfile = useCallback((profileData) => {
    const newProfile = createAuthorProfile(profileData);
    const success = AuthorProfileStorageService.saveAuthorProfile(newProfile);
    if (success) {
      setProfiles(prev => [...prev, newProfile]);
      return newProfile;
    }
    return null;
  }, []);

  // 更新作者档案
  const updateProfile = useCallback((profileId, updates) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return null;

    const updatedProfile = {
      ...profile,
      ...updates,
    };

    const success = AuthorProfileStorageService.saveAuthorProfile(updatedProfile);
    if (success) {
      setProfiles(prev => prev.map(p => p.id === profileId ? updatedProfile : p));
      return updatedProfile;
    }
    return null;
  }, [profiles]);

  // 删除作者档案
  const deleteProfile = useCallback((profileId) => {
    const success = AuthorProfileStorageService.deleteAuthorProfile(profileId);
    if (success) {
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      return true;
    }
    return false;
  }, []);

  // 获取当前用户的档案（假设只有一个）
  const getCurrentProfile = useCallback(() => {
    return profiles.length > 0 ? profiles[0] : null;
  }, [profiles]);

  return {
    profiles,
    loading,
    error,
    loadProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    getCurrentProfile,
  };
};

/**
 * 组合 Hook - 同时管理资产和产品
 * 用于需要同时操作资产和产品的场景
 */
export const useAssetWorkbench = () => {
  const assetsHook = useAssets();
  const productsHook = useProducts();
  const authorProfilesHook = useAuthorProfiles();

  // 获取产品包含的所有资产
  const getProductAssets = useCallback((productId) => {
    const product = productsHook.products.find(p => p.id === productId);
    if (!product) return [];

    return assetsHook.assets.filter(asset => 
      product.assets.includes(asset.id)
    );
  }, [productsHook.products, assetsHook.assets]);

  // 统计数据
  const getStatistics = useCallback(() => {
    return {
      totalAssets: assetsHook.assets.length,
      totalProducts: productsHook.products.length,
      publishedProducts: productsHook.products.filter(p => p.status === ProductStatus.PUBLISHED).length,
      assetsByType: Object.values(AssetType).reduce((acc, type) => {
        acc[type] = assetsHook.assets.filter(a => a.type === type).length;
        return acc;
      }, {}),
    };
  }, [assetsHook.assets, productsHook.products]);

  return {
    ...assetsHook,
    ...productsHook,
    ...authorProfilesHook,
    getProductAssets,
    getStatistics,
  };
};