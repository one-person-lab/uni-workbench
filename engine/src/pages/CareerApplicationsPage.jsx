import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useCareerData } from '../hooks/useCareerData';

export function CareerApplicationsPage() {
  const { careerData, loading } = useCareerData();
  const [selectedApplication, setSelectedApplication] = useState(null);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const applications = careerData?.applications || [];

  return (
    <div className="career-applications">
      <PageHeader
        title="求职进度"
        description="追踪求职过程中的所有申请和面试进度"
      />

      {/* 求职进度列表 */}
      <div className="applications-list">
        {applications.length > 0 ? (
          applications.map(app => (
            <div key={app.id} className="card application-card">
              <div className="application-header">
                <h3>{app.company}</h3>
                <span className={`status status--${app.status}`}>
                  {getStatusText(app.status)}
                </span>
              </div>
              <h4>{app.role}</h4>
              
              {/* Timeline */}
              <div className="timeline">
                {app.timeline.map((event, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-date">{event.date}</div>
                    <div className="timeline-content">
                      <div className="timeline-title">{event.title}</div>
                      <div className="timeline-description">{event.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 当前阶段 */}
              {app.currentStage && (
                <div className="current-stage">
                  <span className="label">当前阶段:</span>
                  <span className="value">{app.currentStage}</span>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="job-actions">
                <button className="btn-secondary">添加记录</button>
                <button 
                  className="btn-primary"
                  onClick={() => window.location.href = `/career/interview/prep/${app.jobId}`}
                >
                  进入面试准备
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>暂无求职进度记录</p>
            <button className="btn-primary">开始追踪求职进度</button>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusText(status) {
  const statusMap = {
    pending_evaluation: '待评估',
    ready_to_apply: '准备投递',
    applied: '已投递',
    first_round: '一面',
    second_round: '二面',
    third_round: '三面',
    offer: 'Offer',
    rejected: '已拒绝',
    withdrawn: '已放弃',
  };
  return statusMap[status] || status;
}