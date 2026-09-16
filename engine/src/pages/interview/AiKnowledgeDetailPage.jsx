// AI面试知识详情页 - 优化版：强化关联展示和突出我的内容

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { interviewKnowledgeStorage } from '../../career/interviewStorage.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export default function AiKnowledgeDetailPage() {
  const { id } = useParams();
  const [knowledge, setKnowledge] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [myAnswers, setMyAnswers] = useState([]);
  const [personalNotes, setPersonalNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    loadKnowledge();
  }, [id]);

  const loadKnowledge = () => {
    const knowledgeData = interviewKnowledgeStorage.getKnowledgeById(id);
    if (knowledgeData) {
      setKnowledge(knowledgeData);

      // 加载关联项目
      const projects = knowledgeData.relatedProjects
        .map(projectId => interviewKnowledgeStorage.getProjectById(projectId))
        .filter(Boolean);
      setRelatedProjects(projects);

      // 加载关联面试题
      const questions = knowledgeData.relatedQuestions
        .map(questionId => interviewKnowledgeStorage.getQuestionById(questionId))
        .filter(Boolean);
      if (questions.length === 0) {
        // 如果没有直接关联，通过分类查找相关面试题
        const categoryQuestions = interviewKnowledgeStorage.getQuestions({
          category: knowledgeData.category,
        });
        setRelatedQuestions(categoryQuestions.slice(0, 8));
      } else {
        setRelatedQuestions(questions);
      }

      // 加载我的回答（与该知识相关的）
      const allAnswers = interviewKnowledgeStorage.getPersonalAnswers();
      const knowledgeAnswers = allAnswers.filter(answer => {
        const question = interviewKnowledgeStorage.getQuestionById(answer.questionId);
        return question && question.relatedKnowledge.includes(id);
      });
      setMyAnswers(knowledgeAnswers);

      // 加载个人笔记
      const notes = interviewKnowledgeStorage.getPersonalNotes(id);
      setPersonalNotes(notes || '');
    }
  };

  const handleSaveNotes = () => {
    interviewKnowledgeStorage.savePersonalNotes(id, personalNotes);
    setIsEditingNotes(false);
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

  if (!knowledge) {
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

      {/* 知识头部 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            {categoryLabels[knowledge.category] || knowledge.category}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">{'⭐'.repeat(knowledge.difficulty)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-orange-500">{'★'.repeat(knowledge.frequency)}</span>
          </div>
          <span className="text-sm text-gray-500">
            来源: {knowledge.source === 'PUBLIC' ? '公共知识' : knowledge.source === 'PERSONAL' ? '个人知识' : 'AI生成'}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{knowledge.title}</h1>

        {knowledge.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {knowledge.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 资产关联统计 */}
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            {relatedProjects.length} 个项目
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {relatedQuestions.length} 个面试题
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            {myAnswers.length} 个我的回答
          </span>
        </div>
      </div>

      {/* 内容区域 - 两列布局 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 左侧主要内容 */}
        <div className="col-span-2 space-y-6">
          {/* 知识内容 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">知识内容</h2>
            <div className="prose max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {knowledge.content}
              </ReactMarkdown>
            </div>
          </div>

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

          {/* 关联面试题 */}
          {relatedQuestions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600">❓</span>
                关联面试题
              </h2>
              <div className="space-y-3">
                {relatedQuestions.map((question) => {
                  const hasAnswer = myAnswers.some(a => a.questionId === question.id);
                  return (
                    <div
                      key={question.id}
                      className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        hasAnswer ? 'border-green-200 bg-green-50' : 'border-gray-200'
                      }`}
                      onClick={() => window.location.href = `/career/interview/questions/${question.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 flex-1">{question.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{'⭐'.repeat(question.frequency)}</span>
                          {hasAnswer && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                              已回答
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 右侧侧边栏 - 我的内容 */}
        <div className="space-y-6">
          {/* 我的回答 */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-orange-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-orange-600">💬</span>
              我的回答
            </h2>
            {myAnswers.length > 0 ? (
              <div className="space-y-3">
                {myAnswers.map((answer) => (
                  <div
                    key={answer.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-orange-50 cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/career/interview/questions/${answer.questionId}`}
                  >
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{answer.questionTitle}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">{answer.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                <p>还没有相关回答</p>
                <p className="text-xs mt-1">点击关联面试题添加回答</p>
              </div>
            )}
          </div>

          {/* 我的笔记 */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-blue-600">📝</span>
                我的笔记
              </h2>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  编辑
                </button>
              )}
            </div>
            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={6}
                  placeholder="记录你的理解和经验..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 whitespace-pre-wrap">
                {personalNotes || '暂无笔记，点击编辑添加'}
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
                <span>生成该知识的常见追问</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>推荐相关面试题</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>检查我的回答质量</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>总结知识要点</span>
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