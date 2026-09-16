import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useAssets } from '../hooks/useAssets';
import { AssetTypeBadge } from '../components/AssetTypeBadge';

export function AssetDetailPage({ assetId }) {
  const { assets, loading } = useAssets();
  const [asset, setAsset] = useState(null);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  // 查找资产
  const foundAsset = assets.find(a => a.id === assetId);
  if (!foundAsset) {
    return <div className="error">资产不存在</div>;
  }

  return (
    <div className="asset-detail">
      <PageHeader
        title={foundAsset.title}
        description={foundAsset.description}
      />

      <div className="asset-detail-header">
        <AssetTypeBadge type={foundAsset.type} />
        <span className={`status-badge status-badge--${foundAsset.status}`}>
          {foundAsset.status === 'published' ? '已发布' : '草稿'}
        </span>
      </div>

      <div className="card asset-content">
        <h2>内容</h2>
        <pre>{JSON.stringify(foundAsset.content, null, 2)}</pre>
      </div>

      <div className="asset-meta">
        <div className="meta-item">
          <span className="label">作者:</span>
          <span className="value">{foundAsset.author}</span>
        </div>
        <div className="meta-item">
          <span className="label">版本:</span>
          <span className="value">{foundAsset.version}</span>
        </div>
        <div className="meta-item">
          <span className="label">创建时间:</span>
          <span className="value">{new Date(foundAsset.createdAt).toLocaleString()}</span>
        </div>
        <div className="meta-item">
          <span className="label">更新时间:</span>
          <span className="value">{new Date(foundAsset.updatedAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="asset-tags">
        <h3>标签</h3>
        <div className="tags-container">
          {foundAsset.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      <div className="asset-actions">
        <button className="btn-primary">编辑</button>
        <button className="btn-secondary">组合到产品</button>
        <button className="btn-secondary">复制</button>
        <button className="btn-danger">删除</button>
      </div>
    </div>
  );
}