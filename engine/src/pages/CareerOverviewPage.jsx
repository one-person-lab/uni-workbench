import { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { MetricStat } from '../components/MetricStat';
import { useCareerData } from '../hooks/useCareerData';

export function CareerOverviewPage() {
  const { careerData, loading } = useCareerData();
  const [nextAction, setNextAction] = useState(null);

  useEffect(() => {
    if (careerData) {
      // 计算下一步行动
      setNextAction(calculateNextAction(careerData));
    }
  }, [careerData]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="career-overview">
      <PageHeader
        title="职业生涯"
        description="个人职业管理 + 求职 + 面试准备系统"
      />

      {/* 当前目标 */}
      <section className="section">
        <h2>当前目标</h2>
        <div className="card">
          <h3>{careerData?.currentGoal?.title || 'AI应用架构师'}</h3>
          <p>{careerData?.currentGoal?.description || '专注于AI技术应用与架构设计，提升产品思维和业务洞察'}</p>
        </div>
      </section>

      {/* 正在准备的岗位 */}
      <section className="section">
        <h2>正在准备的岗位</h2>
        {careerData?.activeJobs?.length > 0 ? (
          <div className="job-list">
            {careerData.activeJobs.map(job => (
              <div key={job.id} className="card job-card">
                <h3>{job.company} - {job.title}</h3>
                <div className="job-meta">
                  <span className="status">{job.status}</span>
                  <span className="match-score">匹配度: {job.matchScore}%</span>
                </div>
                <div className="job-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => window.location.href = `/career/jobs/${job.id}`}
                  >
                    查看详情
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => window.location.href = `/career/interview/prep/${job.id}`}
                  >
                    进入面试准备
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>暂无正在准备的岗位</p>
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/career/jobs'}
            >
              开始准备新岗位
            </button>
          </div>
        )}
      </section>

      {/* 面试进度 */}
      <section className="section">
        <h2>面试进度</h2>
        {careerData?.interviewProgress?.length > 0 ? (
          <div className="interview-list">
            {careerData.interviewProgress.map(interview => (
              <div key={interview.id} className="card interview-card">
                <h3>{interview.company} - {interview.role}</h3>
                <div className="interview-round">
                  <span className="round">{interview.round}</span>
                  <span className="date">{interview.date}</span>
                </div>
                <div className="prep-progress">
                  <span>准备进度:</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${interview.prepProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>暂无面试安排</p>
          </div>
        )}
      </section>

      {/* 下一步行动 */}
      <section className="section">
        <h2>下一步行动</h2>
        {nextAction && (
          <div className="card next-action-card">
            <h3>{nextAction.title}</h3>
            <p>{nextAction.description}</p>
            <button className="btn-primary">开始执行</button>
          </div>
        )}
      </section>

      {/* 最近项目 */}
      <section className="section">
        <h2>最近项目</h2>
        {careerData?.recentProjects?.length > 0 ? (
          <div className="project-list">
            {careerData.recentProjects.map(project => (
              <div key={project.id} className="card project-card">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="project-tags">
                  {project.techStack?.map(tech => (
                    <span key={tech} className="tag">{tech}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>暂无项目记录</p>
          </div>
        )}
      </section>

      {/* 职业资产概览 */}
      <section className="section">
        <h2>职业资产概览</h2>
        <div className="assets-grid">
          <MetricStat
            label="面试故事"
            value={careerData?.assets?.stories || 0}
            icon="💼"
          />
          <MetricStat
            label="面试题"
            value={careerData?.assets?.questions || 0}
            icon="❓"
          />
          <MetricStat
            label="项目经验"
            value={careerData?.assets?.projects || 0}
            icon="🚀"
          />
          <MetricStat
            label="技能项"
            value={careerData?.assets?.skills || 0}
            icon="⚡"
          />
        </div>
      </section>
    </div>
  );
}

// 计算下一步行动的逻辑
function calculateNextAction(careerData) {
  if (!careerData) return null;

  // 如果有正在准备的岗位，返回面试准备
  if (careerData.activeJobs?.length > 0) {
    const activeJob = careerData.activeJobs[0];
    return {
      title: `继续准备「${activeJob.title}」面试`,
      description: '重点准备技术难点和项目经验',
    };
  }

  // 如果没有正在准备的岗位，返回岗位发现
  return {
    title: '发现新岗位',
    description: '开始寻找和评估新的职业机会',
  };
}