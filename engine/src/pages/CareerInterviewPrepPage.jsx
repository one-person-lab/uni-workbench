import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useCareerData } from '../hooks/useCareerData';
import { InterviewPrepWorkflow } from '../career/aiWorkflows';

export function CareerInterviewPrepPage({ jobId }) {
  const { careerData, loading, saveCareerData } = useCareerData();
  const [activeTab, setActiveTab] = useState('focus');
  const [isGenerating, setIsGenerating] = useState(false);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const job = careerData?.jobs?.find(j => j.id === jobId);
  const prepData = careerData?.interviewPrep?.find(p => p.jobId === jobId);

  if (!job) {
    return <div className="error">岗位不存在</div>;
  }

  const generatePrepPlan = async () => {
    try {
      setIsGenerating(true);
      
      // 模拟用户资料
      const userProfile = {
        skills: ['Java', 'Python', 'Spring Cloud', 'Redis', 'MySQL', 'RAG', 'LangChain'],
        experience: 9,
        projects: careerData?.recentProjects || [],
        architectureExperience: true,
        managementExperience: true
      };

      // 生成面试准备方案
      const prepPlan = await InterviewPrepWorkflow.generatePrepPlan(
        jobId,
        job.analysis,
        userProfile
      );

      // 更新数据
      const updatedData = { ...careerData };
      if (!updatedData.interviewPrep) {
        updatedData.interviewPrep = [];
      }
      
      const existingIndex = updatedData.interviewPrep.findIndex(p => p.jobId === jobId);
      if (existingIndex >= 0) {
        updatedData.interviewPrep[existingIndex] = prepPlan;
      } else {
        updatedData.interviewPrep.push(prepPlan);
      }

      saveCareerData(updatedData);
    } catch (error) {
      console.error('生成面试准备方案失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="career-interview-prep">
      <PageHeader
        title={`${job.company} - ${job.title} 面试准备`}
        description="针对该岗位的定制化面试准备方案"
      />

      {/* Tab 导航 */}
      <div className="tab-nav">
        <button 
          className={`tab-btn ${activeTab === 'focus' ? 'active' : ''}`}
          onClick={() => setActiveTab('focus')}
        >
          岗位重点
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tech' ? 'active' : ''}`}
          onClick={() => setActiveTab('tech')}
        >
          技术重点
        </button>
        <button 
          className={`tab-btn ${activeTab === 'project' ? 'active' : ''}`}
          onClick={() => setActiveTab('project')}
        >
          项目重点
        </button>
        <button 
          className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          高频问题
        </button>
        <button 
          className={`tab-btn ${activeTab === 'gaps' ? 'active' : ''}`}
          onClick={() => setActiveTab('gaps')}
        >
          知识差距
        </button>
        <button 
          className={`tab-btn ${activeTab === 'intro' ? 'active' : ''}`}
          onClick={() => setActiveTab('intro')}
        >
          自我介绍
        </button>
      </div>

      {/* Tab 内容 */}
      <div className="tab-content">
        {activeTab === 'focus' && (
          <div className="card prep-section">
            <h3>岗位重点</h3>
            {prepData?.jobFocus?.length > 0 ? (
              <ul>
                {prepData.jobFocus.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>暂无岗位重点分析</p>
            )}
          </div>
        )}

        {activeTab === 'tech' && (
          <div className="card prep-section">
            <h3>技术重点</h3>
            {prepData?.techFocus?.length > 0 ? (
              <div className="tech-tags">
                {prepData.techFocus.map((tech, index) => (
                  <span key={index} className="tag">{tech}</span>
                ))}
              </div>
            ) : (
              <p>暂无技术重点分析</p>
            )}
          </div>
        )}

        {activeTab === 'project' && (
          <div className="card prep-section">
            <h3>项目重点</h3>
            {prepData?.projectFocus?.length > 0 ? (
              <ul>
                {prepData.projectFocus.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>暂无项目重点分析</p>
            )}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="card prep-section">
            <h3>高频问题</h3>
            {prepData?.highFrequencyQuestions?.length > 0 ? (
              <div className="questions-list">
                {prepData.highFrequencyQuestions.map((question, index) => (
                  <div key={index} className="question-item">
                    <h4>{question.question}</h4>
                    <textarea 
                      className="answer-textarea"
                      placeholder="输入你的回答..."
                      defaultValue={question.myAnswer}
                      onChange={(e) => {
                        // 更新回答
                        const updatedData = { ...careerData };
                        const prepIndex = updatedData.interviewPrep.findIndex(p => p.jobId === jobId);
                        if (prepIndex >= 0) {
                          updatedData.interviewPrep[prepIndex].highFrequencyQuestions[index].myAnswer = e.target.value;
                          saveCareerData(updatedData);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p>暂无高频问题分析</p>
            )}
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="card prep-section">
            <h3>知识差距</h3>
            {prepData?.knowledgeGaps?.length > 0 ? (
              <ul>
                {prepData.knowledgeGaps.map((gap, index) => (
                  <li key={index} className="gap-item">{gap}</li>
                ))}
              </ul>
            ) : (
              <p>暂无知识差距分析</p>
            )}
          </div>
        )}

        {activeTab === 'intro' && (
          <div className="card prep-section">
            <h3>自我介绍</h3>
            <textarea 
              className="intro-textarea"
              placeholder="输入你的自我介绍..."
              defaultValue={prepData?.selfIntroduction || ''}
              onChange={(e) => {
                // 更新自我介绍
                const updatedData = { ...careerData };
                const prepIndex = updatedData.interviewPrep.findIndex(p => p.jobId === jobId);
                if (prepIndex >= 0) {
                  updatedData.interviewPrep[prepIndex].selfIntroduction = e.target.value;
                  saveCareerData(updatedData);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="prep-actions">
        <button 
          className="btn-primary"
          onClick={generatePrepPlan}
          disabled={isGenerating}
        >
          {isGenerating ? '生成中...' : '生成面试准备方案'}
        </button>
        <button className="btn-secondary">更新准备进度</button>
      </div>
    </div>
  );
}