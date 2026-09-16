// 模拟面试 AI 服务

/**
 * 模拟面试 AI 服务
 * 参考 career-ops 的 Interactive Interview 功能
 */
export class MockInterviewService {
  /**
   * 开始模拟面试
   */
  static async startInterview(jobId, direction, userProfile) {
    try {
      const interview = {
        id: this.generateId(),
        jobId: jobId,
        direction: direction,
        status: 'active',
        questions: [],
        evaluation: null,
        summary: null,
        startTime: new Date().toISOString()
      };

      // 生成第一个问题
      const firstQuestion = this.generateQuestion(direction, 0, userProfile);
      interview.questions.push({
        id: this.generateId(),
        question: firstQuestion,
        answer: null,
        evaluation: null,
        timestamp: new Date().toISOString()
      });

      return interview;
    } catch (error) {
      console.error('开始模拟面试失败:', error);
      throw error;
    }
  }

  /**
   * 提交回答并获取评价
   */
  static async submitAnswer(interview, answer, userProfile) {
    try {
      const currentQuestion = interview.questions[interview.questions.length - 1];
      currentQuestion.answer = answer;
      currentQuestion.evaluation = this.evaluateAnswer(answer, currentQuestion.question);
      currentQuestion.timestamp = new Date().toISOString();

      // 生成下一个问题或结束面试
      if (interview.questions.length < 5) {
        const nextQuestion = this.generateQuestion(
          interview.direction,
          interview.questions.length,
          userProfile
        );
        interview.questions.push({
          id: this.generateId(),
          question: nextQuestion,
          answer: null,
          evaluation: null,
          timestamp: new Date().toISOString()
        });
      } else {
        // 面试结束，生成总体评价
        interview.status = 'completed';
        interview.evaluation = this.generateFinalEvaluation(interview);
        interview.summary = this.generateSummary(interview);
        interview.endTime = new Date().toISOString();
      }

      return interview;
    } catch (error) {
      console.error('提交回答失败:', error);
      throw error;
    }
  }

  /**
   * 生成问题
   */
  static generateQuestion(direction, questionIndex, userProfile) {
    const questionBank = {
      technical: [
        '请介绍一下你在 Java 并发编程方面的经验，以及你如何处理线程安全问题？',
        '请描述一下你设计的最复杂的系统架构，以及你在其中遇到的挑战。',
        '你在项目中如何进行技术选型？能举一个具体的例子吗？',
        '请谈谈你对微服务架构的理解，以及你在实践中的经验。',
        '如何处理分布式系统中的数据一致性问题？'
      ],
      behavioral: [
        '请描述一个你在项目中遇到的团队冲突，以及你是如何解决的？',
        '请分享一个你失败的项目经历，以及你从中学到了什么？',
        '当项目进度延期时，你会如何处理？',
        '请描述一次你领导团队完成重要任务的经历。',
        '你如何与产品经理和设计师协作？'
      ],
      system_design: [
        '请设计一个高并发的秒杀系统，重点说明如何处理流量削峰和库存扣减。',
        '设计一个分布式缓存系统，考虑一致性、可用性和分区容错性。',
        '如何设计一个支持百万级用户的即时通讯系统？',
        '设计一个消息队列系统，考虑消息的可靠性投递和顺序性。',
        '如何设计一个全球分布的数据库系统？'
      ],
      project: [
        '请详细介绍你最自豪的一个项目，包括技术架构、你的职责和遇到的挑战。',
        '在你的项目中，最大的技术难点是什么？你是如何解决的？',
        '如果让你重新设计你的上一个项目，你会做哪些改进？',
        '请描述一个项目中你需要做出重要技术决策的情况。',
        '你的项目如何保证代码质量和系统稳定性？'
      ]
    };

    const questions = questionBank[direction] || questionBank.technical;
    return questions[questionIndex % questions.length];
  }

  /**
   * 评价回答
   */
  static evaluateAnswer(answer, question) {
    const evaluation = {
      completeness: this.assessCompleteness(answer),
      technicalDepth: this.assessTechnicalDepth(answer, question),
      clarity: this.assessClarity(answer),
      relevance: this.assessRelevance(answer, question),
      riskPoints: this.identifyRiskPoints(answer),
      suggestions: this.generateSuggestions(answer)
    };

    return evaluation;
  }

  /**
   * 评估回答完整性
   */
  static assessCompleteness(answer) {
    if (answer.length < 50) return '不完整';
    if (answer.length < 150) return '基本完整';
    if (answer.length < 300) return '完整';
    return '非常完整';
  }

  /**
   * 评估技术深度
   */
  static assessTechnicalDepth(answer, question) {
    const technicalKeywords = ['架构', '算法', '性能', '优化', '设计模式', '原理', '机制'];
    const hasTechnicalContent = technicalKeywords.some(keyword => 
      answer.includes(keyword)
    );

    if (!hasTechnicalContent) return '较浅';
    if (answer.length > 200 && hasTechnicalContent) return '适中';
    return '较深';
  }

  /**
   * 评估表达清晰度
   */
  static assessClarity(answer) {
    const sentences = answer.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    if (sentences.length < 2) return '需改进';
    if (sentences.length < 4) return '基本清晰';
    return '清晰';
  }

  /**
   * 评估相关性
   */
  static assessRelevance(answer, question) {
    // 简单的关键词匹配
    const questionKeywords = question.split(/[\s，,。！？.!?]/).filter(w => w.length > 1);
    const relevantKeywords = questionKeywords.filter(keyword => 
      answer.includes(keyword)
    );

    if (relevantKeywords.length === 0) return '相关性较低';
    if (relevantKeywords.length < 2) return '基本相关';
    return '高度相关';
  }

