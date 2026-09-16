// AI面试知识模块数据模型

/**
 * 知识来源枚举
 */
export const KnowledgeSource = {
  PUBLIC: 'PUBLIC',      // 来自ai-interview-guide
  PERSONAL: 'PERSONAL',  // 来自career
  GENERATED: 'GENERATED', // AI生成
};

/**
 * 知识分类枚举
 */
export const KnowledgeCategory = {
  LLM: 'llm',
  PROMPT_ENGINEERING: 'prompt_engineering',
  RAG: 'rag',
  AGENT: 'agent',
  MCP: 'mcp',
  TRANSFORMER: 'transformer',
  EMBEDDING: 'embedding',
  VECTOR_DATABASE: 'vector_database',
  AI_APPLICATION_ARCHITECTURE: 'ai_application_architecture',
  AI_SYSTEM_DESIGN: 'ai_system_design',
  AI_ENGINEERING: 'ai_engineering',
  AI_CODING: 'ai_coding',
  PYTHON: 'python',
  MODEL_SERVING: 'model_serving',
  INFERENCE: 'inference',
  FINE_TUNING: 'fine_tuning',
  EVALUATION: 'evaluation',
  DEPLOYMENT: 'deployment',
  JAVA: 'java',
  GO: 'go',
  MYSQL: 'mysql',
  REDIS: 'redis',
  MQ: 'mq',
  JVM: 'jvm',
  SPRING: 'spring',
  MICROSERVICES: 'microservices',
  DISTRIBUTED_SYSTEM: 'distributed_system',
  SYSTEM_DESIGN: 'system_design',
};

/**
 * 关联优先级枚举
 */
export const RelationPriority = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

/**
 * 知识模型
 */
export class Knowledge {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.title = data.title || '';
    this.content = data.content || '';
    this.category = data.category || '';
    this.subcategory = data.subcategory || '';
    this.difficulty = data.difficulty || 3; // 1-5星
    this.frequency = data.frequency || 3; // 1-5高频程度
    this.tags = data.tags || [];
    this.source = data.source || KnowledgeSource.PUBLIC;
    this.sourceUrl = data.sourceUrl || '';
    this.sourceRepository = data.sourceRepository || '';
    this.sourceVersion = data.sourceVersion || '';
    this.sourcePath = data.sourcePath || '';
    this.relatedSkills = data.relatedSkills || [];
    this.relatedProjects = data.relatedProjects || [];
    this.relatedQuestions = data.relatedQuestions || [];
    this.relatedKnowledge = data.relatedKnowledge || [];
    this.personalAnswerIds = data.personalAnswerIds || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  generateId() {
    return `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 面试题模型
 */
export class InterviewQuestion {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.title = data.title || '';
    this.content = data.content || '';
    this.category = data.category || '';
    this.difficulty = data.difficulty || 3;
    this.frequency = data.frequency || 3;
    this.relatedKnowledge = data.relatedKnowledge || [];
    this.relatedProjects = data.relatedProjects || [];
    this.followUpQuestions = data.followUpQuestions || [];
    this.source = data.source || KnowledgeSource.PUBLIC;
    this.priority = data.priority || ''; // 面试优先顺序
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  generateId() {
    return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 个人回答模型
 */
export class PersonalAnswer {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.questionId = data.questionId || '';
    this.knowledgeId = data.knowledgeId || '';
    this.projectId = data.projectId || '';
    this.content = data.content || '';
    this.version = data.version || 1;
    this.lastReviewed = data.lastReviewed || null;
    this.feedback = data.feedback || '';
    this.improvement = data.improvement || '';
    this.source = data.source || 'career';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  generateId() {
    return `answer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 项目模型（来自career）
 */
export class InterviewProject {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.description = data.description || '';
    this.role = data.role || '';
    this.technologies = data.technologies || [];
    this.achievements = data.achievements || [];
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.source = data.source || 'PERSONAL';
    this.relatedKnowledge = data.relatedKnowledge || [];
    this.relatedQuestions = data.relatedQuestions || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  generateId() {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 岗位模型
 */
export class JobPosition {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.title = data.title || '';
    this.description = data.description || '';
    this.requirements = data.requirements || [];
    this.responsibilities = data.responsibilities || [];
    this.requiredSkills = data.requiredSkills || [];
    this.preferredSkills = data.preferredSkills || [];
    this.source = data.source || 'MANUAL';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  generateId() {
    return `jobpos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 岗位-知识匹配模型
 */
export class JobKnowledgeMatch {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.jobPositionId = data.jobPositionId || '';
    this.knowledgeId = data.knowledgeId || '';
    this.priority = data.priority || RelationPriority.MEDIUM;
    this.matchReason = data.matchReason || '';
    this.userProficiency = data.userProficiency || 0; // 1-5
  }

  generateId() {
    return `jobmatch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 岗位-面试题匹配模型
 */
export class JobQuestionMatch {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.jobPositionId = data.jobPositionId || '';
    this.questionId = data.questionId || '';
    this.priority = data.priority || RelationPriority.MEDIUM;
    this.frequency = data.frequency || 0;
  }

  generateId() {
    return `jobqmatch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 模拟面试会话模型
 */
export class SimulationSession {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.jobPositionId = data.jobPositionId || '';
    this.userId = data.userId || '';
    this.status = data.status || 'ACTIVE'; // ACTIVE, COMPLETED, ABANDONED
    this.questions = data.questions || [];
    this.answers = data.answers || [];
    this.feedback = data.feedback || {};
    this.startedAt = data.startedAt || new Date();
    this.completedAt = data.completedAt || null;
  }

  generateId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}