import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useCareerData } from '../hooks/useCareerData';

export function CareerProjectInterviewPage({ projectId }) {
  const { careerData, loading } = useCareerData();
  const [activeSection, setActiveSection] = useState('overview');

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const project = careerData?.projectInterviews?.find(p => p.projectId === projectId);

  if (!project) {
    return <div className="error">项目不存在</div>;
  }

  return (
    <div className="career-project-interview">
      <PageHeader
        title={project.introduction}
        description="项目面试准备与问答"
      />

      {/* Tab 导航 */}
      <div className="tab-nav">
        <button 
          className={`tab-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          项目概览
        </button>
        <button 
          className={`tab-btn ${activeSection === 'architecture' ? 'active' : ''}`}
          onClick={() => setActiveSection('architecture')}
        >
          技术架构
        </button>
        <button 
          className={`tab-btn ${activeSection === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveSection('challenges')}
        >
          技术难点
        </button>
        <button 
          className={`tab-btn ${activeSection === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveSection('questions')}
        >
          面试问答
        </button>
      </div>

      {/* Tab 内容 */}
      <div className="tab-content">
        {activeSection === 'overview' && (
          <div className="card project-overview">
            <h3>项目介绍</h3>
            <p>{project.introduction}</p>
            
            <h3>我的职责</h3>
            <ul>
              {project.responsibilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>技术栈</h3>
            <div className="tech-tags">
              {project.techStack.map((tech, index) => (
                <span key={index} className="tag">{tech}</span>
              ))}
            </div>

            <h3>项目成果</h3>
            <ul>
              {project.outcomes.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {activeSection === 'architecture' && (
          <div className="card project-architecture">
            <h3>技术架构</h3>
            <p>{project.architecture}</p>
            
            <h3>技术选型</h3>
            <ul>
              {project.techDecisions.map((decision, index) => (
                <li key={index}>{decision}</li>
              ))}
            </ul>
          </div>
        )}

        {activeSection === 'challenges' && (
          <div className="card project-challenges">
            <h3>技术难点</h3>
            {project.challenges.map((challenge, index) => (
              <div key={index} className="challenge-item">
                <h4>{challenge.title}</h4>
                <p>{challenge.description}</p>
                <div className="solution">
                  <h5>解决方案:</h5>
                  <p>{project.solutions[index]?.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'questions' && (
          <div className="card project-questions">
            <h3>面试官可能问什么？</h3>
            {project.possibleQuestions?.length > 0 ? (
              <div className="questions-list">
                {project.possibleQuestions.map((item, index) => (
                  <div key={index} className="question-item">
                    <h4>{item.question}</h4>
                    <p className="answer">{item.answer}</p>
                    {item.followups?.length > 0 && (
                      <div className="followups">
                        <h5>可能追问:</h5>
                        <ul>
                          {item.followups.map((followup, i) => (
                            <li key={i}>{followup}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>暂无面试问答分析</p>
            )}
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="project-actions">
        <button className="btn-primary">生成面试问答</button>
        <button className="btn-secondary">编辑项目信息</button>
      </div>
    </div>
  );
}