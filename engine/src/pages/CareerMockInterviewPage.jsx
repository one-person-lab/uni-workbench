import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useCareerData } from '../hooks/useCareerData';
import { MockInterviewService } from '../career/mockInterviewService';

export function CareerMockInterviewPage() {
  const { careerData, loading } = useCareerData();
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState('technical');
  const [interview, setInterview] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const jobs = careerData?.jobs || [];
  const directions = [
    { id: 'technical', name: '技术面试' },
    { id: 'behavioral', name: '行为面试' },
    { id: 'system_design', name: '系统设计' },
    { id: 'project', name: '项目经验' },
  ];

  const startInterview = async () => {
    if (!selectedJob) return;
    
    try {
      const userProfile = {
        skills: ['Java', 'Python', 'Spring Cloud', 'Redis', 'MySQL', 'RAG', 'LangChain'],
        experience: 9,
        projects: careerData?.recentProjects || []
      };

      const newInterview = await MockInterviewService.startInterview(
        selectedJob,
        selectedDirection,
        userProfile
      );
      
      setInterview(newInterview);
      setUserAnswer('');
    } catch (error) {
      console.error('开始模拟面试失败:', error);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !interview) return;

    try {
      setIsSubmitting(true);
      
      const userProfile = {
        skills: ['Java', 'Python', 'Spring Cloud', 'Redis', 'MySQL', 'RAG', 'LangChain'],
        experience: 9,
        projects: careerData?.recentProjects || []
      };

      const updatedInterview = await MockInterviewService.submitAnswer(
        interview,
        userAnswer,
        userProfile
      );
      
      setInterview(updatedInterview);
      setUserAnswer('');
    } catch (error) {
      console.error('提交回答失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const endInterview = () => {
    setInterview(null);
    setUserAnswer('');
  };

  const restartInterview = () => {
    setInterview(null);
    setUserAnswer('');
    setSelectedJob(null);
  };

  return (
    <div className="career-mock-interview">
      <PageHeader
        title="模拟面试"
        description="AI 面试官帮助你准备真实面试"
      />

      {!interview ? (
        <div className="interview-setup">
          <div className="card setup-section">
            <h3>选择岗位</h3>
            <select
              value={selectedJob || ''}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="job-select"
            >
              <option value="">请选择岗位</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.company} - {job.title}
                </option>
              ))}
            </select>
          </div>

          <div className="card setup-section">
            <h3>选择面试方向</h3>
            <div className="direction-options">
              {directions.map(direction => (
                <button
                  key={direction.id}
                  className={`direction-btn ${selectedDirection === direction.id ? 'active' : ''}`}
                  onClick={() => setSelectedDirection(direction.id)}
                >
                  {direction.name}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary start-btn"
            onClick={startInterview}
            disabled={!selectedJob}
          >
            开始模拟面试
          </button>
        </div>
      ) : (
        <div className="interview-active">
          <div className="card interview-container">
            <div className="interview-header">
              <h3>模拟面试进行中</h3>
              <div className="interview-progress">
                <span>问题 {interview.questions.filter(q => q.answer).length + 1}/{interview.questions.length}</span>
              </div>
              <button className="btn-secondary" onClick={endInterview}>
                结束面试
              </button>
            </div>

            {interview.status === 'completed' ? (
              <div className="interview-completed">
                <div className="completion-summary">
                  <h3>面试完成</h3>
                  <div className="overall-score">
                    <span className="score-label">总体评分:</span>
                    <span className="score-value">{interview.evaluation.overallScore}分</span>
                  </div>
                  
                  <div className="evaluation-details">
                    <div className="detail-item">
                      <span className="label">完整性:</span>
                      <span className="value">{interview.evaluation.completeness}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">技术深度:</span>
                      <span className="value">{interview.evaluation.technicalDepth}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">表达清晰度:</span>
                      <span className="value">{interview.evaluation.clarity}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">相关性:</span>
                      <span className="value">{interview.evaluation.relevance}</span>
                    </div>
                  </div>

                  <div className="strengths-improvements">
                    <div className="strengths">
                      <h4>优势</h4>
                      <ul>
                        {interview.evaluation.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="improvements">
                      <h4>需要改进</h4>
                      <ul>
                        {interview.evaluation.improvements.map((improvement, index) => (
                          <li key={index}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="interview-summary">
                    <h4>总结</h4>
                    <p>{interview.summary}</p>
                  </div>

                  <div className="completed-actions">
                    <button className="btn-primary" onClick={restartInterview}>
                      重新开始
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="conversation-history">
                  {interview.questions.map((msg, index) => (
                    <div key={index} className="conversation-item">
                      <div className={`message message--ai`}>
                        <div className="message-role">面试官</div>
                        <div className="message-content">{msg.question}</div>
                      </div>
                      {msg.answer && (
                        <div className={`message message--user`}>
                          <div className="message-role">你</div>
                          <div className="message-content">{msg.answer}</div>
                        </div>
                      )}
                      {msg.evaluation && (
                        <div className={`message message--evaluation`}>
                          <div className="message-role">评价</div>
                          <div className="message-content">
                            <div className="evaluation-item">
                              <span>完整性: {msg.evaluation.completeness}</span>
                            </div>
                            <div className="evaluation-item">
                              <span>技术深度: {msg.evaluation.technicalDepth}</span>
                            </div>
                            <div className="evaluation-item">
                              <span>表达清晰度: {msg.evaluation.clarity}</span>
                            </div>
                            {msg.evaluation.suggestions?.length > 0 && (
                              <div className="suggestions">
                                <span>建议: {msg.evaluation.suggestions.join('、')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="answer-input">
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="输入你的回答..."
                    className="answer-textarea"
                    disabled={isSubmitting}
                  />
                  <button
                    className="btn-primary submit-btn"
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim() || isSubmitting}
                  >
                    {isSubmitting ? '提交中...' : '提交回答'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}