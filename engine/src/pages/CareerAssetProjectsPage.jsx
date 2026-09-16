import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useCareerData } from '../hooks/useCareerData';

export function CareerAssetProjectsPage() {
  const { careerData, loading } = useCareerData();

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const projects = careerData?.assetProjects || [];

  return (
    <div className="career-asset-projects">
      <PageHeader
        title="项目资产"
        description="我的项目经验与面试资产"
      />

      <div className="projects-grid">
        {projects.length > 0 ? (
          projects.map(project => (
            <div key={project.id} className="card project-asset-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className="project-type">{project.type}</span>
              </div>
              <p className="project-description">{project.description}</p>
              
              <div className="project-details">
                <div className="detail-item">
                  <span className="label">技术栈:</span>
                  <div className="tech-tags">
                    {project.techStack?.map((tech, index) => (
                      <span key={index} className="tag">{tech}</span>
                    ))}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="label">我的职责:</span>
                  <p>{project.responsibilities}</p>
                </div>
                <div className="detail-item">
                  <span className="label">项目成果:</span>
                  <p>{project.outcomes}</p>
                </div>
              </div>

              <div className="project-stats">
                <div className="stat-item">
                  <span className="label">面试使用次数:</span>
                  <span className="value">{project.interviewCount || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="label">相关故事:</span>
                  <span className="value">{project.storyCount || 0}</span>
                </div>
              </div>

              <div className="project-actions">
                <button 
                  className="btn-primary"
                  onClick={() => window.location.href = `/career/interview/projects/${project.id}`}
                >
                  进入项目面试
                </button>
                <button className="btn-secondary">编辑项目</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>暂无项目资产</p>
            <button className="btn-primary">添加项目资产</button>
          </div>
        )}
      </div>
    </div>
  );
}