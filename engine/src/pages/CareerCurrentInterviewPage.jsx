import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useCareerData } from '../hooks/useCareerData';

export function CareerCurrentInterviewPage() {
  const { careerData, loading } = useCareerData();
  const [selectedInterview, setSelectedInterview] = useState(null);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const currentInterviews = careerData?.currentInterviews || [];

  return (
    <div className="career-current-interview">
      <PageHeader
        title="当前面试"
        description="正在进行的面试准备和进度追踪"
      />

      {currentInterviews.length > 0 ? (
        currentInterviews.map(interview => (
          <div key={interview.id} className="card interview-card">
            <div className="interview-header">
              <h3>{interview.company} - {interview.role}</h3>
              <span className="round">{interview.round}</span>
            </div>
            
            <div className="interview-meta">
              <span className="date">面试时间: {interview.date}</span>
              <span className="location">地点: {interview.location}</span>
            </div>

            {/* 准备进度 */}
            <div className="prep-progress-section">
              <h4>准备进度</h4>
              <div className="prep-items">
                {interview.prepItems.map((item, index) => (
                  <div key={index} className="prep-item">
                    <span className={`status ${item.completed ? 'completed' : 'pending'}`}>
                      {item.completed ? '✓' : '○'}
                    </span>
                    <span className="label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 下一步行动 */}
            <div className="next-action">
              <h4>下一步准备</h4>
              <p>{interview.nextAction}</p>
              <button 
                className="btn-primary"
                onClick={() => window.location.href = `/career/interview/prep/${interview.id}`}
              >
                开始准备
              </button>
            </div>

            {/* 操作按钮 */}
            <div className="interview-actions">
              <button className="btn-secondary">更新准备进度</button>
              <button 
                className="btn-secondary"
                onClick={() => window.location.href = `/career/interview/mock`}
              >
                进入模拟面试
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <p>暂无正在进行的面试</p>
          <button className="btn-primary">开始准备新面试</button>
        </div>
      )}
    </div>
  );
}