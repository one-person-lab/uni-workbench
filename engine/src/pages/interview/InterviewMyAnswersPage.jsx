// 我的面试问答页面 - 采用 vibe-hub.org 分类列表风格

import { useState, useEffect } from 'react';
import { interviewKnowledgeStorage } from '../../career/interviewStorage.js';

export default function InterviewMyAnswersPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryAnswers, setCategoryAnswers] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const allAnswers = interviewKnowledgeStorage.getPersonalAnswers();
    const categoryStats = {};

    allAnswers.forEach(answer => {
      const question = interviewKnowledgeStorage.getQuestionById(answer.questionId);
      if (question) {
        if (!categoryStats[question.category]) {
          categoryStats[question.category] = { count: 0 };
        }
        categoryStats[question.category].count++;
      }
    });

    const categoryList = Object.entries(categoryStats).map(([category, stats]) => ({
      id: category,
      title: getCategoryTitle(category),
      description: getCategoryDescription(category),
      itemCount: stats.count,
    })).sort((a, b) => b.itemCount - a.itemCount);

    setCategories(categoryList);
  };

  const loadCategoryAnswers = (category) => {
    const allAnswers = interviewKnowledgeStorage.getPersonalAnswers();
    const filteredAnswers = allAnswers.filter(answer => {
      const question = interviewKnowledgeStorage.getQuestionById(answer.questionId);
      return question && question.category === category;
    });

    const answersWithQuestions = filteredAnswers.map(answer => {
      const question = interviewKnowledgeStorage.getQuestionById(answer.questionId);
      return {
        ...answer,
        questionTitle: question?.title || answer.questionTitle,
        questionCategory: question?.category,
        questionTags: question?.tags || [],
      };
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    setCategoryAnswers(answersWithQuestions);
    setSelectedCategory(category);
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

  const getCategoryTitle = (category) => {
    return categoryLabels[category] || category;
  };

  const getCategoryDescription = (category) => {
    const descriptions = {
      llm: '大语言模型基础、架构和应用',
      prompt_engineering: '提示词设计、优化和工程实践',
      rag: '检索增强生成、向量数据库和知识检索',
      agent: 'AI智能体、工具调用和多Agent协作',
      mcp: 'Model Context Protocol和工具系统',
      transformer: 'Transformer架构和注意力机制',
      embedding: '向量化、语义搜索和相似度计算',
      vector_database: '向量数据库、索引优化和检索性能',
      ai_application_architecture: 'AI应用架构设计和技术选型',
      ai_system_design: 'AI系统设计、性能优化和工程实践',
      ai_engineering: 'AI工程化、模型部署和监控',
      ai_coding: 'AI辅助编程、代码生成和开发工具',
      python: 'Python编程、框架和AI生态',
      model_serving: '模型服务、推理优化和部署',
      inference: '推理优化、量化和性能调优',
      fine_tuning: '模型微调、训练数据和参数调优',
      evaluation: '模型评估、指标体系和测试方法',
      deployment: '模型部署、容器化和生产环境',
      java: 'Java编程、JVM和并发编程',
      go: 'Go语言、并发编程和系统编程',
      mysql: 'MySQL数据库、索引优化和查询优化',
      redis: 'Redis缓存、数据结构和持久化',
      mq: '消息队列、异步处理和分布式通信',
      jvm: 'JVM原理、垃圾回收和性能调优',
      spring: 'Spring框架、依赖注入和配置管理',
      microservices: '微服务架构、服务治理和熔断降级',
      distributed_system: '分布式系统、一致性和容错设计',
      system_design: '系统设计、架构模式和工程实践',
    };
    return descriptions[category] || `${category}相关技术知识`;
  };

  const handleDeleteAnswer = (answerId) => {
    if (confirm('确定要删除这个回答吗？')) {
      interviewKnowledgeStorage.deletePersonalAnswer(answerId);
      loadCategoryAnswers(selectedCategory);
      loadCategories();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">我的面试问答</h1>
        <p className="text-gray-600">查看和管理你的个人面试回答记录</p>
      </div>

      {/* 返回按钮 */}
      {selectedCategory && (
        <button
          onClick={() => setSelectedCategory(null)}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← 返回分类列表
        </button>
      )}

      {/* 分类列表视图 */}
      {!selectedCategory && (
        <div className="space-y-6">
          {categories.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              暂无个人回答记录
              <br />
              <span className="text-sm mt-2 block">
                在面试题详情页中回答问题后，回答会显示在这里
              </span>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                onClick={() => loadCategoryAnswers(category.id)}
                className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {category.itemCount} 个回答
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* 分类详情视图 */}
      {selectedCategory && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getCategoryTitle(selectedCategory)}
            </h2>
            <p className="text-gray-600">{getCategoryDescription(selectedCategory)}</p>
          </div>

          <div className="space-y-4">
            {categoryAnswers.map((answer) => (
              <div
                key={answer.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {answer.questionTitle}
                    </h3>
                    <div className="text-xs text-gray-500 mb-3">
                      最后更新: {formatDate(answer.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAnswer(answer.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    删除
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {answer.content?.substring(0, 200)}...
                </p>

                {answer.questionTags && answer.questionTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {answer.questionTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}