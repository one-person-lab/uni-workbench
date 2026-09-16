// 职业生涯模块路由配置

export const careerRoutes = [
  {
    path: '/career',
    children: [
      {
        index: true,
        element: () => import('./pages/interview/InterviewAssetCenterPage'),
      },
      {
        path: 'jobs',
        children: [
          {
            index: true,
            element: () => import('./pages/CareerJobsPage'),
          },
          {
            path: ':jobId',
            element: () => import('./pages/CareerJobDetailPage'),
          },
        ],
      },
      {
        path: 'applications',
        element: () => import('./pages/CareerApplicationsPage'),
      },
      {
        path: 'interview',
        children: [
          {
            index: true,
            element: () => import('./pages/interview/InterviewAssetCenterPage'),
          },
          {
            path: 'topics',
            element: () => import('./pages/interview/InterviewTopicsPage'),
          },
          {
            path: 'reviews',
            element: () => import('./pages/interview/InterviewReviewsPage'),
          },
          {
            path: 'ai-knowledge',
            children: [
              {
                index: true,
                element: () => import('./pages/interview/AiKnowledgeHomePage'),
              },
              {
                path: ':id',
                element: () => import('./pages/interview/AiKnowledgeDetailPage'),
              },
              {
                path: 'manage',
                element: () => import('./pages/interview/AiKnowledgeManagePage'),
              },
            ],
          },
          {
            path: 'questions',
            children: [
              {
                index: true,
                element: () => import('./pages/interview/InterviewQuestionsPage'),
              },
              {
                path: ':id',
                element: () => import('./pages/interview/InterviewQuestionDetailPage'),
              },
            ],
          },
          {
            path: 'my-answers',
            element: () => import('./pages/interview/InterviewMyAnswersPage'),
          },
          {
            path: 'current',
            element: () => import('./pages/CareerCurrentInterviewPage'),
          },
          {
            path: 'prep/:jobId',
            element: () => import('./pages/CareerInterviewPrepPage'),
          },
          {
            path: 'projects/:projectId',
            element: () => import('./pages/interview/InterviewProjectDetailPage'),
          },
          {
            path: 'mock',
            element: () => import('./pages/CareerMockInterviewPage'),
          },
        ],
      },
      {
        path: 'assets',
        children: [
          {
            path: 'resume',
            element: () => import('./pages/CareerResumePage'),
          },
          {
            path: 'projects',
            element: () => import('./pages/CareerAssetProjectsPage'),
          },
          {
            path: 'skills',
            element: () => import('./pages/CareerSkillsPage'),
          },
          {
            path: 'stories',
            element: () => import('./pages/CareerStoriesPage'),
          },
        ],
      },
    ],
  },
];