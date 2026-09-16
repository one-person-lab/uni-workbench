// 面试内容资产中心 - 采用 vibe-hub.org 分类列表风格

import { useState, useEffect } from 'react';
import { interviewKnowledgeStorage } from '../../career/interviewStorage.js';

export default function InterviewAssetCenterPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    console.log('页面已加载');
    setDataLoaded(true);
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const stats = interviewKnowledgeStorage.getStats();
    console.log('当前数据统计:', stats);
    
    // 检查是否需要导入数据（更宽松的条件：数据为空或数据量明显不对）
    const needsImport = stats.totalKnowledge === 0 && stats.totalQuestions === 0;
    
    console.log('是否需要导入:', needsImport);
    console.log('知识点数量:', stats.totalKnowledge);
    console.log('面试题数量:', stats.totalQuestions);
    
    if (needsImport) {
      setIsImporting(true);
      setImportMessage('正在导入面试知识数据...');
      
      try {
        const { interviewKnowledgeImportService } = await import('../../career/interviewImportService.js');
        const data = await interviewKnowledgeImportService.importAll();
        interviewKnowledgeImportService.establishKnowledgeProjectRelations();
        interviewKnowledgeStorage.importData(data);
        setImportMessage('数据导入完成！');
        
        setTimeout(() => {
          loadCategories();
        }, 500);
      } catch (error) {
        console.error('导入失败:', error);
        setImportMessage('数据导入失败：' + error.message);
      } finally {
        setIsImporting(false);
      }
      return;
    }

    // 数据不为空，继续加载分类
    console.log('开始加载分类...');
    const allKnowledge = interviewKnowledgeStorage.getKnowledge();
    const allQuestions = interviewKnowledgeStorage.getQuestions();
    console.log('知识点数量:', allKnowledge.length);
    console.log('面试题数量:', allQuestions.length);
    
    const categoryStats = {};

    allKnowledge.forEach(k => {
      if (!categoryStats[k.category]) {
        categoryStats[k.category] = { knowledge: 0, questions: 0 };
      }
      categoryStats[k.category].knowledge++;
    });

    allQuestions.forEach(q => {
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { knowledge: 0, questions: 0 };
      }
      categoryStats[q.category].questions++;
    });

    const categoryList = Object.entries(categoryStats).map(([category, stats]) => ({
      id: category,
      title: getCategoryTitle(category),
      description: getCategoryDescription(category),
      itemCount: stats.knowledge + stats.questions,
      knowledgeCount: stats.knowledge,
      questionCount: stats.questions,
    })).sort((a, b) => b.itemCount - a.itemCount);

    setCategories(categoryList);
  };

  const loadCategoryItems = (category) => {
    const knowledge = interviewKnowledgeStorage.getKnowledge({ category });
    const questions = interviewKnowledgeStorage.getQuestions({ category });
    
    const items = [
      ...knowledge.map(k => ({
        id: k.id,
        type: 'knowledge',
        title: k.title,
        content: k.content,
        tags: k.tags,
      })),
      ...questions.map(q => ({
        id: q.id,
        type: 'question',
        title: q.question,
        content: q.answer,
        tags: q.tags,
        frequency: q.frequency,
      }))
    ].sort((a, b) => {
      // 高频问题排在前面
      if (a.frequency && b.frequency) return b.frequency - a.frequency;
      if (a.frequency) return -1;
      if (b.frequency) return 1;
      return 0;
    });

    setCategoryItems(items);
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

  const handleForceImport = async () => {
    setIsImporting(true);
    setImportMessage('正在导入面试知识数据...');
    
    try {
      // 先清除旧数据
      localStorage.removeItem('beu_interview_knowledge');
      interviewKnowledgeStorage.loadData();
      
      const { interviewKnowledgeImportService } = await import('../../career/interviewImportService.js');
      const data = await interviewKnowledgeImportService.importAll();
      interviewKnowledgeImportService.establishKnowledgeProjectRelations();
      interviewKnowledgeStorage.importData(data);
      setImportMessage('数据导入完成！');
      
      setTimeout(() => {
        loadCategories();
      }, 500);
    } catch (error) {
      setImportMessage('数据导入失败：' + error.message);
      console.error('导入失败详情:', error);
    } finally {
      setIsImporting(false);
    }
  };

  if (isImporting) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">{importMessage}</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* 测试标记 */}
      <div className="mb-4 bg-red-500 text-white p-4 rounded-lg">
        ✅ 面试库页面已加载 - 测试标记
      </div>
      
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">面试内容资产中心</h1>
        <p className="text-gray-600">分类整理的面试知识点和问答，帮助你系统化准备面试</p>
      </div>

      {/* 调试信息面板 */}
      <div className="mb-4 bg-gray-100 border border-gray-300 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">调试信息</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>分类数量: {categories.length}</div>
          <div>选中分类: {selectedCategory || '无'}</div>
          <div>导入状态: {isImporting ? '导入中' : '空闲'}</div>
          <div>导入消息: {importMessage || '无'}</div>
        </div>
      </div>

      {/* 导入提示 */}
      {importMessage && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-700">{importMessage}</span>
          {!importMessage.includes('完成') && !importMessage.includes('失败') && (
            <span className="text-blue-500 animate-pulse">...</span>
          )}
        </div>
      )}

      {/* 强制导入按钮 */}
      {categories.length === 0 && (
        <div className="mb-4 text-center">
          <button
            onClick={handleForceImport}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            强制导入数据
          </button>
          <p className="text-sm text-gray-500 mt-2">点击此按钮清除旧数据并重新导入</p>
        </div>
      )}

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
              onClick={() => loadCategoryItems(category.id)}
              className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {category.itemCount} 个条目
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{category.description}</p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>知识点: {category.knowledgeCount}</span>
                <span>面试题: {category.questionCount}</span>
              </div>
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
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.type === 'knowledge' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {item.type === 'knowledge' ? '知识点' : '面试题'}
                      </span>
                      {item.frequency && item.frequency >= 4 && (
                        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                          高频
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h3>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.content?.substring(0, 200)}...
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
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