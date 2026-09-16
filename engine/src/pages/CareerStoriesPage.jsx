import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useCareerData } from '../hooks/useCareerData';

export function CareerStoriesPage() {
  const { careerData, loading } = useCareerData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showEditor, setShowEditor] = useState(false);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const stories = careerData?.stories || [];

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'project_success', name: '项目成功' },
    { id: 'technical_challenge', name: '技术难题' },
    { id: 'incident_handling', name: '故障处理' },
    { id: 'performance_optimization', name: '性能优化' },
    { id: 'architecture_decision', name: '架构决策' },
    { id: 'team_collaboration', name: '团队协作' },
    { id: 'conflict_handling', name: '冲突处理' },
    { id: 'project_delivery', name: '项目交付' },
    { id: 'failure_review', name: '失败复盘' },
  ];

  const filteredStories = stories.filter(story => {
    return selectedCategory === 'all' || story.category === selectedCategory;
  });

  return (
    <div className="career-stories">
      <PageHeader
        title="面试故事库"
        description="基于 STAR 模型的面试故事积累"
      />

      <div className="stories-actions">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button 
          className="btn-primary"
          onClick={() => setShowEditor(true)}
        >
          创建新故事
        </button>
      </div>

      {/* 故事列表 */}
      <div className="stories-list">
        {filteredStories.length > 0 ? (
          filteredStories.map(story => (
            <div key={story.id} className="card story-card">
              <div className="story-header">
                <h3>{story.title}</h3>
                <span className="category-tag">{story.category}</span>
                <span className="usage-count">使用 {story.usageCount} 次</span>
              </div>

              <div className="star-content">
                <div className="star-section">
                  <h4>Situation (情境)</h4>
                  <p>{story.situation}</p>
                </div>
                <div className="star-section">
                  <h4>Task (任务)</h4>
                  <p>{story.task}</p>
                </div>
                <div className="star-section">
                  <h4>Action (行动)</h4>
                  <p>{story.action}</p>
                </div>
                <div className="star-section">
                  <h4>Result (结果)</h4>
                  <p>{story.result}</p>
                </div>
                <div className="star-section">
                  <h4>Reflection (反思)</h4>
                  <p>{story.reflection}</p>
                </div>
              </div>

              {story.relatedProjects?.length > 0 && (
                <div className="related-projects">
                  <span className="label">相关项目:</span>
                  {story.relatedProjects.map((project, index) => (
                    <span key={index} className="tag">{project}</span>
                  ))}
                </div>
              )}

              {story.relatedSkills?.length > 0 && (
                <div className="related-skills">
                  <span className="label">相关技能:</span>
                  {story.relatedSkills.map((skill, index) => (
                    <span key={index} className="tag">{skill}</span>
                  ))}
                </div>
              )}

              <div className="story-actions">
                <button className="btn-secondary">编辑故事</button>
                <button className="btn-secondary">标记为使用</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>暂无面试故事</p>
            <button className="btn-primary" onClick={() => setShowEditor(true)}>
              创建第一个故事
            </button>
          </div>
        )}
      </div>

      {/* 故事编辑器 */}
      {showEditor && (
        <div className="modal story-editor">
          <div className="modal-content">
            <div className="modal-header">
              <h3>创建面试故事</h3>
              <button className="close-btn" onClick={() => setShowEditor(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>故事标题</label>
                <input placeholder="给故事起个标题" />
              </div>
              <div className="form-group">
                <label>分类</label>
                <select>
                  {categories.slice(1).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Situation (情境)</label>
                <textarea placeholder="描述当时的情况和背景" />
              </div>
              <div className="form-group">
                <label>Task (任务)</label>
                <textarea placeholder="描述你面临的任务和挑战" />
              </div>
              <div className="form-group">
                <label>Action (行动)</label>
                <textarea placeholder="描述你采取的具体行动和步骤" />
              </div>
              <div className="form-group">
                <label>Result (结果)</label>
                <textarea placeholder="描述最终的结果和影响" />
              </div>
              <div className="form-group">
                <label>Reflection (反思)</label>
                <textarea placeholder="总结经验教训和改进方向" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditor(false)}>
                取消
              </button>
              <button className="btn-primary">保存故事</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}