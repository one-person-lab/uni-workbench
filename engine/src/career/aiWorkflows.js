// 职业生涯 AI 工作流服务

/**
 * 岗位分析 AI 工作流
 * 参考 career-ops 的 Job Evaluation 功能
 */
export class JobAnalysisWorkflow {
  /**
   * 分析岗位 JD
   */
  static async analyzeJobDescription(jobDescription, userProfile) {
    try {
      // 这里应该调用 AI API 进行分析
      // 暂时返回模拟的分析结果
      
      const analysis = {
        summary: this.extractSummary(jobDescription),
        coreResponsibilities: this.extractResponsibilities(jobDescription),
        coreTechnologies: this.extractTechnologies(jobDescription),
        requirements: this.extractRequirements(jobDescription),
        bonuses: this.extractBonuses(jobDescription),
        level: this.determineLevel(jobDescription),
        myMatchScore: this.calculateMatchScore(jobDescription, userProfile),
        advantages: this.identifyAdvantages(jobDescription, userProfile),
        gaps: this.identifyGaps(jobDescription, userProfile),
        risks: this.assessRisks(jobDescription),
        suggestions: this.generateSuggestions(jobDescription, userProfile),
        relatedProjects: this.findRelatedProjects(jobDescription, userProfile),
        relatedKnowledge: this.findRelatedKnowledge(jobDescription, userProfile),
        interviewFocus: this.determineInterviewFocus(jobDescription, userProfile)
      };

      return analysis;
    } catch (error) {
      console.error('岗位分析失败:', error);
      throw error;
    }
  }

