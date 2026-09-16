// AI面试知识存储服务

import { Knowledge, InterviewQuestion, InterviewProject, PersonalAnswer, JobPosition, JobKnowledgeMatch, JobQuestionMatch } from './interviewModels.js';

/**
 * AI面试知识存储服务
 */
class InterviewKnowledgeStorage {
  constructor() {
    this.storageKey = 'beu_interview_knowledge';
    this.loadData();
  }

  /**
   * 加载数据
   */
  loadData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.knowledge = parsed.knowledge || [];
        this.questions = parsed.questions || [];
        this.projects = parsed.projects || [];
        this.personalAnswers = parsed.personalAnswers || [];
        this.jobPositions = parsed.jobPositions || [];
        this.jobKnowledgeMatches = parsed.jobKnowledgeMatches || [];
        this.jobQuestionMatches = parsed.jobQuestionMatches || [];
        this.followUpQuestions = parsed.followUpQuestions || [];
        this.interviewReviews = parsed.interviewReviews || [];
        this.personalNotes = parsed.personalNotes || {};
        this.projectNotes = parsed.projectNotes || {};
      } else {
        this.knowledge = [];
        this.questions = [];
        this.projects = [];
        this.personalAnswers = [];
        this.jobPositions = [];
        this.jobKnowledgeMatches = [];
        this.jobQuestionMatches = [];
        this.followUpQuestions = [];
        this.interviewReviews = [];
        this.personalNotes = {};
        this.projectNotes = {};
      }
    } catch (error) {
      console.error('加载AI面试知识数据失败:', error);
      this.knowledge = [];
      this.questions = [];
      this.projects = [];
      this.personalAnswers = [];
      this.jobPositions = [];
      this.jobKnowledgeMatches = [];
      this.jobQuestionMatches = [];
      this.followUpQuestions = [];
      this.interviewReviews = [];
      this.personalNotes = {};
      this.projectNotes = {};
    }
  }

  /**
   * 保存数据
   */
  saveData() {
    try {
      const data = {
        knowledge: this.knowledge,
        questions: this.questions,
        projects: this.projects,
        personalAnswers: this.personalAnswers,
        jobPositions: this.jobPositions,
        jobKnowledgeMatches: this.jobKnowledgeMatches,
        jobQuestionMatches: this.jobQuestionMatches,
        followUpQuestions: this.followUpQuestions,
        interviewReviews: this.interviewReviews,
        personalNotes: this.personalNotes,
        projectNotes: this.projectNotes,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('保存AI面试知识数据失败:', error);
    }
  }

  /**
   * 导入数据
   */
  importData(data) {
    this.knowledge = data.knowledge || [];
    this.questions = data.questions || [];
    this.projects = data.projects || [];
    this.personalAnswers = data.personalAnswers || [];
    this.saveData();
  }

  // ==================== 知识操作 ====================

  /**
   * 获取所有知识
   */
  getKnowledge(filters = {}) {
    let result = [...this.knowledge];
    
    if (filters.category) {
      result = result.filter(k => k.category === filters.category);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(k => 
        k.title.toLowerCase().includes(searchLower) ||
        k.content.toLowerCase().includes(searchLower) ||
        k.tags.some(t => t.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.difficulty) {
      result = result.filter(k => k.difficulty === filters.difficulty);
    }
    
    if (filters.frequency) {
      result = result.filter(k => k.frequency >= filters.frequency);
    }
    
    return result;
  }

  /**
   * 获取单个知识
   */
  getKnowledgeById(id) {
    return this.knowledge.find(k => k.id === id);
  }

  /**
   * 添加知识
   */
  addKnowledge(knowledge) {
    this.knowledge.push(knowledge);
    this.saveData();
    return knowledge;
  }

  /**
   * 更新知识
   */
  updateKnowledge(id, updates) {
    const index = this.knowledge.findIndex(k => k.id === id);
    if (index !== -1) {
      this.knowledge[index] = { ...this.knowledge[index], ...updates, updatedAt: new Date() };
      this.saveData();
      return this.knowledge[index];
    }
    return null;
  }

  /**
   * 删除知识
   */
  deleteKnowledge(id) {
    this.knowledge = this.knowledge.filter(k => k.id !== id);
    this.saveData();
  }

  // ==================== 面试题操作 ====================

  /**
   * 获取所有面试题
   */
  getQuestions(filters = {}) {
    let result = [...this.questions];
    
    if (filters.category) {
      result = result.filter(q => q.category === filters.category);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(q => 
        q.title.toLowerCase().includes(searchLower) ||
        q.content.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.knowledgeId) {
      result = result.filter(q => q.relatedKnowledge.includes(filters.knowledgeId));
    }
    
    return result;
  }

  /**
   * 获取单个面试题
   */
  getQuestionById(id) {
    return this.questions.find(q => q.id === id);
  }

  /**
   * 添加面试题
   */
  addQuestion(question) {
    this.questions.push(question);
    this.saveData();
    return question;
  }

  /**
   * 更新面试题
   */
  updateQuestion(id, updates) {
    const index = this.questions.findIndex(q => q.id === id);
    if (index !== -1) {
      this.questions[index] = { ...this.questions[index], ...updates, updatedAt: new Date() };
      this.saveData();
      return this.questions[index];
    }
    return null;
  }

  // ==================== 项目操作 ====================

  /**
   * 获取所有项目
   */
  getProjects() {
    return [...this.projects];
  }

  /**
   * 获取单个项目
   */
  getProjectById(id) {
    return this.projects.find(p => p.id === id);
  }

  /**
   * 添加项目
   */
  addProject(project) {
    this.projects.push(project);
    this.saveData();
    return project;
  }

  /**
   * 更新项目
   */
  updateProject(id, updates) {
    const index = this.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projects[index] = { ...this.projects[index], ...updates, updatedAt: new Date() };
      this.saveData();
      return this.projects[index];
    }
    return null;
  }

  // ==================== 个人回答操作 ====================

  /**
   * 获取个人回答
   */
  getPersonalAnswers(filters = {}) {
    let result = [...this.personalAnswers];
    
    if (filters.questionId) {
      result = result.filter(a => a.questionId === filters.questionId);
    }
    
    if (filters.knowledgeId) {
      result = result.filter(a => a.knowledgeId === filters.knowledgeId);
    }
    
    if (filters.projectId) {
      result = result.filter(a => a.projectId === filters.projectId);
    }
    
    return result;
  }

  /**
   * 获取单个个人回答
   */
  getPersonalAnswerById(id) {
    return this.personalAnswers.find(a => a.id === id);
  }

  /**
   * 添加个人回答
   */
  addPersonalAnswer(answer) {
    this.personalAnswers.push(answer);
    this.saveData();
    return answer;
  }

  /**
   * 更新个人回答
   */
  updatePersonalAnswer(id, updates) {
    const index = this.personalAnswers.findIndex(a => a.id === id);
    if (index !== -1) {
      this.personalAnswers[index] = { ...this.personalAnswers[index], ...updates, updatedAt: new Date() };
      this.saveData();
      return this.personalAnswers[index];
    }
    return null;
  }

  /**
   * 获取面试题的个人回答
   */
  getPersonalAnswerForQuestion(questionId) {
    return this.personalAnswers.find(a => a.questionId === questionId);
  }

  // ==================== 岗位操作 ====================

  /**
   * 获取所有岗位
   */
  getJobPositions() {
    return [...this.jobPositions];
  }

  /**
   * 获取单个岗位
   */
  getJobPositionById(id) {
    return this.jobPositions.find(j => j.id === id);
  }

  /**
   * 添加岗位
   */
  addJobPosition(jobPosition) {
    this.jobPositions.push(jobPosition);
    this.saveData();
    return jobPosition;
  }

  /**
   * 更新岗位
   */
  updateJobPosition(id, updates) {
    const index = this.jobPositions.findIndex(j => j.id === id);
    if (index !== -1) {
      this.jobPositions[index] = { ...this.jobPositions[index], ...updates, updatedAt: new Date() };
      this.saveData();
      return this.jobPositions[index];
    }
    return null;
  }

  // ==================== 岗位-知识匹配操作 ====================

  /**
   * 获取岗位的知识匹配
   */
  getJobKnowledgeMatches(jobPositionId) {
    return this.jobKnowledgeMatches.filter(m => m.jobPositionId === jobPositionId);
  }

  /**
   * 添加岗位-知识匹配
   */
  addJobKnowledgeMatch(match) {
    this.jobKnowledgeMatches.push(match);
    this.saveData();
    return match;
  }

  /**
   * 更新岗位-知识匹配
   */
  updateJobKnowledgeMatch(id, updates) {
    const index = this.jobKnowledgeMatches.findIndex(m => m.id === id);
    if (index !== -1) {
      this.jobKnowledgeMatches[index] = { ...this.jobKnowledgeMatches[index], ...updates };
      this.saveData();
      return this.jobKnowledgeMatches[index];
    }
    return null;
  }

  // ==================== 岗位-面试题匹配操作 ====================

  /**
   * 获取岗位的面试题匹配
   */
  getJobQuestionMatches(jobPositionId) {
    return this.jobQuestionMatches.filter(m => m.jobPositionId === jobPositionId);
  }

  /**
   * 添加岗位-面试题匹配
   */
  addJobQuestionMatch(match) {
    this.jobQuestionMatches.push(match);
    this.saveData();
    return match;
  }

  // ==================== 统计信息 ====================

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalKnowledge: this.knowledge.length,
      totalQuestions: this.questions.length,
      totalProjects: this.projects.length,
      totalPersonalAnswers: this.personalAnswers.length,
      totalJobPositions: this.jobPositions.length,
      knowledgeByCategory: this.getKnowledgeByCategory(),
      questionsByCategory: this.getQuestionsByCategory(),
    };
  }

  /**
   * 按分类统计知识
   */
  getKnowledgeByCategory() {
    const stats = {};
    this.knowledge.forEach(k => {
      stats[k.category] = (stats[k.category] || 0) + 1;
    });
    return stats;
  }

  /**
   * 按分类统计面试题
   */
  getQuestionsByCategory() {
    const stats = {};
    this.questions.forEach(q => {
      stats[q.category] = (stats[q.category] || 0) + 1;
    });
    return stats;
  }

  /**
   * 清空所有数据
   */
  clearAll() {
    this.knowledge = [];
    this.questions = [];
    this.projects = [];
    this.personalAnswers = [];
    this.jobPositions = [];
    this.jobKnowledgeMatches = [];
    this.jobQuestionMatches = [];
    this.followUpQuestions = [];
    this.interviewReviews = [];
    this.personalNotes = {};
    this.projectNotes = {};
    this.saveData();
  }

  // ==================== 追问操作 ====================

  /**
   * 获取追问
   */
  getFollowUpQuestions(questionId) {
    return this.followUpQuestions.filter(f => f.questionId === questionId);
  }

  /**
   * 添加追问
   */
  addFollowUpQuestion(followUp) {
    this.followUpQuestions.push(followUp);
    this.saveData();
    return followUp;
  }

  // ==================== 面试复盘操作 ====================

  /**
   * 获取面试复盘
   */
  getInterviewReviews(filters = {}) {
    let result = [...this.interviewReviews];
    
    if (filters.questionId) {
      result = result.filter(r => r.questionId === filters.questionId);
    }
    
    if (filters.projectId) {
      result = result.filter(r => r.projectId === filters.projectId);
    }
    
    if (filters.company) {
      result = result.filter(r => r.company === filters.company);
    }
    
    return result;
  }

  /**
   * 添加面试复盘
   */
  addInterviewReview(review) {
    this.interviewReviews.push(review);
    this.saveData();
    return review;
  }

  // ==================== 个人笔记操作 ====================

  /**
   * 获取知识个人笔记
   */
  getPersonalNotes(knowledgeId) {
    return this.personalNotes[knowledgeId] || '';
  }

  /**
   * 保存知识个人笔记
   */
  savePersonalNotes(knowledgeId, notes) {
    this.personalNotes[knowledgeId] = notes;
    this.saveData();
  }

  /**
   * 获取项目笔记
   */
  getProjectNotes(projectId) {
    return this.projectNotes[projectId] || '';
  }

  /**
   * 保存项目笔记
   */
  saveProjectNotes(projectId, notes) {
    this.projectNotes[projectId] = notes;
    this.saveData();
  }
}

// 导出单例
export const interviewKnowledgeStorage = new InterviewKnowledgeStorage();