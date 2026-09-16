// AI面试知识数据导入服务（浏览器兼容版本）

import { Knowledge, InterviewQuestion, InterviewProject, PersonalAnswer, KnowledgeSource } from './interviewModels.js';

/**
 * AI面试知识导入服务
 */
class InterviewKnowledgeImportService {
  constructor() {
    this.knowledge = [];
    this.questions = [];
    this.projects = [];
    this.personalAnswers = [];
  }

  /**
   * 从预处理的数据文件导入
   */
  async importFromPreprocessedData() {
    console.log('从预处理数据导入AI面试知识...');
    
    try {
      const response = await fetch('/data/interview-knowledge.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      this.knowledge = data.knowledge || [];
      this.questions = data.questions || [];
      this.projects = data.projects || [];
      this.personalAnswers = data.personalAnswers || [];
      
      console.log('数据导入完成！');
      console.log(`- 知识条目: ${this.knowledge.length}`);
      console.log(`- 面试题: ${this.questions.length}`);
      console.log(`- 项目: ${this.projects.length}`);
      console.log(`- 个人回答: ${this.personalAnswers.length}`);
      
      return {
        knowledge: this.knowledge,
        questions: this.questions,
        projects: this.projects,
        personalAnswers: this.personalAnswers,
      };
    } catch (error) {
      console.error('导入预处理数据失败:', error);
      throw error;
    }
  }

  /**
   * 建立知识-项目关联
   */
  establishKnowledgeProjectRelations() {
    console.log('建立知识-项目关联...');
    
    this.knowledge.forEach(knowledge => {
      this.projects.forEach(project => {
        // 基于标签和技术栈匹配
        const matchScore = this.calculateMatchScore(knowledge, project);
        
        if (matchScore > 0.5) {
          if (!knowledge.relatedProjects.includes(project.id)) {
            knowledge.relatedProjects.push(project.id);
          }
          if (!project.relatedKnowledge.includes(knowledge.id)) {
            project.relatedKnowledge.push(knowledge.id);
          }
        }
      });
    });
  }

  /**
   * 计算匹配分数
   */
  calculateMatchScore(knowledge, project) {
    let score = 0;
    
    // 标签匹配
    knowledge.tags.forEach(tag => {
      if (project.technologies.includes(tag)) {
        score += 0.3;
      }
    });
    
    // 分类匹配
    if (knowledge.category === 'rag' && project.technologies.includes('RAG')) {
      score += 0.4;
    }
    if (knowledge.category === 'agent' && project.technologies.includes('Agent')) {
      score += 0.4;
    }
    
    return Math.min(score, 1);
  }

  /**
   * 导入所有数据（兼容方法）
   */
  async importAll() {
    return this.importFromPreprocessedData();
  }
}

// 导出单例
export const interviewKnowledgeImportService = new InterviewKnowledgeImportService();