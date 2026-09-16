import { AssetType } from '../assets/models';

export function AssetTypeBadge({ type }) {
  const typeLabels = {
    knowledge: '知识',
    skill: 'Skill',
    prompt: 'Prompt',
    workflow: 'Workflow',
    template: '模板',
    tutorial: '教程',
    case: '案例',
    project: '项目',
    agent: 'Agent',
    tool: '工具',
  };

  const typeColors = {
    knowledge: 'blue',
    skill: 'green',
    prompt: 'purple',
    workflow: 'orange',
    template: 'gray',
    tutorial: 'indigo',
    case: 'pink',
    project: 'teal',
    agent: 'cyan',
    tool: 'slate',
  };

  return (
    <span className={`asset-type-badge asset-type-badge--${typeColors[type] || 'gray'}`}>
      {typeLabels[type] || type}
    </span>
  );
}