import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useCareerData } from '../hooks/useCareerData';

export function CareerQuestionsPage() {
  const { careerData, loading } = useCareerData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const questions = careerData?.questions || [];

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'java', name: 'Java' },
    { id: 'go', name: 'Go' },
    { id: 'mysql', name: 'MySQL' },
    { id: 'redis', name: 'Redis' },
    { id: 'jvm', name: 'JVM' },
    { id: 'mq', name: 'MQ' },
    { id: 'spring', name: 'Spring' },
    { id: 'microservices', name: '微服务' },
    { id: 'system_design', name: '系统设计' },
    { id: 'ai', name: 'AI' },
    { id: 'rag', name: 'RAG' },
    { id: 'agent', name: 'Agent' },
    { id: 'project', name: '项目' },
  ];

  const filteredQuestions = questions.filter(question => {
    const categoryMatch = selectedCategory === 'all' || question.category === selectedCategory;
    const searchMatch = !searchQuery || 
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.myAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="career-questions">
      <PageHeader
        title="面试题库"
        description="我的面试知识系统"
      />

      {/* 搜索和筛选 */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="搜索面试题..."
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

      {/* 面试题列表 */}
      <div className="questions-list">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(question => (
            <div key={question.id} className="card question-card">
              <div className="question-header">
                <span className="category-tag">{question.category}</span>
                <span className="quality-score">质量: {question.quality}/5</span>
              </div>
              <h3>{question.question}</h3>
              <div className="question-answer">
                <h4>我的回答:</h4>
                <p>{question.myAnswer}</p>
              </div>
              {question.relatedProjects?.length > 0 && (
                <div className="related-projects">
                  <span className="label">相关项目:</span>
                  {question.relatedProjects.map((project, index) => (
                    <span key={index} className="tag">{project}</span>
                  ))}
                </div>
              )}
              {question.relatedSkills?.length > 0 && (
                <div className="related-skills">
                  <span className="label">相关技能:</span>
                  {question.relatedSkills.map((skill, index) => (
                    <span key={index} className="tag">{skill}</span>
                  ))}
                </div>
              )}
              <div className="question-actions">
                <button className="btn-secondary">编辑回答</button>
                <button className="btn-secondary">添加追问</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>暂无面试题记录</p>
            <button className="btn-primary">添加新面试题</button>
          </div>
        )}
      </div>
    </div>
  );
}