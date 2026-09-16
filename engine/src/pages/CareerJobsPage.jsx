import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useCareerData } from '../hooks/useCareerData';

export function CareerJobsPage() {
  const { careerData, loading } = useCareerData();
  const [filter, setFilter] = useState('all');

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const jobs = careerData?.jobs || [];

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  return (
    <div className="career-jobs">
      <PageHeader
        title="岗位"
        description="发现、分析和管理求职岗位"
      />

      {/* 筛选器 */}
      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部
        </button>
        <button 
          className={`filter-btn ${filter === 'pending_evaluation' ? 'active' : ''}`}
          onClick={() => setFilter('pending_evaluation')}
        >
          待评估
        </button>
        <button 
          className={`filter-btn ${filter === 'ready_to_apply' ? 'active' : ''}`}
          onClick={() => setFilter('ready_to_apply')}
        >
          准备投递
        </button>
        <button 
          className={`filter-btn ${filter === 'interviewing' ? 'active' : ''}`}
          onClick={() => setFilter('interviewing')}
        >
          面试中
        </button>
      </div>

      {/* 岗位列表 */}
      <div className="job-list">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div key={job.id} className="card job-card">
              <div className="job-header">
                <h3>{job.company}</h3>
                <span className={`status status--${job.status}`}>
                  {getStatusText(job.status)}
                </span>
              </div>
              <h4>{job.title}</h4>
              <div className="job-meta">
                <span className="location">{job.location}</span>
                {job.salary && <span className="salary">{job.salary}</span>}
              </div>
              {job.matchScore && (
                <div className="match-score">
                  <span>匹配度:</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ width: `${job.matchScore}%` }}
                    />
                  </div>
                  <span className="score-value">{job.matchScore}%</span>
                </div>
              )}
              <div className="job-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => window.location.href = `/career/jobs/${job.id}`}
                >
                  查看详情
                </button>
                {job.status === 'pending_evaluation' && (
                  <button className="btn-primary">开始分析</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>暂无岗位记录</p>
            <button className="btn-primary">添加新岗位</button>
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
    interviewing: '面试中',
    offer: 'Offer',
    rejected: '已拒绝',
    withdrawn: '已放弃',
  };
  return statusMap[status] || status;
}