  /**
   * 提取岗位概述
   */
  static extractSummary(jobDescription) {
    // 简单的关键词提取逻辑
    const keywords = ['AI', '架构', '后端', 'Java', 'Python', '微服务', '大数据'];
    const foundKeywords = keywords.filter(keyword => 
      jobDescription.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return `该岗位主要关注${foundKeywords.join('、')}技术，要求具备相关的架构设计和开发经验。`;
  }

  /**
   * 提取核心职责
   */
  static extractResponsibilities(jobDescription) {
    const responsibilities = [];
    
    if (jobDescription.includes('架构') || jobDescription.includes('设计')) {
      responsibilities.push('系统架构设计');
    }
    if (jobDescription.includes('开发') || jobDescription.includes('编程')) {
      responsibilities.push('核心功能开发');
    }
    if (jobDescription.includes('团队') || jobDescription.includes('管理')) {
      responsibilities.push('团队技术管理');
    }
    if (jobDescription.includes('AI') || jobDescription.includes('算法')) {
      responsibilities.push('AI技术应用');
    }
    
    return responsibilities.length > 0 ? responsibilities : ['技术开发', '系统维护'];
  }

  /**
   * 提取核心技术
   */
  static extractTechnologies(jobDescription) {
    const techMap = {
      'java': 'Java',
      'python': 'Python',
      'spring': 'Spring',
      'spring cloud': 'Spring Cloud',
      'redis': 'Redis',
      'mysql': 'MySQL',
      '微服务': '微服务',
      'docker': 'Docker',
      'kubernetes': 'Kubernetes',
      'ai': 'AI',
      '机器学习': '机器学习',
      '深度学习': '深度学习',
      'tensorflow': 'TensorFlow',
      'pytorch': 'PyTorch',
      'rag': 'RAG',
      'langchain': 'LangChain',
      '大数据': '大数据',
      '分布式': '分布式系统'
    };

    const technologies = [];
    for (const [key, value] of Object.entries(techMap)) {
      if (jobDescription.toLowerCase().includes(key)) {
        technologies.push(value);
      }
    }

    return technologies.length > 0 ? technologies : ['Java', 'Spring'];
  }

  /**
   * 提取要求
   */
  static extractRequirements(jobDescription) {
    const requirements = [];
    
    if (jobDescription.includes('年') && /\d+/.test(jobDescription)) {
      const years = jobDescription.match(/\d+/)[0];
      requirements.push(`${years}年以上相关经验`);
    }
    if (jobDescription.includes('本科') || jobDescription.includes('学历')) {
      requirements.push('本科及以上学历');
    }
    if (jobDescription.includes('架构') || jobDescription.includes('设计')) {
      requirements.push('架构设计经验');
    }
    if (jobDescription.includes('团队') || jobDescription.includes('管理')) {
      requirements.push('团队管理经验');
    }

    return requirements.length > 0 ? requirements : ['相关技术经验'];
  }

  /**
   * 提取加分项
   */
  static extractBonuses(jobDescription) {
    const bonuses = [];
    
    if (jobDescription.includes('大厂') || jobDescription.includes('知名企业')) {
      bonuses.push('知名企业背景');
    }
    if (jobDescription.includes('开源') || jobDescription.includes('GitHub')) {
      bonuses.push('开源项目经验');
    }
    if (jobDescription.includes('英语') || jobDescription.includes('English')) {
      bonuses.push('英语能力');
    }

    return bonuses;
  }

  /**
   * 确定岗位级别
   */
  static determineLevel(jobDescription) {
    if (jobDescription.includes('资深') || jobDescription.includes('高级') || jobDescription.includes('Senior')) {
      return '资深';
    }
    if (jobDescription.includes('专家') || jobDescription.includes('Expert') || jobDescription.includes('架构')) {
      return '专家';
    }
    if (jobDescription.includes('经理') || jobDescription.includes('Manager') || jobDescription.includes('负责人')) {
      return '管理';
    }
    if (jobDescription.includes('初级') || jobDescription.includes('Junior')) {
      return '初级';
    }
    
    return '中级';
  }

  /**
   * 计算匹配度
   */
  static calculateMatchScore(jobDescription, userProfile) {
    let score = 50; // 基础分
    
    const technologies = this.extractTechnologies(jobDescription);
    const userSkills = userProfile?.skills || [];
    
    // 技术匹配
    const techMatch = technologies.filter(tech => 
      userSkills.some(skill => 
        skill.toLowerCase().includes(tech.toLowerCase()) ||
        tech.toLowerCase().includes(skill.toLowerCase())
      )
    );
    score += (techMatch.length / Math.max(technologies.length, 1)) * 20;
    
    // 经验匹配
    const requiredYears = this.extractRequiredYears(jobDescription);
    const userYears = userProfile?.experience || 0;
    if (userYears >= requiredYears) {
      score += 15;
    } else if (userYears >= requiredYears * 0.8) {
      score += 10;
    }
    
    // 职位匹配
    if (jobDescription.includes('架构') && userProfile?.architectureExperience) {
      score += 10;
    }
    if (jobDescription.includes('管理') && userProfile?.managementExperience) {
      score += 5;
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * 提取要求的年限
   */
  static extractRequiredYears(jobDescription) {
    const match = jobDescription.match(/(\d+)\s*年/);
    return match ? parseInt(match[1]) : 3;
  }

  /**
   * 识别优势
   */
  static identifyAdvantages(jobDescription, userProfile) {
    const advantages = [];
    const technologies = this.extractTechnologies(jobDescription);
    const userSkills = userProfile?.skills || [];
    
    // 技术优势
    const techMatch = technologies.filter(tech => 
      userSkills.some(skill => skill.toLowerCase().includes(tech.toLowerCase()))
    );
    if (techMatch.length > 0) {
      advantages.push(`具备${techMatch.join('、')}技术经验`);
    }
    
    // 经验优势
    if (userProfile?.experience > 5) {
      advantages.push('具备丰富的工作经验');
    }
    
    // 项目优势
    if (userProfile?.projects?.length > 0) {
      advantages.push('有相关项目经验');
    }

    return advantages.length > 0 ? advantages : ['技术基础扎实'];
  }

  /**
   * 识别差距
   */
  static identifyGaps(jobDescription, userProfile) {
    const gaps = [];
    const technologies = this.extractTechnologies(jobDescription);
    const userSkills = userProfile?.skills || [];
    
    // 技术差距
    const techGaps = technologies.filter(tech => 
      !userSkills.some(skill => skill.toLowerCase().includes(tech.toLowerCase()))
    );
    if (techGaps.length > 0) {
      gaps.push(`需要补充${techGaps.join('、')}技术知识`);
    }
    
    // 经验差距
    const requiredYears = this.extractRequiredYears(jobDescription);
    const userYears = userProfile?.experience || 0;
    if (userYears < requiredYears) {
      gaps.push(`工作经验需要达到${requiredYears}年`);
    }

    return gaps;
  }

  /**
   * 评估风险
   */
  static assessRisks(jobDescription) {
    const risks = [];
    
    if (jobDescription.includes('高并发') || jobDescription.includes('大流量')) {
      risks.push('高并发系统挑战较大');
    }
    if (jobDescription.includes('AI') || jobDescription.includes('算法')) {
      risks.push('AI技术更新快，需要持续学习');
    }
    if (jobDescription.includes('架构') || jobDescription.includes('设计')) {
      risks.push('架构设计责任重大，决策影响深远');
    }

    return risks.length > 0 ? risks : ['需要适应新的技术环境'];
  }

  /**
   * 生成建议
   */
  static generateSuggestions(jobDescription, userProfile) {
    const suggestions = [];
    const technologies = this.extractTechnologies(jobDescription);
    const gaps = this.identifyGaps(jobDescription, userProfile);
    
    // 基于差距生成建议
    gaps.forEach(gap => {
      suggestions.push(`重点${gap.replace('需要', '学习和准备')}`);
    });
    
    // 通用建议
    suggestions.push('深入研究相关技术原理');
    suggestions.push('准备相关项目案例');
    suggestions.push('了解行业趋势和最佳实践');

    return suggestions;
  }

  /**
   * 查找相关项目
   */
  static findRelatedProjects(jobDescription, userProfile) {
    const technologies = this.extractTechnologies(jobDescription);
    const userProjects = userProfile?.projects || [];
    
    return userProjects.filter(project => {
      const projectTech = project.techStack || [];
      return technologies.some(tech => 
        projectTech.some(pt => pt.toLowerCase().includes(tech.toLowerCase()))
      );
    }).map(project => project.name);
  }

  /**
   * 查找相关知识
   */
  static findRelatedKnowledge(jobDescription, userProfile) {
    const technologies = this.extractTechnologies(jobDescription);
    
    return technologies.map(tech => {
      if (tech.includes('AI') || tech.includes('机器学习')) {
        return 'AI/机器学习基础';
      }
      if (tech.includes('微服务') || tech.includes('分布式')) {
        return '分布式系统设计';
      }
      if (tech.includes('Java') || tech.includes('Spring')) {
        return 'Java生态系统';
      }
      return `${tech}技术`;
    });
  }

  /**
   * 确定面试重点
   */
  static determineInterviewFocus(jobDescription, userProfile) {
    const focus = [];
    const technologies = this.extractTechnologies(jobDescription);
    
    // 技术重点
    focus.push(...technologies.slice(0, 3));
    
    // 架构重点
    if (jobDescription.includes('架构') || jobDescription.includes('设计')) {
      focus.push('系统架构设计');
      focus.push('技术选型思路');
    }
    
    // 项目重点
    focus.push('项目经验');
    focus.push('技术难点解决');

    return focus;
  }
}

/**
 * 面试准备工作流
 */
export class InterviewPrepWorkflow {
  /**
   * 生成面试准备方案
   */
  static async generatePrepPlan(jobId, jobAnalysis, userProfile) {
    try {
      const prepPlan = {
        jobId: jobId,
        jobFocus: this.extractJobFocus(jobAnalysis),
        techFocus: this.extractTechFocus(jobAnalysis),
        projectFocus: this.extractProjectFocus(jobAnalysis, userProfile),
        highFrequencyQuestions: this.generateHighFrequencyQuestions(jobAnalysis),
        possibleFollowups: this.generatePossibleFollowups(jobAnalysis),
        knowledgeGaps: this.identifyKnowledgeGaps(jobAnalysis, userProfile),
        projectAnswers: this.generateProjectAnswers(jobAnalysis, userProfile),
        selfIntroduction: this.generateSelfIntroduction(userProfile),
        questionsForInterviewer: this.generateQuestionsForInterviewer(jobAnalysis)
      };

      return prepPlan;
    } catch (error) {
      console.error('生成面试准备方案失败:', error);
      throw error;
    }
  }

  /**
   * 提取岗位重点
   */
  static extractJobFocus(jobAnalysis) {
    return jobAnalysis?.coreResponsibilities || [];
  }

  /**
   * 提取技术重点
   */
  static extractTechFocus(jobAnalysis) {
    return jobAnalysis?.coreTechnologies || [];
  }

  /**
   * 提取项目重点
   */
  static extractProjectFocus(jobAnalysis, userProfile) {
    return jobAnalysis?.relatedProjects || [];
  }

  /**
   * 生成高频问题
   */
  static generateHighFrequencyQuestions(jobAnalysis) {
    const questions = [];
    const technologies = jobAnalysis?.coreTechnologies || [];
    
    // 基于技术生成问题
    technologies.forEach(tech => {
      questions.push({
        question: `请介绍一下你在${tech}方面的经验`,
        myAnswer: '',
        source: 'generated'
      });
    });

    // 通用问题
    questions.push({
      question: '请介绍一下你的项目经验',
      myAnswer: '',
      source: 'generated'
    });

    return questions;
  }

  /**
   * 生成可能的追问
   */
  static generatePossibleFollowups(jobAnalysis) {
    return [
      '能否详细说明一下技术选型的考虑因素？',
      '在项目中遇到过什么技术挑战？如何解决的？',
      '你认为这个技术未来的发展趋势是什么？'
    ];
  }

  /**
   * 识别知识差距
   */
  static identifyKnowledgeGaps(jobAnalysis, userProfile) {
    return jobAnalysis?.gaps || [];
  }

  /**
   * 生成项目回答
   */
  static generateProjectAnswers(jobAnalysis, userProfile) {
    const relatedProjects = jobAnalysis?.relatedProjects || [];
    const userProjects = userProfile?.projects || [];
    
    return userProjects
      .filter(project => relatedProjects.includes(project.name))
      .map(project => ({
        projectName: project.name,
        keyPoints: [
          project.description,
          `技术栈：${project.techStack?.join('、')}`,
          `我的职责：${project.role}`
        ]
      }));
  }

  /**
   * 生成自我介绍
   */
  static generateSelfIntroduction(userProfile) {
    const experience = userProfile?.experience || 0;
    const skills = userProfile?.skills?.slice(0, 3) || [];
    
    return `我是一名有${experience}年开发经验的工程师，熟练掌握${skills.join('、')}等技术。在职业生涯中，我专注于技术深度和架构设计，参与过多个大型项目的开发和维护。我对新技术保持敏感，善于学习和解决问题，希望在新的岗位上发挥我的技术能力，为团队创造价值。`;
  }

  /**
   * 生成向面试官提问的问题
   */
  static generateQuestionsForInterviewer(jobAnalysis) {
    return [
      '团队目前的技术栈是什么？',
      '这个岗位的主要挑战是什么？',
      '公司对新技术采用的态度如何？',
      '团队规模和协作方式是怎样的？'
    ];
  }
}