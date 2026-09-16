import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { AssetTypeBadge } from '../components/AssetTypeBadge';
import { AssetCard } from '../components/AssetCard';
import { useAssets } from '../assets/useAssets';
import { AssetType, AssetStatus } from '../assets/models';

export function AssetLibraryPage() {
  const navigate = useNavigate();
  const { assets, loading, error, filterByType, filterByStatus, searchAssets, deleteAsset } = useAssets();
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAssets, setFilteredAssets] = useState([]);

  // 筛选资产
  useEffect(() => {
    let result = assets;

    // 按类型筛选
    if (filterType !== 'all') {
      result = result.filter(a => a.type === filterType);
    }

    // 按状态筛选
    if (filterStatus !== 'all') {
      result = result.filter(a => a.status === filterStatus);
    }

    // 搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredAssets(result);
  }, [assets, filterType, filterStatus, searchQuery]);

  const handleCardClick = (assetId) => {
    navigate(`/assets/${assetId}`);
  };

  const handleCreateAsset = () => {
    navigate('/assets/new');
  };

  const handleDeleteAsset = async (assetId, event) => {
    event.stopPropagation();
    if (window.confirm('确定要删除这个资产吗？')) {
      await deleteAsset(assetId);
    }
  };

  if (loading) {
    return (
      <div className="asset-library">
        <PageHeader
          title="资产库"
          description="管理你的个人能力资产"
        />
        <div className="loading-state">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="asset-library">
        <PageHeader
          title="资产库"
          description="管理你的个人能力资产"
        />
        <div className="error-state">加载失败: {error}</div>
      </div>
    );
  }

  return (
    <div className="asset-library">
      <PageHeader
        title="资产库"
        description="把你的能力变成资产，再把资产变成产品"
      />

      {/* 搜索栏 */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="搜索资产..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* 筛选栏 */}
      <div className="filter-bar">
        <div className="filter-group">
          <span className="filter-label">类型:</span>
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            全部
          </button>
          <button
            className={`filter-btn ${filterType === AssetType.SKILL ? 'active' : ''}`}
            onClick={() => setFilterType(AssetType.SKILL)}
          >
            Skill
          </button>
          <button
            className={`filter-btn ${filterType === AssetType.PROMPT ? 'active' : ''}`}
            onClick={() => setFilterType(AssetType.PROMPT)}
          >
            Prompt
          </button>
          <button
            className={`filter-btn ${filterType === AssetType.WORKFLOW ? 'active' : ''}`}
            onClick={() => setFilterType(AssetType.WORKFLOW)}
          >
            Workflow
          </button>
          <button
            className={`filter-btn ${filterType === AssetType.TEMPLATE ? 'active' : ''}`}
            onClick={() => setFilterType(AssetType.TEMPLATE)}
          >
            Template
          </button>
          <button
            className={`filter-btn ${filterType === AssetType.TUTORIAL ? 'active' : ''}`}
            onClick={() => setFilterType(AssetType.TUTORIAL)}
          >
            Tutorial
          </button>
          <button
            className={`filter-btn ${filterType === AssetType.CASE ? 'active' : ''}`}
            onClick={() => setFilterType(AssetType.CASE)}
          >
            Case
          </button>
        </div>

        <div className="filter-group">
          <span className="filter-label">状态:</span>
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            全部
          </button>
          <button
            className={`filter-btn ${filterStatus === AssetStatus.PUBLISHED ? 'active' : ''}`}
            onClick={() => setFilterStatus(AssetStatus.PUBLISHED)}
          >
            已发布
          </button>
          <button
            className={`filter-btn ${filterStatus === AssetStatus.DRAFT ? 'active' : ''}`}
            onClick={() => setFilterStatus(AssetStatus.DRAFT)}
          >
            草稿
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="statistics-bar">
        <span className="stat-item">总计: {filteredAssets.length}</span>
        <span className="stat-item">已发布: {filteredAssets.filter(a => a.status === AssetStatus.PUBLISHED).length}</span>
        <span className="stat-item">草稿: {filteredAssets.filter(a => a.status === AssetStatus.DRAFT).length}</span>
      </div>

      {/* 资产列表 */}
      {filteredAssets.length === 0 ? (
        <div className="empty-state">
          <p>还没有资产</p>
          <p className="empty-hint">点击下方按钮创建你的第一个资产</p>
        </div>
      ) : (
        <div className="assets-grid">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="asset-card-wrapper">
              <AssetCard
                type={asset.type}
                title={asset.title}
                description={asset.description}
                tags={asset.tags}
                status={asset.status}
                onClick={() => handleCardClick(asset.id)}
              />
              <button
                className="btn-delete-asset"
                onClick={(e) => handleDeleteAsset(asset.id, e)}
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 新建资产按钮 */}
      <button className="btn-primary floating-action" onClick={handleCreateAsset}>
        + 新建资产
      </button>
    </div>
  );
}