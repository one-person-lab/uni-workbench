// AI面试知识首页 - 采用 vibe-hub.org 分类列表风格

import { useState, useEffect } from 'react';
import { interviewKnowledgeStorage } from '../../career/interviewStorage.js';

export default function AiKnowledgeHomePage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryKnowledge, setCategoryKnowledge] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const allKnowledge = interviewKnowledgeStorage.getKnowledge();
    const categoryStats = {};

    allKnowledge.forEach(k => {
      if (!categoryStats[k.category]) {
        categoryStats[k.category] = { count: 0, highFreq: 0 };
      }
      categoryStats[k.category].count++;
      if (k.frequency >= 4) {
        categoryStats[k.category].highFreq++;
      }
    });

    const categoryList = Object.entries(categoryStats).map(([category, stats]) => ({
      id: category,
      title: getCategoryTitle(category),
      description: getCategoryDescription(category),
      itemCount: stats.count,
      highFreqCount: stats.highFreq,
    })).sort((a, b) => b.itemCount - a.itemCount);

    setCategories(categoryList);
  };

  const loadCategoryKnowledge = (category) => {
    const knowledge = interviewKnowledgeStorage.getKnowledge({ category });
    const sortedKnowledge = knowledge.sort((a, b) => b.frequency - a.frequency);
    setCategoryKnowledge(sortedKnowledge);
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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">面试知识库</h1>
        <p className="text-gray-600">按技术领域分类的知识点，帮助你系统化掌握面试重点</p>
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
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => loadCategoryKnowledge(category.id)}
              className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {category.itemCount} 个条目
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{category.description}</p>
              {category.highFreqCount > 0 && (
                <div className="text-xs text-red-600">
                  包含 {category.highFreqCount} 个高频知识点
                </div>
              )}
            </div>
          ))}
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
            {categoryKnowledge.map((knowledge) => (
              <div
                key={knowledge.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {knowledge.frequency >= 4 && (
                        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                          高频
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        频率: {knowledge.frequency}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{knowledge.title}</h3>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {knowledge.content?.substring(0, 200)}...
                </p>

                {knowledge.tags && knowledge.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {knowledge.tags.map((tag) => (
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