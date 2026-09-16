// 职业生涯数据存储管理

const CAREER_DATA_KEY = 'beu_career_data';
const CAREER_DATA_VERSION = '1.0.0';

/**
 * 职业生涯数据存储服务
 */
export class CareerStorageService {
  /**
   * 保存职业生涯数据到本地存储
   */
  static saveCareerData(data) {
    try {
      const dataToSave = {
        version: CAREER_DATA_VERSION,
        timestamp: new Date().toISOString(),
        data: data
      };
      localStorage.setItem(CAREER_DATA_KEY, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error('保存职业生涯数据失败:', error);
      return false;
    }
  }

  /**
   * 从本地存储加载职业生涯数据
   */
  static loadCareerData() {
    try {
      const savedData = localStorage.getItem(CAREER_DATA_KEY);
      if (!savedData) {
        return null;
      }

      const parsed = JSON.parse(savedData);
      
      // 版本检查
      if (parsed.version !== CAREER_DATA_VERSION) {
        console.warn('职业生涯数据版本不匹配，可能需要迁移');
      }

      return parsed.data;
    } catch (error) {
      console.error('加载职业生涯数据失败:', error);
      return null;
    }
  }

  /**
   * 清除职业生涯数据
   */
  static clearCareerData() {
    try {
      localStorage.removeItem(CAREER_DATA_KEY);
      return true;
    } catch (error) {
      console.error('清除职业生涯数据失败:', error);
      return false;
    }
  }

  /**
   * 导出职业生涯数据
   */
  static exportCareerData() {
    try {
      const data = this.loadCareerData();
      if (!data) {
        throw new Error('没有可导出的数据');
      }

      const exportData = {
        version: CAREER_DATA_VERSION,
        exportDate: new Date().toISOString(),
        data: data
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `career-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('导出职业生涯数据失败:', error);
      return false;
    }
  }

  /**
   * 导入职业生涯数据
   */
  static importCareerData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          
          // 验证数据格式
          if (!imported.data || !imported.version) {
            throw new Error('无效的数据格式');
          }

          // 保存导入的数据
          const success = this.saveCareerData(imported.data);
          
          if (success) {
            resolve(imported.data);
          } else {
            throw new Error('保存导入数据失败');
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * 备份当前数据
   */
  static backupCareerData() {
    const data = this.loadCareerData();
    if (data) {
      const backupKey = `${CAREER_DATA_KEY}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(data));
      return backupKey;
    }
    return null;
  }

  /**
   * 恢复备份数据
   */
  static restoreBackup(backupKey) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (backupData) {
        const data = JSON.parse(backupData);
        const success = this.saveCareerData(data);
        return success;
      }
      return false;
    } catch (error) {
      console.error('恢复备份数据失败:', error);
      return false;
    }
  }

  /**
   * 获取所有备份列表
   */
  static getBackupList() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${CAREER_DATA_KEY}_backup_`)) {
        const timestamp = key.split('_').pop();
        backups.push({
          key: key,
          timestamp: new Date(parseInt(timestamp)).toISOString()
        });
      }
    }
    return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * 删除指定备份
   */
  static deleteBackup(backupKey) {
    try {
      localStorage.removeItem(backupKey);
      return true;
    } catch (error) {
      console.error('删除备份失败:', error);
      return false;
    }
  }
}