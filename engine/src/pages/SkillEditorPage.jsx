import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useAssets } from '../hooks/useAssets';
import { createSkill } from '../assets/models';

export function SkillEditorPage({ assetId }) {
  const { assets, saveAsset } = useAssets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState(50);
  const [category, setCategory] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [learningPath, setLearningPath] = useState('');
  const [assessmentMethod, setAssessmentMethod] = useState('self-assessment');
  const [projectIds, setProjectIds] = useState('');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    const skill = createSkill({
      id: assetId,
      title,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      level,
      category,
      prerequisites: prerequisites.split(',').map(t => t.trim()).filter(t => t),
      learningPath: learningPath.split(',').map(t => t.trim()).filter(t => t),
      assessmentMethod,
      projectIds: projectIds.split(',').map(t => t.trim()).filter(t => t),
    });
    saveAsset(skill);
  };

  return (
    <div className="skill-editor">
      <PageHeader
        title={assetId ? '编辑 Skill' : '新建 Skill'}
        description="创建或编辑你的技能资产"
      />

      <div className="editor-form">
        <div className="form-group">
          <label>技能名称</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：Claude Code 使用技巧"
          />
        </div>

        <div className="form-group">
          <label>描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述这个技能的核心内容和价值"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>熟练度 (1-100)</label>
          <input
            type="range"
            min="1"
            max="100"
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value))}
          />
          <span className="level-display">{level}%</span>
        </div>

        <div className="form-group">
          <label>分类</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例如：AI、编程、设计"
          />
        </div>

        <div className="form-group">
          <label>前置技能（用逗号分隔）</label>
          <input
            type="text"
            value={prerequisites}
            onChange={(e) => setPrerequisites(e.target.value)}
            placeholder="学习此技能前需要掌握的技能"
          />
        </div>

        <div className="form-group">
          <label>学习路径（用逗号分隔）</label>
          <input
            type="text"
          value={learningPath}
          onChange={(e) => setLearningPath(e.target.value)}
          placeholder="推荐的学习步骤"
          />
        </div>

        <div className="form-group">
          <label>评估方式</label>
          <select value={assessmentMethod} onChange={(e) => setAssessmentMethod(e.target.value)}>
            <option value="self-assessment">自我评估</option>
            <option value="project">项目实践</option>
            <option value="exam">考试</option>
            <option value="peer-review">同行评审</option>
          </select>
        </div>

        <div className="form-group">
          <label>关联项目（用逗号分隔）</label>
          <input
            type="text"
            value={projectIds}
            onChange={(e) => setProjectIds(e.target.value)}
            placeholder="应用此技能的项目 ID"
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