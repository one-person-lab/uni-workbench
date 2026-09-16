import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useProducts } from '../hooks/useProducts';
import { createProduct } from '../assets/models';

export function ProductEditorPage({ productId }) {
  const { products, saveProduct } = useProducts();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');
  const [pricingType, setPricingType] = useState('free');
  const [pricingAmount, setPricingAmount] = useState('');
  const [status, setStatus] = useState('draft');

  const handleSave = () => {
    const product = createProduct({
      id: productId,
      title,
      description,
      author: authorName,
      authorProfile: {
        name: authorName,
        bio: authorBio,
        avatar: authorAvatar,
        socials: {},
      },
      status,
      pricing: {
        type: pricingType,
        amount: pricingAmount ? parseFloat(pricingAmount) : undefined,
        currency: 'CNY',
      },
      assets: [],
    });
    saveProduct(product);
  };

  return (
    <div className="product-editor">
      <PageHeader
        title={productId ? '编辑产品' : '新建产品'}
        description="创建或编辑你的数字产品"
      />

      <div className="editor-form">
        {/* 基本信息 */}
        <div className="form-section">
          <h3>基本信息</h3>
          <div className="form-group">
            <label>产品名称</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：AI 编程工作流 Pro"
            />
          </div>

          <div className="form-group">
            <label>产品描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述这个产品的核心价值和解决的问题"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>状态</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>
          </div>
        </div>

        {/* 作者信息 */}
        <div className="form-section">
          <h3>作者信息（个人品牌）</h3>
          <div className="form-group">
            <label>作者名称</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="你的名字或品牌名"
            />
          </div>

          <div className="form-group">
            <label>个人简介</label>
            <textarea
              value={authorBio}
              onChange={(e) => setAuthorBio(e.target.value)}
              placeholder="简短介绍你的专业背景和经验"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>头像 URL</label>
            <input
              type="text"
              value={authorAvatar}
              onChange={(e) => setAuthorAvatar(e.target.value)}
              placeholder="你的头像图片链接"
            />
          </div>
        </div>

        {/* 定价信息 */}
        <div className="form-section">
          <h3>定价</h3>
          <div className="form-group">
            <label>定价类型</label>
            <select value={pricingType} onChange={(e) => setPricingType(e.target.value)}>
              <option value="free">免费</option>
              <option value="one-time">买断制</option>
              <option value="subscription">订阅制</option>
            </select>
          </div>

          {pricingType !== 'free' && (
            <div className="form-group">
              <label>价格（CNY）</label>
              <input
                type="number"
                value={pricingAmount}
                onChange={(e) => setPricingAmount(e.target.value)}
                placeholder="例如：99"
              />
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="editor-actions">
          <button className="btn-primary" onClick={handleSave}>
            保存
          </button>
          <button className="btn-secondary">
            预览产品页
          </button>
          <button className="btn-secondary">
            取消
          </button>
        </div>
      </div>
    </div>
  );
}