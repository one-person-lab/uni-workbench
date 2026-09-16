// 面试题详情页 - 优化版：强化关联展示和突出我的内容

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { interviewKnowledgeStorage } from '../../career/interviewStorage.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export default function InterviewQuestionDetailPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [relatedKnowledge, setRelatedKnowledge] = useState([]);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [personalAnswer, setPersonalAnswer] = useState(null);
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [interviewReviews, setInterviewReviews] = useState([]);

  useEffect(() => {
    loadQuestion();
  }, [id]);

  const loadQuestion = () => {
    const questionData = interviewKnowledgeStorage.getQuestionById(id);
    if (questionData) {
      setQuestion(questionData);

      // 加载关联知识
      const knowledgeItems = questionData.relatedKnowledge
        .map(knowledgeId => interviewKnowledgeStorage.getKnowledgeById(knowledgeId))
        .filter(Boolean);
      setRelatedKnowledge(knowledgeItems);

      // 加载关联项目
      const projects = questionData.relatedProjects
        .map(projectId => interviewKnowledgeStorage.getProjectById(projectId))
        .filter(Boolean);
      setRelatedProjects(projects);

      // 加载个人回答
      const answer = interviewKnowledgeStorage.getPersonalAnswerForQuestion(id);
      if (answer) {
        setPersonalAnswer(answer);
        setAnswerContent(answer.content);
      }

      // 加载追问
      const followUps = interviewKnowledgeStorage.getFollowUpQuestions(id);
      setFollowUpQuestions(followUps);

      // 加载面试复盘
      const reviews = interviewKnowledgeStorage.getInterviewReviews({ questionId: id });
      setInterviewReviews(reviews);
    }
  };

  const handleSaveAnswer = () => {
    if (personalAnswer) {
      interviewKnowledgeStorage.updatePersonalAnswer(personalAnswer.id, {
        content: answerContent,
        updatedAt: new Date(),
      });
    } else {
      interviewKnowledgeStorage.addPersonalAnswer({
        questionId: id,
        questionTitle: question.title,
        content: answerContent,
        source: 'MANUAL',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    setIsEditingAnswer(false);
    loadQuestion();
  };

  const categoryLabels = {
    llm: 'LLM',
    prompt_engineering: 'Prompt Engineering',
    rag: 'RAG',
    agent: 'Agent',
    mcp: 'MCP',
    transformer: 'Transformer',
    embedding: 'Embedding',
    vector_database: 'Vector Database',
    ai_application_architecture: 'AI应用架构',
    ai_system_design: 'AI系统设计',
    ai_engineering: 'AI工程',
    ai_coding: 'AI编程',
    python: 'Python',
    model_serving: '模型服务',
    inference: '推理优化',
    fine_tuning: 'Fine-tuning',
    evaluation: '评估',
    deployment: '部署',
    java: 'Java',
    go: 'Go',
    mysql: 'MySQL',
    redis: 'Redis',
    mq: 'MQ',
    jvm: 'JVM',
    spring: 'Spring',
    microservices: '微服务',
    distributed_system: '分布式系统',
    system_design: '系统设计',
  };

  if (!question) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={() => window.history.back()}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
      >
        <span>←</span>
        <span>返回资产中心</span>
      </button>

      {/* 面试题头部 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            {categoryLabels[question.category] || question.category}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">{'⭐'.repeat(question.difficulty)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-orange-500">{'★'.repeat(question.frequency)}</span>
          </div>
          {personalAnswer && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              已回答
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
        <p className="text-gray-600">{question.content}</p>

        {/* 资产关联统计 */}
        <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            {relatedKnowledge.length} 个知识点
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            {relatedProjects.length} 个项目
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            {followUpQuestions.length} 个追问
          </span>
        </div>
      </div>

      {/* 内容区域 - 两列布局 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 左侧主要内容 */}
        <div className="col-span-2 space-y-6">
          {/* 关联知识 */}
          {relatedKnowledge.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📚</span>
                关联知识
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {relatedKnowledge.map((knowledge) => (
                  <div
                    key={knowledge.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/career/interview/ai-knowledge/${knowledge.id}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-blue-600">
                        {categoryLabels[knowledge.category] || knowledge.category}
                      </span>
                      <span className="text-yellow-500 text-sm">{'⭐'.repeat(knowledge.difficulty)}</span>
                    </div>
                    <h3 className="font-medium text-gray-900">{knowledge.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 关联项目 */}
          {relatedProjects.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-purple-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">📁</span>
                关联项目
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {relatedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-purple-50 cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/career/interview/projects/${project.id}`}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">{project.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 追问 */}
          {followUpQuestions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-red-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-red-600">❓</span>
                常见追问
              </h2>
              <div className="space-y-3">
                {followUpQuestions.map((followUp) => (
                  <div key={followUp.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{followUp.question}</h3>
                    {followUp.hint && (
                      <p className="text-sm text-gray-600">{followUp.hint}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 面试复盘 */}
          {interviewReviews.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-gray-600">📝</span>
                面试复盘
              </h2>
              <div className="space-y-3">
                {interviewReviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{review.company}</h3>
                      <span className="text-xs text-gray-400">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{review.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧侧边栏 - 我的内容 */}
        <div className="space-y-6">
          {/* 我的回答 */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-orange-600">💬</span>
                我的回答
              </h2>
              {!isEditingAnswer && (
                <button
                  onClick={() => setIsEditingAnswer(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {personalAnswer ? '编辑' : '添加'}
                </button>
              )}
            </div>
            {isEditingAnswer ? (
              <div className="space-y-3">
                <textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={8}
                  placeholder="记录你的回答思路和要点..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAnswer}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setIsEditingAnswer(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                {personalAnswer ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    >
                      {personalAnswer.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>还没有回答</p>
                    <p className="text-xs mt-1">点击添加记录你的回答</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI 辅助提示 */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm p-6 border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🤖</span>
              AI 辅助
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>生成追问问题</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>检查回答质量</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>推荐相关知识点</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>关联项目经验</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>生成参考答案</span>
              </div>
            </div>
          </div>

          {/* 关联提示 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🔗</span>
              资产关联
            </h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>知识 → 面试题 → 项目 → 回答 → 追问 → 复盘</p>
              <p className="text-xs text-gray-400">点击任意资产查看其关联内容</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}