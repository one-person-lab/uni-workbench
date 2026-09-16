import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useProducts } from '../hooks/useProducts';

export function ProductLibraryPage() {
  const { products, loading } = useProducts();
  const [filter, setFilter] = useState('all');

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    return product.status === filter;
  });

  return (
    <div className="product-library">
      <PageHeader
        title="产品库"
        description="管理你的数字产品"
      />

      {/* 筛选器 */}
      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部
        </button>
        <button 
          className={`filter-btn ${filter === 'published' ? 'active' : ''}`}
          onClick={() => setFilter('published')}
        >
          已发布
        </button>
        <button 
          className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
          onClick={() => setFilter('draft')}
        >
          草稿
        </button>
      </div>

      {/* 产品列表 */}
      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className="card product-card">
              <div className="product-header">
                <h3>{product.title}</h3>
                <span className={`status-badge status-badge--${product.status}`}>
                  {product.status === 'published' ? '已发布' : '草稿'}
                </span>
              </div>
              <p className="product-description">{product.description}</p>
              
              <div className="product-author">
                <img 
                  src={product.authorProfile.avatar || '/default-avatar.png'} 
                  alt={product.authorProfile.name}
                  className="author-avatar"
                />
                <span className="author-name">{product.authorProfile.name}</span>
              </div>

              <div className="product-pricing">
                {product.pricing.type === 'free' ? (
                  <span className="price-free">免费</span>
                ) : (
                  <span className="price-paid">
                    ¥{product.pricing.amount} / {product.pricing.type === 'subscription' ? '订阅' : '买断'}
                  </span>
                )}
              </div>

              <div className="product-stats">
                <span className="stat-item">浏览: {product.statistics.views}</span>
                <span className="stat-item">销量: {product.statistics.sales}</span>
                <span className="stat-item">评分: {product.statistics.rating}</span>
              </div>

              <div className="product-actions">
                <button className="btn-primary">编辑</button>
                <button className="btn-secondary">预览</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>暂无产品</p>
            <button className="btn-primary">创建新产品</button>
          </div>
        )}
      </div>

      {/* 新建产品按钮 */}
      <button className="btn-primary floating-action">
        + 新建产品
      </button>
    </div>
  );
}