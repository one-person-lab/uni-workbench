import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useAssets } from '../hooks/useAssets';
import { createWorkflow } from '../assets/models';

export function WorkflowEditorPage({ assetId }) {
  const { assets, saveAsset } = useAssets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [inputs, setInputs] = useState('');
  const [outputs, setOutputs] = useState('');
  const [requiredAssets, setRequiredAssets] = useState('');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    const workflow = createWorkflow({
      id: assetId,
      title,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      steps: steps ? JSON.parse(steps) : [],
      inputs: inputs ? JSON.parse(inputs) : {},
      outputs: outputs ? JSON.parse(outputs) : {},
      requiredAssets: requiredAssets.split(',').map(t => t.trim()).filter(t => t),
    });
    saveAsset(workflow);
  };

  return (
    <div className="workflow-editor">
      <PageHeader
        title={assetId ? '编辑 Workflow' : '新建 Workflow'}
        description="创建或编辑你的工作流"
      />

      <div className="editor-form">
        <div className="form-group">
          <label>工作流名称</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：AI 编程工作流"
          />
        </div>

        <div className="form-group">
          <label>描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述这个工作流的用途和执行步骤"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>执行步骤（JSON 格式）</label>
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder='[{"id": "step1", "type": "prompt", "name": "生成代码", "config": {...}, "nextSteps": ["step2"]}]'
            rows={10}
            className="code-editor"
          />
        </div>

        <div className="form-group">
          <label>输入参数（JSON 格式）</label>
          <textarea
            value={inputs}
            onChange={(e) => setInputs(e.target.value)}
            placeholder='{"prompt": "string", "context": "object"}'
            rows={5}
            className="code-editor"
          />
        </div>

        <div className="form-group">
          <label>输出结果（JSON 格式）</label>
          <textarea
            value={outputs}
            onChange={(e) => setOutputs(e.target.value)}
            placeholder='{"code": "string", "explanation": "string"}'
            rows={5}
            className="code-editor"
          />
        </div>

        <div className="form-group">
          <label>依赖资产（用逗号分隔）</label>
          <input
            type="text"
            value={requiredAssets}
            onChange={(e) => setRequiredAssets(e.target.value)}
            placeholder="此工作流依赖的 Asset ID"
          />
        </div>

        <div className="form-group">
          <label>标签（用逗号分隔）</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="例如：Workflow, AI, 自动化"
          />
        </div>

        <div className="editor-actions">
          <button className="btn-primary" onClick={handleSave}>
            保存
          </button>
          <button className="btn-secondary">
            测试运行
          </button>
          <button className="btn-secondary">
            取消
          </button>
        </div>
      </div>
    </div>
  );
}