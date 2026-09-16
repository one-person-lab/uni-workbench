import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useCareerData } from '../hooks/useCareerData';

export function CareerSkillsPage() {
  const { careerData, loading } = useCareerData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const skills = careerData?.skills || [];

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'programming', name: '编程语言' },
    { id: 'framework', name: '框架' },
    { id: 'database', name: '数据库' },
    { id: 'middleware', name: '中间件' },
    { id: 'devops', name: 'DevOps' },
    { id: 'architecture', name: '架构' },
    { id: 'ai', name: 'AI/ML' },
    { id: 'soft', name: '软技能' },
  ];

  const filteredSkills = skills.filter(skill => {
    const categoryMatch = selectedCategory === 'all' || skill.category === selectedCategory;
    const searchMatch = !searchQuery || 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="career-skills">
      <PageHeader
        title="技能"
        description="我的技能清单与评估"
      />

      {/* 搜索和筛选 */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="搜索技能..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
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
      </div>

      {/* 技能列表 */}
      <div className="skills-grid">
        {filteredSkills.length > 0 ? (
          filteredSkills.map(skill => (
            <div key={skill.id} className="card skill-card">
              <div className="skill-header">
                <h3>{skill.name}</h3>
                <span className="category-tag">{skill.category}</span>
              </div>
              <p className="skill-description">{skill.description}</p>
              
              <div className="skill-level">
                <span className="label">熟练度:</span>
                <div className="level-bar">
                  <div 
                    className="level-fill" 
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
                <span className="level-value">{skill.level}%</span>
              </div>

              <div className="skill-meta">
                <div className="meta-item">
                  <span className="label">使用年限:</span>
                  <span className="value">{skill.experience}年</span>
                </div>
                <div className="meta-item">
                  <span className="label">项目数:</span>
                  <span className="value">{skill.projectCount}</span>
                </div>
              </div>

              {skill.relatedProjects?.length > 0 && (
                <div className="related-projects">
                  <span className="label">相关项目:</span>
                  {skill.relatedProjects.map((project, index) => (
                    <span key={index} className="tag">{project}</span>
                  ))}
                </div>
              )}

              <div className="skill-actions">
                <button className="btn-secondary">评估技能</button>
                <button className="btn-secondary">添加项目经验</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>暂无技能记录</p>
            <button className="btn-primary">添加新技能</button>
          </div>
        )}
      </div>
    </div>
  );
}