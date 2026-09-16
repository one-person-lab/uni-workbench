import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { MetricStat } from '../components/MetricStat';
import { useCareerData } from '../hooks/useCareerData';

export function CareerJobDetailPage({ jobId }) {
  const { careerData, loading } = useCareerData();
  const [showAnalysis, setShowAnalysis] = useState(false);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const job = careerData?.jobs?.find(j => j.id === jobId);

  if (!job) {
    return <div className="error">岗位不存在</div>;
  }

  return (
    <div className="career-job-detail">
      <PageHeader
        title={`${job.company} - ${job.title}`}
        description="岗位详情与分析"
      />

      {/* 岗位基本信息 */}
      <section className="section">
        <h2>岗位信息</h2>
        <div className="card job-info">
          <div className="info-row">
            <span className="label">公司:</span>
            <span className="value">{job.company}</span>
          </div>
          <div className="info-row">
            <span className="label">岗位:</span>
            <span className="value">{job.title}</span>
          </div>
          <div className="info-row">
            <span className="label">地点:</span>
            <span className="value">{job.location}</span>
          </div>
          {job.salary && (
            <div className="info-row">
              <span className="label">薪资:</span>
              <span className="value">{job.salary}</span>
            </div>
          )}
          <div className="info-row">
            <span className="label">来源:</span>
            <span className="value">{job.source}</span>
          </div>
          <div className="info-row">
            <span className="label">状态:</span>
            <span className={`value status status--${job.status}`}>
              {getStatusText(job.status)}
            </span>
          </div>
        </div>
      </section>

      {/* 岗位描述 */}
      <section className="section">
        <h2>岗位描述</h2>
        <div className="card job-description">
          <p>{job.description}</p>
        </div>
      </section>

      {/* 岗位分析 */}
      <section className="section">
        <div className="section-header">
          <h2>岗位分析</h2>
          <button 
            className="btn-secondary"
            onClick={() => setShowAnalysis(!showAnalysis)}
          >
            {showAnalysis ? '隐藏分析' : '显示分析'}
          </button>
        </div>

        {showAnalysis && job.analysis ? (
          <div className="job-analysis">
            {/* 匹配度概览 */}
            <div className="card analysis-overview">
              <h3>匹配度分析</h3>
              <div className="match-score-large">
                <div className="score-circle">
                  <span className="score-value">{job.analysis.myMatchScore}%</span>
                </div>
              </div>
              <div className="analysis-summary">
                <p>{job.analysis.summary}</p>
              </div>
            </div>

            {/* 核心职责 */}
            <div className="card analysis-section">
              <h3>核心职责</h3>
              <ul>
                {job.analysis.coreResponsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* 核心技术 */}
            <div className="card analysis-section">
              <h3>核心技术</h3>
              <div className="tech-tags">
                {job.analysis.coreTechnologies.map((tech, index) => (
                  <span key={index} className="tag">{tech}</span>
                ))}
              </div>
            </div>

            {/* 优势与差距 */}
            <div className="analysis-grid">
              <div className="card analysis-section">
                <h3>优势</h3>
                <ul>
                  {job.analysis.advantages.map((item, index) => (
                    <li key={index} className="positive">{item}</li>
                  ))}
                </ul>
              </div>
              <div className="card analysis-section">
                <h3>差距</h3>
                <ul>
                  {job.analysis.gaps.map((item, index) => (
                    <li key={index} className="negative">{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 建议 */}
            <div className="card analysis-section">
              <h3>建议</h3>
              <ul>
                {job.analysis.suggestions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="card">
            <p>暂无分析结果</p>
            <button className="btn-primary">开始分析</button>
          </div>
        )}
      </section>

      {/* 操作按钮 */}
      <section className="section">
        <div className="action-buttons">
          {job.status === 'pending_evaluation' && (
            <button className="btn-primary">开始准备投递</button>
          )}
          {job.status === 'ready_to_apply' && (
            <button className="btn-primary">标记为已投递</button>
          )}
          {job.status === 'applied' && (
            <button className="btn-primary">更新面试状态</button>
          )}
          <button className="btn-secondary">删除岗位</button>
        </div>
      </section>
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