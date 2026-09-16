// 项目详情页 - 优化版：强化关联展示和突出我的内容

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { interviewKnowledgeStorage } from '../../career/interviewStorage.js';

export default function InterviewProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [relatedKnowledge, setRelatedKnowledge] = useState([]);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [projectAnswers, setProjectAnswers] = useState([]);
  const [personalNotes, setPersonalNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = () => {
    const projectData = interviewKnowledgeStorage.getProjectById(id);
    if (projectData) {
      setProject(projectData);

      // 加载关联知识
      const knowledgeItems = projectData.relatedKnowledge
        .map(knowledgeId => interviewKnowledgeStorage.getKnowledgeById(knowledgeId))
        .filter(Boolean);
      setRelatedKnowledge(knowledgeItems);

      // 加载关联面试题
      const questionItems = projectData.relatedQuestions
        .map(questionId => interviewKnowledgeStorage.getQuestionById(questionId))
        .filter(Boolean);
      setRelatedQuestions(questionItems);

      // 加载项目相关的个人回答
      const allAnswers = interviewKnowledgeStorage.getPersonalAnswers({
        projectId: id,
      });
      setProjectAnswers(allAnswers);

      // 加载个人笔记
      const notes = interviewKnowledgeStorage.getProjectNotes(id);
      setPersonalNotes(notes || '');

      // 模拟 AI 建议
      setAiSuggestions([
        { type: 'knowledge', count: 8, label: '可关联知识点' },
        { type: 'question', count: 12, label: '可关联面试题' },
        { type: 'answer', count: 3, label: '待补充回答' },
      ]);
    }
  };

  const handleSaveNotes = () => {
    interviewKnowledgeStorage.saveProjectNotes(id, personalNotes);
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

  if (!project) {
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

      {/* 项目头部 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
            项目经验
          </span>
          <span className="text-sm text-gray-500">
            来自: {project.source === 'PERSONAL' ? 'career' : '其他'}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{project.name}</h1>
        <p className="text-gray-600 mb-4">{project.description}</p>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">角色:</span>
          <span className="text-sm font-medium text-gray-900">{project.role}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech, index) => (
            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
              {tech}
            </span>
          ))}
        </div>

        {/* 资产关联统计 */}
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            {relatedKnowledge.length} 个知识点
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {relatedQuestions.length} 个面试题
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            {projectAnswers.length} 个回答
          </span>
        </div>
      </div>

      {/* 内容区域 - 两列布局 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 左侧主要内容 */}
        <div className="col-span-2 space-y-6">
          {/* 项目详情 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">项目详情</h2>
            <div className="space-y-4">
              {project.responsibilities && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">我的职责</h3>
                  <p className="text-sm text-gray-600">{project.responsibilities}</p>
                </div>
              )}
              {project.achievements && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">项目成果</h3>
                  <p className="text-sm text-gray-600">{project.achievements}</p>
                </div>
              )}
              {project.challenges && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">技术难点</h3>
                  <p className="text-sm text-gray-600">{project.challenges}</p>
                </div>
              )}
              {project.solutions && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">解决方案</h3>
                  <p className="text-sm text-gray-600">{project.solutions}</p>
                </div>
              )}
            </div>
          </div>

          {/* 关联知识点 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">📚</span>
              关联知识点
            </h2>
            {relatedKnowledge.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {relatedKnowledge.map((knowledge) => (
                  <div
                    key={knowledge.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/career/interview/ai-knowledge/${knowledge.id}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {categoryLabels[knowledge.category] || knowledge.category}
                      </span>
                      <span className="text-yellow-500 text-sm">{'⭐'.repeat(knowledge.difficulty)}</span>
                    </div>
                    <h3 className="font-medium text-gray-900">{knowledge.title}</h3>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无关联知识点</p>
                <p className="text-xs mt-1">AI 可以推荐相关知识点</p>
              </div>
            )}
          </div>

          {/* 关联面试题 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-green-600">❓</span>
              关联面试题
            </h2>
            {relatedQuestions.length > 0 ? (
              <div className="space-y-3">
                {relatedQuestions.map((question) => {
                  const hasAnswer = projectAnswers.some(a => a.questionId === question.id);
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无关联面试题</p>
                <p className="text-xs mt-1">AI 可以推荐相关面试题</p>
              </div>
            )}
          </div>

          {/* 我的回答 */}
          {projectAnswers.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-orange-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-orange-600">💬</span>
                我的回答
              </h2>
              <div className="space-y-3">
                {projectAnswers.map((answer) => (
                  <div
                    key={answer.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-orange-50 cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/career/interview/questions/${answer.questionId}`}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">{answer.questionTitle}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{answer.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧侧边栏 - AI 辅助和我的内容 */}
        <div className="space-y-6">
          {/* AI 建议提示 */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm p-6 border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🤖</span>
              AI 辅助
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              基于项目技术栈，AI 建议你可以：
            </p>
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-white rounded border border-blue-200 p-3 flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">{suggestion.label}</span>
                  <span className="text-sm font-bold text-blue-600">{suggestion.count}</span>
                </div>
              ))}
            </div>
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
                  placeholder="记录项目的关键点、难点、面试准备要点..."
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

          {/* 项目统计 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">📊</span>
              项目统计
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">关联知识点</span>
                <span className="text-sm font-bold text-blue-600">{relatedKnowledge.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">关联面试题</span>
                <span className="text-sm font-bold text-green-600">{relatedQuestions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">我的回答</span>
                <span className="text-sm font-bold text-orange-600">{projectAnswers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">技术栈</span>
                <span className="text-sm font-bold text-purple-600">{project.technologies.length}</span>
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
              <p>项目 → 知识 → 面试题 → 回答 → 追问 → 复盘</p>
              <p className="text-xs text-gray-400">点击任意资产查看其关联内容</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}