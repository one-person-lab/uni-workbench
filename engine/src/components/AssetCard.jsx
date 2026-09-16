import { useState } from 'react';
import { AssetTypeBadge } from '../components/AssetTypeBadge';

export function AssetCard({ type, title, description, tags, status, onClick }) {
  return (
    <div className="card asset-card" onClick={onClick}>
      <div className="asset-card-header">
        <AssetTypeBadge type={type} />
        <span className={`status-badge status-badge--${status}`}>
          {status === 'published' ? '已发布' : '草稿'}
        </span>
      </div>
      <h3 className="asset-card-title">{title}</h3>
      <p className="asset-card-description">{description}</p>
      <div className="asset-card-tags">
        {tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}