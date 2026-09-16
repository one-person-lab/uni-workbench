// AI面试知识管理页面

import { useState, useEffect } from 'react';
import { interviewKnowledgeStorage } from '../../career/interviewStorage.js';
import { interviewKnowledgeImportService } from '../../career/interviewImportService.js';

export default function AiKnowledgeManagePage() {
  const [stats, setStats] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [lastImportTime, setLastImportTime] = useState(null);

  useEffect(() => {
    loadStats();
    loadLastImportTime();
  }, []);

  const loadStats = () => {
    const stats = interviewKnowledgeStorage.getStats();
    setStats(stats);
  };

  const loadLastImportTime = () => {
    const lastImport = localStorage.getItem('beu_interview_last_import');
    if (lastImport) {
      setLastImportTime(new Date(lastImport));
    }
  };

  const handleImport = async () => {
    if (isImporting) return;

    setIsImporting(true);
    setImportProgress('开始导入...');

    try {
      setImportProgress('正在导入ai-interview-guide...');
      const data = await interviewKnowledgeImportService.importAll();
      
      setImportProgress('正在建立关联关系...');
      interviewKnowledgeImportService.establishKnowledgeProjectRelations();
      
      setImportProgress('正在保存数据...');
      interviewKnowledgeStorage.importData(data);
      
      setImportProgress('导入完成！');
      localStorage.setItem('beu_interview_last_import', new Date().toISOString());
      
      loadStats();
      loadLastImportTime();
    } catch (error) {
      setImportProgress(`导入失败: ${error.message}`);
      console.error('导入失败:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = () => {
    if (confirm('确定要清空所有AI面试知识数据吗？此操作不可恢复。')) {
      interviewKnowledgeStorage.clearAll();
      localStorage.removeItem('beu_interview_last_import');
      loadStats();
      setLastImportTime(null);
    }
  };

  if (!stats) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">知识管理</h1>
        <p className="text-gray-600">导入和管理AI面试知识数据</p>
      </div>

      {/* 数据源信息 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">数据源</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">ai-interview-guide</h3>
            <p className="text-sm text-gray-600 mb-3">公共AI面试知识库</p>
            <div className="text-xs text-gray-500">
              <p>来源: https://github.com/guocong-bincai/ai-interview-guide</p>
              <p>许可: MIT License</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">career（原 career-os）</h3>
            <p className="text-sm text-gray-600 mb-3">个人职业资产</p>
            <div className="text-xs text-gray-500">
              <p>来源: https://gitee.com/eason_misu/career-os</p>
              <p>类型: 个人知识</p>
            </div>
          </div>
        </div>
      </div>

      {/* 导入操作 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">数据导入</h2>
        
        {lastImportTime && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">
            上次导入时间: {lastImportTime.toLocaleString()}
          </div>
        )}

        {importProgress && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
            {importProgress}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isImporting ? '导入中...' : '开始导入'}
          </button>
          <button
            onClick={handleClearData}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            清空数据
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>导入说明：</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>确保两个数据源已克隆到项目根目录</li>
            <li>ai-interview-guide: 28个主题，631个面试题</li>
            <li>career: 个人项目、面试准备、个人回答</li>
            <li>导入后会自动建立知识-项目关联</li>
          </ul>
        </div>
      </div>

      {/* 数据统计 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">数据统计</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalKnowledge}</div>
            <div className="text-sm text-gray-600">知识条目</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{stats.totalQuestions}</div>
            <div className="text-sm text-gray-600">面试题</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.totalProjects}</div>
            <div className="text-sm text-gray-600">项目</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.totalPersonalAnswers}</div>
            <div className="text-sm text-gray-600">个人回答</div>
          </div>
        </div>
      </div>

      {/* 分类统计 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">知识分类统计</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(stats.knowledgeByCategory).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">{category}</span>
              <span className="font-semibold text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}