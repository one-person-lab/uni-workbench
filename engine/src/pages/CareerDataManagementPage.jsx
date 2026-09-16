import { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { CareerStorageService } from '../career/storage';

export function CareerDataManagementPage() {
  const [importStatus, setImportStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [backupList, setBackupList] = useState([]);

  const handleExport = () => {
    try {
      const success = CareerStorageService.exportCareerData();
      if (success) {
        setExportStatus({ type: 'success', message: '数据导出成功' });
      } else {
        setExportStatus({ type: 'error', message: '数据导出失败' });
      }
    } catch (error) {
      setExportStatus({ type: 'error', message: '导出过程中发生错误' });
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportStatus({ type: 'loading', message: '正在导入数据...' });

    CareerStorageService.importCareerData(file)
      .then(data => {
        setImportStatus({ type: 'success', message: '数据导入成功' });
        // 可以在这里触发页面刷新或数据重新加载
      })
      .catch(error => {
        setImportStatus({ type: 'error', message: `导入失败: ${error.message}` });
      });
  };

  const handleBackup = () => {
    const backupKey = CareerStorageService.backupCareerData();
    if (backupKey) {
      loadBackupList();
      setExportStatus({ type: 'success', message: '备份创建成功' });
    } else {
      setExportStatus({ type: 'error', message: '备份创建失败' });
    }
  };

  const handleRestoreBackup = (backupKey) => {
    const success = CareerStorageService.restoreBackup(backupKey);
    if (success) {
      setExportStatus({ type: 'success', message: '备份恢复成功' });
      // 可以在这里触发页面刷新
    } else {
      setExportStatus({ type: 'error', message: '备份恢复失败' });
    }
  };

  const handleDeleteBackup = (backupKey) => {
    const success = CareerStorageService.deleteBackup(backupKey);
    if (success) {
      loadBackupList();
      setExportStatus({ type: 'success', message: '备份删除成功' });
    } else {
      setExportStatus({ type: 'error', message: '备份删除失败' });
    }
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有职业生涯数据吗？此操作不可恢复。')) {
      const success = CareerStorageService.clearCareerData();
      if (success) {
        setExportStatus({ type: 'success', message: '数据清除成功' });
        loadBackupList();
      } else {
        setExportStatus({ type: 'error', message: '数据清除失败' });
      }
    }
  };

  const loadBackupList = () => {
    const backups = CareerStorageService.getBackupList();
    setBackupList(backups);
  };

  // 初始化时加载备份列表
  useEffect(() => {
    loadBackupList();
  }, []);

  return (
    <div className="career-data-management">
      <PageHeader
        title="数据管理"
        description="职业生涯数据的导入、导出和备份管理"
      />

      {/* 导出功能 */}
      <section className="section">
        <h2>数据导出</h2>
        <div className="card">
          <p>将您的职业生涯数据导出为 JSON 文件，便于备份和迁移。</p>
          <button className="btn-primary" onClick={handleExport}>
            导出数据
          </button>
          {exportStatus && (
            <div className={`status-message status-${exportStatus.type}`}>
              {exportStatus.message}
            </div>
          )}
        </div>
      </section>

      {/* 导入功能 */}
      <section className="section">
        <h2>数据导入</h2>
        <div className="card">
          <p>从 JSON 文件导入职业生涯数据。这将覆盖当前数据。</p>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="file-input"
          />
          {importStatus && (
            <div className={`status-message status-${importStatus.type}`}>
              {importStatus.message}
            </div>
          )}
        </div>
      </section>

      {/* 备份管理 */}
      <section className="section">
        <h2>备份管理</h2>
        <div className="card">
          <div className="backup-actions">
            <button className="btn-primary" onClick={handleBackup}>
              创建备份
            </button>
            <button className="btn-secondary" onClick={loadBackupList}>
              刷新备份列表
            </button>
          </div>

          {backupList.length > 0 ? (
            <div className="backup-list">
              <h3>可用备份</h3>
              {backupList.map(backup => (
                <div key={backup.key} className="backup-item">
                  <div className="backup-info">
                    <span className="backup-time">
                      {new Date(backup.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="backup-item-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => handleRestoreBackup(backup.key)}
                    >
                      恢复
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => handleDeleteBackup(backup.key)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-backups">暂无备份</p>
          )}
        </div>
      </section>

      {/* 数据清除 */}
      <section className="section">
        <h2>数据清除</h2>
        <div className="card danger-zone">
          <p>清除所有职业生涯数据。此操作不可恢复，请谨慎操作。</p>
          <button className="btn-danger" onClick={handleClearData}>
            清除所有数据
          </button>
        </div>
      </section>
    </div>
  );
}