  /**
   * 识别风险点
   */
  static identifyRiskPoints(answer) {
    const riskPoints = [];
    
    if (answer.includes('不知道') || answer.includes('不清楚')) {
      riskPoints.push('存在知识盲区');
    }
    if (answer.length < 50) {
      riskPoints.push('回答过于简短');
    }
    if (!answer.includes('例如') && !answer.includes('比如') && !answer.includes('具体')) {
      riskPoints.push('缺乏具体案例');
    }

    return riskPoints;
  }

  /**
   * 生成建议
   */
  static generateSuggestions(answer) {
    const suggestions = [];
    
    if (answer.length < 100) {
      suggestions.push('建议增加回答的详细程度');
    }
    if (!answer.includes('项目') && !answer.includes('实践')) {
      suggestions.push('建议结合具体项目经验');
    }
    if (!answer.includes('结果') && !answer.includes('效果')) {
      suggestions.push('建议说明行动的结果和影响');
    }

    return suggestions;
  }

  /**
   * 生成最终评价
   */
  static generateFinalEvaluation(interview) {
    const answeredQuestions = interview.questions.filter(q => q.answer);
    const evaluations = answeredQuestions.map(q => q.evaluation);

    const avgCompleteness = this.calculateAverage(evaluations, 'completeness');
    const avgTechnicalDepth = this.calculateAverage(evaluations, 'technicalDepth');
    const avgClarity = this.calculateAverage(evaluations, 'clarity');
    const avgRelevance = this.calculateAverage(evaluations, 'relevance');

    const overallScore = this.calculateOverallScore(
      avgCompleteness,
      avgTechnicalDepth,
      avgClarity,
      avgRelevance
    );

    return {
      overallScore: overallScore,
      completeness: avgCompleteness,
      technicalDepth: avgTechnicalDepth,
      clarity: avgClarity,
      relevance: avgRelevance,
      strengths: this.identifyStrengths(evaluations),
      improvements: this.identifyImprovements(evaluations),
      riskAreas: this.identifyRiskAreas(evaluations)
    };
  }

  /**
   * 计算平均值
   */
  static calculateAverage(evaluations, field) {
    const values = evaluations.map(e => {
      const scoreMap = {
        '不完整': 1,
        '基本完整': 2,
        '完整': 3,
        '非常完整': 4,
        '较浅': 1,
        '适中': 2,
        '较深': 3,
        '需改进': 1,
        '基本清晰': 2,
        '清晰': 3,
        '相关性较低': 1,
        '基本相关': 2,
        '高度相关': 3
      };
      return scoreMap[e[field]] || 2;
    });

    return values.length > 0 
      ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
      : 0;
  }

  /**
   * 计算总体分数
   */
  static calculateOverallScore(completeness, technicalDepth, clarity, relevance) {
    const score = (
      parseFloat(completeness) * 0.25 +
      parseFloat(technicalDepth) * 0.35 +
      parseFloat(clarity) * 0.2 +
      parseFloat(relevance) * 0.2
    ) * 25; // 转换为百分制

    return Math.round(score);
  }

  /**
   * 识别优势
   */
  static identifyStrengths(evaluations) {
    const strengths = [];
    
    const avgCompleteness = this.calculateAverage(evaluations, 'completeness');
    const avgTechnicalDepth = this.calculateAverage(evaluations, 'technicalDepth');
    const avgClarity = this.calculateAverage(evaluations, 'clarity');

    if (avgCompleteness >= 3) {
      strengths.push('回答完整性好');
    }
    if (avgTechnicalDepth >= 2.5) {
      strengths.push('技术深度适中');
    }
    if (avgClarity >= 2.5) {
      strengths.push('表达清晰');
    }

    return strengths.length > 0 ? strengths : ['态度积极'];
  }

  /**
   * 识别改进点
   */
  static identifyImprovements(evaluations) {
    const improvements = [];
    
    const avgCompleteness = this.calculateAverage(evaluations, 'completeness');
    const avgTechnicalDepth = this.calculateAverage(evaluations, 'technicalDepth');
    const avgClarity = this.calculateAverage(evaluations, 'clarity');

    if (avgCompleteness < 2.5) {
      improvements.push('需要增加回答的详细程度');
    }
    if (avgTechnicalDepth < 2) {
      improvements.push('需要加强技术深度');
    }
    if (avgClarity < 2) {
      improvements.push('需要提高表达的清晰度');
    }

    return improvements;
  }

  /**
   * 识别风险区域
   */
  static identifyRiskAreas(evaluations) {
    const riskAreas = [];
    
    evaluations.forEach(evaluation => {
      if (evaluation.riskPoints && evaluation.riskPoints.length > 0) {
        riskAreas.push(...evaluation.riskPoints);
      }
    });

    return [...new Set(riskAreas)]; // 去重
  }

  /**
   * 生成总结
   */
  static generateSummary(interview) {
    const answeredCount = interview.questions.filter(q => q.answer).length;
    const totalQuestions = interview.questions.length;
    const evaluation = interview.evaluation;

    return `本次模拟面试共回答了 ${answeredCount} 道题目，总体评分 ${evaluation.overallScore} 分。
    
优势：${evaluation.strengths.join('、')}
    
需要改进：${evaluation.improvements.join('、')}
    
建议：在真实面试中，重点加强对${evaluation.riskAreas.join('、')}方面的准备，继续保持${evaluation.strengths.join('、')}方面的优势。`;
  }

  /**
   * 生成 ID
   */
  static generateId() {
    return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}