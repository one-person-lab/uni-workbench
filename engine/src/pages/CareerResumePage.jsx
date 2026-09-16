import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useCareerData } from '../hooks/useCareerData';

export function CareerResumePage() {
  const { careerData, loading } = useCareerData();
  const [editMode, setEditMode] = useState(false);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const resume = careerData?.resume || {};

  return (
    <div className="career-resume">
      <PageHeader
        title="简历"
        description="我的简历资产"
      />

      <div className="resume-actions">
        <button 
          className="btn-primary"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? '预览模式' : '编辑模式'}
        </button>
        <button className="btn-secondary">导出 PDF</button>
        <button className="btn-secondary">导入简历</button>
      </div>

      <div className="card resume-content">
        {/* 基本信息 */}
        <section className="resume-section">
          <h2>基本信息</h2>
          {editMode ? (
            <div className="edit-form">
              <div className="form-group">
                <label>姓名</label>
                <input defaultValue={resume.name} />
              </div>
              <div className="form-group">
                <label>职位</label>
                <input defaultValue={resume.title} />
              </div>
              <div className="form-group">
                <label>邮箱</label>
                <input defaultValue={resume.email} />
              </div>
              <div className="form-group">
                <label>电话</label>
                <input defaultValue={resume.phone} />
              </div>
            </div>
          ) : (
            <div className="info-display">
              <h3>{resume.name || '姓名'}</h3>
              <p>{resume.title || '职位'}</p>
              <p>{resume.email || '邮箱'}</p>
              <p>{resume.phone || '电话'}</p>
            </div>
          )}
        </section>

        {/* 职业概述 */}
        <section className="resume-section">
          <h2>职业概述</h2>
          {editMode ? (
            <textarea defaultValue={resume.summary} className="edit-textarea" />
          ) : (
            <p>{resume.summary || '暂无职业概述'}</p>
          )}
        </section>

        {/* 工作经历 */}
        <section className="resume-section">
          <h2>工作经历</h2>
          {resume.experience?.length > 0 ? (
            resume.experience.map((exp, index) => (
              <div key={index} className="experience-item">
                {editMode ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>公司</label>
                      <input defaultValue={exp.company} />
                    </div>
                    <div className="form-group">
                      <label>职位</label>
                      <input defaultValue={exp.title} />
                    </div>
                    <div className="form-group">
                      <label>时间</label>
                      <input defaultValue={exp.period} />
                    </div>
                    <div className="form-group">
                      <label>职责</label>
                      <textarea defaultValue={exp.description} />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{exp.company} - {exp.title}</h3>
                    <p className="period">{exp.period}</p>
                    <p>{exp.description}</p>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>暂无工作经历</p>
          )}
          {editMode && (
            <button className="btn-secondary add-btn">添加工作经历</button>
          )}
        </section>

        {/* 项目经验 */}
        <section className="resume-section">
          <h2>项目经验</h2>
          {resume.projects?.length > 0 ? (
            resume.projects.map((project, index) => (
              <div key={index} className="project-item">
                {editMode ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>项目名称</label>
                      <input defaultValue={project.name} />
                    </div>
                    <div className="form-group">
                      <label>技术栈</label>
                      <input defaultValue={project.techStack?.join(', ')} />
                    </div>
                    <div className="form-group">
                      <label>描述</label>
                      <textarea defaultValue={project.description} />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{project.name}</h3>
                    <div className="tech-tags">
                      {project.techStack?.map((tech, i) => (
                        <span key={i} className="tag">{tech}</span>
                      ))}
                    </div>
                    <p>{project.description}</p>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>暂无项目经验</p>
          )}
          {editMode && (
            <button className="btn-secondary add-btn">添加项目经验</button>
          )}
        </section>

        {/* 技能 */}
        <section className="resume-section">
          <h2>技能</h2>
          {editMode ? (
            <div className="edit-form">
              <div className="form-group">
                <label>技术技能</label>
                <textarea defaultValue={resume.skills?.technical?.join(', ')} />
              </div>
              <div className="form-group">
                <label>软技能</label>
                <textarea defaultValue={resume.skills?.soft?.join(', ')} />
              </div>
            </div>
          ) : (
            <div className="skills-display">
              <div className="skill-group">
                <h3>技术技能</h3>
                <div className="skill-tags">
                  {resume.skills?.technical?.map((skill, index) => (
                    <span key={index} className="tag">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="skill-group">
                <h3>软技能</h3>
                <div className="skill-tags">
                  {resume.skills?.soft?.map((skill, index) => (
                    <span key={index} className="tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {editMode && (
          <div className="save-actions">
            <button className="btn-primary">保存简历</button>
            <button className="btn-secondary" onClick={() => setEditMode(false)}>
              取消编辑
            </button>
          </div>
        )}
      </div>
    </div>
  );
}