import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useProducts } from '../hooks/useProducts';

export function ProductDetailPage({ productId }) {
  const { products, loading } = useProducts();
  const [product, setProduct] = useState(null);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const foundProduct = products.find(p => p.id === productId);
  if (!foundProduct) {
    return <div className="error">产品不存在</div>;
  }

  return (
    <div className="product-detail">
      <PageHeader
        title={foundProduct.title}
        description={foundProduct.description}
      />

      {/* 作者信息 */}
      <div className="card author-section">
        <div className="author-header">
          <img 
            src={foundProduct.authorProfile.avatar || '/default-avatar.png'} 
            alt={foundProduct.authorProfile.name}
            className="author-avatar"
          />
          <div className="author-info">
            <h3>{foundProduct.authorProfile.name}</h3>
            <p className="author-bio">{foundProduct.authorProfile.bio}</p>
          </div>
        </div>
        <div className="author-socials">
          {foundProduct.authorProfile.socials.github && (
            <a href={foundProduct.authorProfile.socials.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
          {foundProduct.authorProfile.socials.website && (
            <a href={foundProduct.authorProfile.socials.website} target="_blank" rel="noopener noreferrer">
              个人网站
            </a>
          )}
        </div>
      </div>

      {/* 产品定价 */}
      <div className="card pricing-section">
        <h3>定价</h3>
        {foundProduct.pricing.type === 'free' ? (
          <span className="price-large price-free">免费</span>
        ) : (
          <div className="price-large">
            <span className="amount">¥{foundProduct.pricing.amount}</span>
            <span className="type">
              {foundProduct.pricing.type === 'subscription' ? '/ 订阅' : '/ 买断'}
            </span>
          </div>
        )}
      </div>

      {/* 包含的资产 */}
      <div className="card assets-section">
        <h3>包含内容</h3>
        <div className="assets-list">
          {foundProduct.assets.map((item, index) => (
            <div key={index} className="asset-item">
              <span className="asset-type">{item.type}</span>
              <span className="asset-included">
                {item.included ? '✓' : '○'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 统计数据 */}
      <div className="card stats-section">
        <h3>数据统计</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="label">浏览量</span>
            <span className="value">{foundProduct.statistics.views}</span>
          </div>
          <div className="stat-item">
            <span className="label">销量</span>
            <span className="value">{foundProduct.statistics.sales}</span>
          </div>
          <div className="stat-item">
            <span className="label">评分</span>
            <span className="value">{foundProduct.statistics.rating}</span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="product-actions">
        <button className="btn-primary">编辑产品</button>
        <button className="btn-secondary">预览产品页</button>
        <button className="btn-secondary">发布</button>
        <button className="btn-danger">删除</button>
      </div>
    </div>
  );
}