import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useAssets } from '../hooks/useAssets';
import { AssetType } from '../assets/models';

export function AssetEditorPage({ assetId }) {
  const { assets, saveAsset } = useAssets();
  const [asset, setAsset] = useState(null);
  const [type, setType] = useState(AssetType.KNOWLEDGE);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');

  const handleSave = () => {
    const newAsset = {
      id: assetId,
      type,
      title,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      content: JSON.parse(content || '{}'),
      status,
    };
    saveAsset(newAsset);
  };

  return (
    <div className="asset-editor">
      <PageHeader
        title={assetId ? '编辑资产' : '新建资产'}
        description="创建或编辑你的能力资产"
      />

      <div className="editor-form">
        <div className="form-group">
          <label>资产类型</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value={AssetType.KNOWLEDGE}>知识</option>
            <option value={AssetType.SKILL}>Skill</option>
            <option value={AssetType.PROMPT}>Prompt</option>
            <option value={AssetType.WORKFLOW}>Workflow</option>
            <option value={AssetType.TEMPLATE}>模板</option>
            <option value={AssetType.TUTORIAL}>教程</option>
            <option value={AssetType.CASE}>案例</option>
            <option value={AssetType.PROJECT}>项目</option>
            <option value={AssetType.AGENT}>Agent</option>
            <option value={AssetType.TOOL}>工具</option>
          </select>
        </div>

        <div className="form-group">
          <label>标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入资产标题"
          />
        </div>

        <div className="form-group">
          <label>描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="输入资产描述"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>标签（用逗号分隔）</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="例如：AI, 编程, 效率"
          />
        </div>

        <div className="form-group">
          <label>内容（JSON）</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='{"key": "value"}'
            rows={10}
            className="code-editor"
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

        <div className="editor-actions">
          <button className="btn-primary" onClick={handleSave}>
            保存
          </button>
          <button className="btn-secondary">
            预览
          </button>
          <button className="btn-secondary">
            取消
          </button>
        </div>
      </div>
    </div>
  );
}