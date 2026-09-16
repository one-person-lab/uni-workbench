import { useState, useEffect } from 'react';
import { CareerStorageService } from '../career/storage';

/**
 * 职业生涯数据访问 Hook
 */
export function useCareerData() {
  const [careerData, setCareerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCareerData();
  }, []);

  const loadCareerData = async () => {
    try {
      setLoading(true);
      
      // 首先尝试从本地存储加载
      const savedData = CareerStorageService.loadCareerData();
      if (savedData) {
        setCareerData(savedData);
        setLoading(false);
        return;
      }

      // 如果没有本地数据，使用模拟数据
      const mockData = getMockCareerData();
      setCareerData(mockData);
      
      // 保存到本地存储
      CareerStorageService.saveCareerData(mockData);
      
    } catch (err) {
      setError(err);
      // 如果加载失败，使用模拟数据
      const mockData = getMockCareerData();
      setCareerData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const saveCareerData = (data) => {
    setCareerData(data);
    CareerStorageService.saveCareerData(data);
  };

  return { careerData, loading, error, saveCareerData };
}

/**
 * 获取模拟职业生涯数据
 */
function getMockCareerData() {
  return {
    currentGoal: {
      title: 'AI应用架构师',
      description: '专注于AI技术应用与架构设计，提升产品思维和业务洞察',
    },
    activeJobs: [
      {
        id: 'job_1',
        company: '某科技公司',
        title: 'AI应用架构师',
        status: 'interviewing',
        matchScore: 85,
      },
    ],
    interviewProgress: [
      {
        id: 'interview_1',
        company: '某科技公司',
        role: 'AI应用架构师',
        round: '二面',
        date: '2026-08-26',
        prepProgress: 60,
      },
    ],
    recentProjects: [
      {
        id: 'project_1',
        name: '消防物联网平台',
        description: '基于微服务架构的物联网监控平台',
        techStack: ['Java', 'Spring Cloud', 'Redis', 'MySQL'],
      },
      {
        id: 'project_2',
        name: 'AI数据分析平台',
        description: '工业大模型数据分析与应用',
        techStack: ['Python', 'TensorFlow', 'RAG', 'LangChain'],
      },
    ],
    assets: {
      stories: 12,
      questions: 45,
      projects: 8,
      skills: 32,
    },
    // 岗位数据
    jobs: [
      {
        id: 'job_1',
        company: '某科技公司',
        title: 'AI应用架构师',
        description: '负责AI应用架构设计与技术选型，带领团队完成AI产品落地',
        source: '招聘网站',
        location: '北京',
        salary: '30-50K',
        status: 'interviewing',
        matchScore: 85,
        createdAt: new Date('2026-08-01'),
        analysis: {
          summary: '该岗位要求具备AI应用架构设计能力，需要熟悉大模型应用开发和技术架构设计',
          coreResponsibilities: [
            'AI应用架构设计',
            '技术选型与评估',
            '团队技术指导',
            'AI产品落地推进'
          ],
          coreTechnologies: ['Python', 'TensorFlow', 'PyTorch', 'RAG', 'LangChain', '微服务'],
          requirements: ['5年以上AI开发经验', '架构设计经验', '团队管理经验'],
          bonuses: ['大模型项目经验', '云原生经验'],
          level: '资深',
          myMatchScore: 85,
          advantages: ['具备丰富的AI项目经验', '熟悉RAG和LangChain', '有架构设计经验'],
          gaps: ['云原生经验不足', '团队管理经验有限'],
          risks: ['竞争激烈', '技术栈要求高'],
          suggestions: ['重点准备RAG和LangChain相关技术', '补充云原生知识'],
          relatedProjects: ['AI数据分析平台', '消防物联网平台'],
          relatedKnowledge: ['RAG技术', 'LangChain框架', '微服务架构'],
          interviewFocus: ['RAG技术原理', '架构设计思路', '项目经验']
        }
      },
      {
        id: 'job_2',
        company: '某互联网公司',
        title: '后端架构师',
        description: '负责后端系统架构设计，保证系统高可用和高性能',
        source: '内推',
        location: '上海',
        salary: '35-55K',
        status: 'pending_evaluation',
        matchScore: 75,
        createdAt: new Date('2026-08-15'),
      }
    ],
    // 求职进度数据
    applications: [
      {
        id: 'app_1',
        jobId: 'job_1',
        company: '某科技公司',
        role: 'AI应用架构师',
        status: 'second_round',
        interviewRound: 2,
        currentStage: '二面准备',
        timeline: [
          { date: '2026-08-20', title: '投递简历', description: '通过招聘网站投递简历' },
          { date: '2026-08-23', title: '一面', description: '技术面试，主要考察AI技术基础' },
          { date: '2026-08-26', title: '二面', description: '架构面试，主要考察系统设计能力' }
        ],
        result: null
      }
    ],
    // 当前面试数据
    currentInterviews: [
      {
        id: 'interview_1',
        company: '某科技公司',
        role: 'AI应用架构师',
        round: '二面',
        date: '2026-08-26',
        location: '北京总部',
        prepItems: [
          { label: '项目介绍', completed: true },
          { label: 'RAG技术', completed: true },
          { label: 'LangChain', completed: true },
          { label: '系统设计', completed: false },
          { label: '架构决策', completed: false }
        ],
        nextAction: '重点准备系统设计和架构决策相关内容'
      }
    ],
    // 面试准备数据
    interviewPrep: [
      {
        jobId: 'job_1',
        jobFocus: ['AI应用架构设计', '大模型应用落地', '技术选型评估'],
        techFocus: ['Python', 'TensorFlow', 'PyTorch', 'RAG', 'LangChain', '微服务', 'Docker', 'Kubernetes'],
        projectFocus: ['AI数据分析平台', '消防物联网平台'],
        highFrequencyQuestions: [
          { question: '请介绍一下RAG技术的原理和应用场景', myAnswer: 'RAG（Retrieval-Augmented Generation）是一种结合检索和生成的AI技术...' },
          { question: '你在项目中如何选择技术栈？', myAnswer: '我会根据项目需求、团队技术能力、社区支持等因素综合考虑...' }
        ],
        possibleFollowups: ['RAG的局限性是什么？', '如何优化RAG的检索效果？'],
        knowledgeGaps: ['云原生技术需要加强', 'Kubernetes实践经验不足'],
        projectAnswers: [],
        selfIntroduction: '我是一名有9年Java开发经验的技术工程师，专注于AI应用架构设计...',
        questionsForInterviewer: ['团队的技术栈是什么？', '公司的AI业务发展方向？']
      }
    ],
    // 面试题数据
    questions: [
      {
        id: 'q_1',
        question: '请介绍一下RAG技术的原理和应用场景',
        myAnswer: 'RAG（Retrieval-Augmented Generation）是一种结合检索和生成的AI技术...',
        source: 'career',
        relatedProjects: ['AI数据分析平台'],
        relatedSkills: ['RAG', 'LangChain'],
        followups: ['RAG的局限性是什么？', '如何优化RAG的检索效果？'],
        quality: 4,
        category: 'ai'
      },
      {
        id: 'q_2',
        question: 'Java并发编程中如何保证线程安全？',
        myAnswer: 'Java中保证线程安全的方式包括：synchronized关键字、ReentrantLock、原子类、并发集合等...',
        source: 'career',
        relatedProjects: ['消防物联网平台'],
        relatedSkills: ['Java', '并发编程'],
        followups: ['synchronized和ReentrantLock的区别？', 'volatile关键字的作用？'],
        quality: 5,
        category: 'java'
      }
    ],
    // 项目面试数据
    projectInterviews: [
      {
        projectId: 'project_1',
        introduction: '消防物联网平台',
        architecture: '基于微服务架构，采用Spring Cloud作为技术框架，通过Redis缓存提升性能，使用MySQL存储业务数据',
        responsibilities: ['负责整体架构设计', '带领5人开发团队', '核心模块开发'],
        techStack: ['Java', 'Spring Cloud', 'Redis', 'MySQL', 'Docker'],
        challenges: [
          { title: '高并发处理', description: '系统需要处理大量设备上报数据' },
          { title: '数据一致性', description: '分布式环境下的数据一致性保证' }
        ],
        solutions: [
          { description: '采用消息队列削峰填谷，使用Redis缓存热点数据' },
          { description: '采用分布式事务方案，使用最终一致性保证数据一致' }
        ],
        techDecisions: ['选择Spring Cloud作为微服务框架', '使用Redis作为缓存层', '采用RabbitMQ作为消息队列'],
        outcomes: ['系统支持10万+设备接入', '响应时间<100ms', '系统可用性99.9%'],
        possibleQuestions: [
          { question: '为什么选择Spring Cloud？', answer: 'Spring Cloud生态完善，社区活跃，适合企业级应用...' },
          { question: '如何处理高并发？', answer: '通过消息队列削峰填谷，Redis缓存热点数据...' }
        ]
      }
    ],
    // 简历数据
    resume: {
      name: '张三',
      title: 'AI应用架构师',
      email: 'zhangsan@example.com',
      phone: '138****8888',
      summary: '9年Java开发经验，专注于AI应用架构设计，具备丰富的分布式系统开发经验',
      experience: [
        {
          company: '某科技公司',
          title: '技术经理',
          period: '2021-至今',
          description: '负责AI应用架构设计，带领团队完成多个AI产品落地'
        },
        {
          company: '某互联网公司',
          title: '高级Java工程师',
          period: '2018-2021',
          description: '负责核心业务系统开发，参与架构设计'
        }
      ],
      projects: [
        {
          name: 'AI数据分析平台',
          techStack: ['Python', 'TensorFlow', 'RAG', 'LangChain'],
          description: '基于大模型的数据分析平台，支持自然语言查询和数据可视化'
        },
        {
          name: '消防物联网平台',
          techStack: ['Java', 'Spring Cloud', 'Redis', 'MySQL'],
          description: '基于微服务架构的物联网监控平台，支持10万+设备接入'
        }
      ],
      skills: {
        technical: ['Java', 'Python', 'Spring Cloud', 'Redis', 'MySQL', 'RAG', 'LangChain', 'Docker'],
        soft: ['团队管理', '沟通协调', '问题解决', '项目管理']
      }
    },
    // 项目资产数据
    assetProjects: [
      {
        id: 'asset_project_1',
        name: 'AI数据分析平台',
        type: 'AI项目',
        description: '基于大模型的数据分析平台，支持自然语言查询和数据可视化',
        techStack: ['Python', 'TensorFlow', 'RAG', 'LangChain'],
        responsibilities: '负责整体架构设计和核心算法实现',
        outcomes: '平台支持10万+用户，准确率达到95%',
        interviewCount: 5,
        storyCount: 3
      },
      {
        id: 'asset_project_2',
        name: '消防物联网平台',
        type: '后端项目',
        description: '基于微服务架构的物联网监控平台，支持10万+设备接入',
        techStack: ['Java', 'Spring Cloud', 'Redis', 'MySQL'],
        responsibilities: '负责整体架构设计和团队管理',
        outcomes: '系统支持10万+设备接入，响应时间<100ms',
        interviewCount: 8,
        storyCount: 4
      }
    ],
    // 技能数据
    skills: [
      {
        id: 'skill_1',
        name: 'Java',
        category: 'programming',
        description: '熟练掌握Java核心技术，包括并发编程、JVM调优等',
        level: 90,
        experience: 9,
        projectCount: 15,
        relatedProjects: ['消防物联网平台', 'AI数据分析平台']
      },
      {
        id: 'skill_2',
        name: 'RAG',
        category: 'ai',
        description: '熟悉RAG技术原理，有实际项目应用经验',
        level: 75,
        experience: 2,
        projectCount: 3,
        relatedProjects: ['AI数据分析平台']
      },
      {
        id: 'skill_3',
        name: 'Spring Cloud',
        category: 'framework',
        description: '熟练使用Spring Cloud进行微服务开发',
        level: 85,
        experience: 5,
        projectCount: 8,
        relatedProjects: ['消防物联网平台']
      }
    ],
    // 面试故事数据
    stories: [
      {
        id: 'story_1',
        title: '解决高并发性能问题',
        category: 'performance_optimization',
        situation: '在消防物联网平台项目中，系统面临大量设备数据上报，导致数据库压力过大',
        task: '需要优化系统性能，保证系统稳定运行',
        action: '采用消息队列削峰填谷，使用Redis缓存热点数据，优化数据库查询',
        result: '系统性能提升80%，支持10万+设备接入，响应时间<100ms',
        reflection: '性能优化需要从多个维度考虑，架构设计很重要',
        relatedProjects: ['消防物联网平台'],
        relatedSkills: ['Java', 'Redis', '消息队列'],
        usageCount: 5
      },
      {
        id: 'story_2',
        title: '团队冲突处理',
        category: 'conflict_handling',
        situation: '在AI数据分析平台项目中，团队成员对技术选型存在分歧',
        task: '需要协调团队意见，推动项目进展',
        action: '组织技术讨论会，分析各种技术方案的优缺点，最终达成共识',
        result: '团队协作顺畅，项目按时交付',
        reflection: '沟通和技术分析能力对团队协作很重要',
        relatedProjects: ['AI数据分析平台'],
        relatedSkills: ['团队管理', '沟通协调'],
        usageCount: 3
      }
    ]
  };
}