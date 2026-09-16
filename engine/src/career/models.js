// 职业生涯模块数据模型

/**
 * 岗位状态枚举
 */
export const JobStatus = {
  PENDING_EVALUATION: 'pending_evaluation',
  READY_TO_APPLY: 'ready_to_apply',
  APPLIED: 'applied',
  INTERVIEWING: 'interviewing',
  OFFER: 'offer',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

/**
 * 求职进度状态枚举
 */
export const ApplicationStatus = {
  PENDING_EVALUATION: 'pending_evaluation',
  READY_TO_APPLY: 'ready_to_apply',
  APPLIED: 'applied',
  FIRST_ROUND: 'first_round',
  SECOND_ROUND: 'second_round',
  THIRD_ROUND: 'third_round',
  OFFER: 'offer',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

/**
 * 面试题分类枚举
 */
export const QuestionCategory = {
  JAVA: 'java',
  GO: 'go',
  MYSQL: 'mysql',
  REDIS: 'redis',
  JVM: 'jvm',
  MQ: 'mq',
  SPRING: 'spring',
  MICROSERVICES: 'microservices',
  SYSTEM_DESIGN: 'system_design',
  AI: 'ai',
  RAG: 'rag',
  AGENT: 'agent',
  PROJECT: 'project',
};

/**
 * 面试故事分类枚举
 */
export const StoryCategory = {
  PROJECT_SUCCESS: 'project_success',
  TECHNICAL_CHALLENGE: 'technical_challenge',
  INCIDENT_HANDLING: 'incident_handling',
  PERFORMANCE_OPTIMIZATION: 'performance_optimization',
  ARCHITECTURE_DECISION: 'architecture_decision',
  TEAM_COLLABORATION: 'team_collaboration',
  CONFLICT_HANDLING: 'conflict_handling',
  PROJECT_DELIVERY: 'project_delivery',
  FAILURE_REVIEW: 'failure_review',
};

/**
 * 岗位模型
 */
export class Job {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.company = data.company || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.source = data.source || '';
    this.location = data.location || '';
    this.salary = data.salary || null;
    this.status = data.status || JobStatus.PENDING_EVALUATION;
    this.matchScore = data.matchScore || null;
    this.createdAt = data.createdAt || new Date();
    this.analysis = data.analysis || null;
  }

  generateId() {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 岗位分析模型
 */
export class JobAnalysis {
  constructor(data = {}) {
    this.summary = data.summary || '';
    this.coreResponsibilities = data.coreResponsibilities || [];
    this.coreTechnologies = data.coreTechnologies || [];
    this.requirements = data.requirements || [];
    this.bonuses = data.bonuses || [];
    this.level = data.level || '';
    this.myMatchScore = data.myMatchScore || 0;
    this.advantages = data.advantages || [];
    this.gaps = data.gaps || [];
    this.risks = data.risks || [];
    this.suggestions = data.suggestions || [];
    this.relatedProjects = data.relatedProjects || [];
    this.relatedKnowledge = data.relatedKnowledge || [];
    this.interviewFocus = data.interviewFocus || [];
  }
}

/**
 * 求职进度模型
 */
export class Application {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.jobId = data.jobId || '';
    this.company = data.company || '';
    this.role = data.role || '';
    this.status = data.status || ApplicationStatus.PENDING_EVALUATION;
    this.interviewRound = data.interviewRound || null;
    this.currentStage = data.currentStage || '';
    this.timeline = data.timeline || [];
    this.result = data.result || null;
  }

  generateId() {
    return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 面试准备模型
 */
export class InterviewPrep {
  constructor(data = {}) {
    this.jobId = data.jobId || '';
    this.jobFocus = data.jobFocus || [];
    this.techFocus = data.techFocus || [];
    this.projectFocus = data.projectFocus || [];
    this.highFrequencyQuestions = data.highFrequencyQuestions || [];
    this.possibleFollowups = data.possibleFollowups || [];
    this.knowledgeGaps = data.knowledgeGaps || [];
    this.projectAnswers = data.projectAnswers || [];
    this.selfIntroduction = data.selfIntroduction || '';
    this.questionsForInterviewer = data.questionsForInterviewer || [];
  }
}

/**
 * 面试题模型
 */
export class Question {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.question = data.question || '';
    this.myAnswer = data.myAnswer || '';
    this.source = data.source || '';
    this.relatedProjects = data.relatedProjects || [];
    this.relatedSkills = data.relatedSkills || [];
    this.followups = data.followups || [];
    this.quality = data.quality || 0;
    this.category = data.category || QuestionCategory.PROJECT;
  }

  generateId() {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 项目面试模型
 */
export class ProjectInterview {
  constructor(data = {}) {
    this.projectId = data.projectId || '';
    this.introduction = data.introduction || '';
    this.architecture = data.architecture || '';
    this.responsibilities = data.responsibilities || [];
    this.techStack = data.techStack || [];
    this.challenges = data.challenges || [];
    this.solutions = data.solutions || [];
    this.techDecisions = data.techDecisions || [];
    this.outcomes = data.outcomes || [];
    this.possibleQuestions = data.possibleQuestions || [];
  }
}

/**
 * 面试故事模型
 */
export class InterviewStory {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.title = data.title || '';
    this.category = data.category || StoryCategory.PROJECT_SUCCESS;
    this.situation = data.situation || '';
    this.task = data.task || '';
    this.action = data.action || '';
    this.result = data.result || '';
    this.reflection = data.reflection || '';
    this.relatedProjects = data.relatedProjects || [];
    this.relatedSkills = data.relatedSkills || [];
    this.usageCount = data.usageCount || 0;
  }

  generateId() {
    return `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 模拟面试模型
 */
export class MockInterview {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.jobId = data.jobId || '';
    this.direction = data.direction || '';
    this.questions = data.questions || [];
    this.evaluation = data.evaluation || null;
    this.summary = data.summary || '';
  }

  generateId() {
    return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}