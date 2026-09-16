import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useAssets } from '../hooks/useAssets';
import { createPrompt } from '../assets/models';

export function PromptEditorPage({ assetId }) {
  const { assets, saveAsset } = useAssets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('');
  const [variables, setVariables] = useState('');
  const [targetModel, setTargetModel] = useState('gpt-4');
  const [examples, setExamples] = useState('');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    const prompt = createPrompt({
      id: assetId,
      title,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      template,
      variables: variables.split('\n').map(v => {
        const [name, type] = v.split(':').map(s => s.trim());
        return { name, type: type || 'string', required: true };
      }),
      targetModel,
      examples: examples ? JSON.parse(examples) : [],
    });
    saveAsset(prompt);
  };

  return (
    <div className="prompt-editor">
      <PageHeader
        title={assetId ? '编辑 Prompt' : '新建 Prompt'}
        description="创建或编辑你的 Prompt 模板"
      />

      <div className="editor-form">
        <div className="form-group">
          <label>Prompt 名称</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：代码审查 Prompt"
          />
        </div>

        <div className="form-group">
          <label>描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述这个 Prompt 的用途和场景"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>目标模型</label>
          <select value={targetModel} onChange={(e) => setTargetModel(e.target.value)}>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="claude-3-opus">Claude 3 Opus</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            <option value="claude-3-haiku">Claude 3 Haiku</option>
          </select>
        </div>

        <div className="form-group">
          <label>Prompt 模板</label>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder="输入 Prompt 模板，使用 {{variable}} 作为变量占位符"
            rows={10}
            className="code-editor"
          />
        </div>

        <div className="form-group">
          <label>变量（每行一个，格式：name:type）</label>
          <textarea
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            placeholder="例如：\ncode:string\nlanguage:string\nfocus:string"
            rows={5}
          />
        </div>

        <div className="form-group">
          <label>示例（JSON 格式）</label>
          <textarea
            value={examples}
            onChange={(e) => setExamples(e.target.value)}
            placeholder='[{"input": {"code": "..."}, "output": "..."}]'
            rows={5}
            className="code-editor"
          />
        </div>

        <div className="form-group">
          <label>标签（用逗号分隔）</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="例如：Prompt, 代码, 审查"
          />
        </div>

        <div className="editor-actions">
          <button className="btn-primary" onClick={handleSave}>
            保存
          </button>
          <button className="btn-secondary">
            测试
          </button>
          <button className="btn-secondary">
            取消
          </button>
        </div>
      </div>
    </div>
  );
}