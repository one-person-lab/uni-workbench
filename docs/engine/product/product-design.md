# BeU Workbench 产品设计文档

## 文档概述

本文档统一管理 BeU Workbench 的产品功能、技术栈、架构设计和开发指南，包括新增的「职业生涯」模块的详细设计。

**版本**: 1.0.0  
**最后更新**: 2026-08-21  
**维护者**: BeU Workbench Team

---

## 1. 产品定位与价值主张

### 1.1 产品定位

BeU Workbench 不是另一个笔记工具、知识库或 Dashboard，而是**个人能力的操作系统**。

**核心差异化：** 将"一个人的专业能力"从静态知识转化为可执行、可迭代、可交易的数字化资产。

**BeU = Be You**  
**Workbench = 能力操作系统**

### 1.2 核心价值主张

**传统工具的问题：**
- 知识库：静态存储，被动检索，知识无法自动转化为能力
- 笔记工具：内容编辑为主，缺乏执行和迭代机制
- AI Agent 平台：任务执行为主，缺乏个人知识沉淀和能力管理
- Dashboard：数据展示为主，缺乏主动执行和闭环迭代

**BeU Workbench 的解决方案：**
- **Knowledge → Skills → Workflows → Agents → Execution → Results → Knowledge → Skills Iteration**
- 形成完整的能力闭环
- 将个人能力数字化、结构化、可交易化

### 1.3 目标用户

- **技术从业者**：工程师、架构师、技术管理者
- **内容创作者**：写作者、研究者、分析师
- **求职者**：正在求职或准备面试的专业人士
- **终身学习者**：希望系统化管理个人知识的人群

---

## 2. 产品功能架构

### 2.1 核心模块总览

```
BeU Workbench
├── 知识库 (Knowledge)
├── 技能 (Skills)
├── 工作流 (Workflows)
├── AI助手 (AI Assistant)
├── 项目 (Projects)
├── 职业生涯 (Career) [新增]
└── 设置 (Settings)
```

### 2.2 模块间关系和数据流

```
知识库 → 技能 → 工作流 → AI助手 → 执行结果 → 知识库 (闭环)
   ↓       ↓        ↓        ↓
职业生涯 ← 项目 ← 项目管理 ← 执行追踪
```

### 2.3 职业生涯模块详细设计

#### 2.3.1 信息架构

```
职业生涯
├── 总览
│   ├── 当前目标
│   ├── 正在准备的岗位
│   ├── 面试进度
│   ├── 待准备内容
│   ├── 最近项目
│   └── 职业资产概览
│
├── 求职
│   ├── 岗位
│   │   ├── 岗位列表
│   │   ├── 岗位详情
│   │   └── 岗位分析（AI）
│   └── 求职进度
│       ├── 公司列表
│       ├── Timeline
│       └── 状态追踪
│
├── 面试
│   ├── 当前面试
│   ├── 面试准备
│   ├── 面试题库
│   ├── 项目面试
│   └── 模拟面试
│
└── 资产
    ├── 简历
    ├── 项目
    ├── 技能
    └── 面试故事
```

#### 2.3.2 功能映射

| career-ops 功能 | BeU Workbench 功能映射 |
|---|---|
| Job Evaluation (oferta.md) | 职业生涯 / 求职 / 岗位分析 |
| Interview Story Bank | 职业生涯 / 资产 / 面试故事 |
| Interview Suite (interview-prep.md) | 职业生涯 / 面试 / 面试准备 |
| Pipeline (pipeline.md) | 职业生涯 / 求职 / 求职进度 |
| Tracker (data/applications.md) | 职业生涯 / 求职 / 求职进度 Timeline |
| Resume Generation (generate-pdf.mjs) | 职业生涯 / 资产 / 简历 |
| Company Research | 职业生涯 / 求职 / 岗位分析（公司调研） |
| Archetype Detection | 职业生涯 / 求职 / 岗位分析（岗位类型） |
| CV Match (Block B) | 职业生涯 / 求职 / 岗位匹配 |
| Interview Prep (Block F) | 职业生涯 / 面试 / 面试准备 |
| Liveness Check | 职业生涯 / 求职 / 岗位状态验证 |
| Blacklist Gate | 职业生涯 / 求职 / 岗位过滤 |
| Project Evaluation | 职业生涯 / 资产 / 项目面试 |
| Interactive Interview | 职业生涯 / 面试 / 模拟面试 |

| career 内容 | 映射页面 |
|---|---|
| 01-规划/01-职业定位/职业定位.md | 职业生涯 / 总览 / 当前目标 |
| 01-规划/02-目标岗位/ | 职业生涯 / 求职 / 岗位分析参考 |
| 02-简历/01-简历/ | 职业生涯 / 资产 / 简历 |
| 03-面试/01-面试准备/常规问答/ | 职业生涯 / 面试 / 面试准备 / 常规问答 |
| 03-面试/01-面试准备/架构设计/ | 职业生涯 / 面试 / 面试准备 / 架构设计 |
| 03-面试/01-面试准备/管理能力/ | 职业生涯 / 面试 / 面试准备 / 管理能力 |
| 03-面试/01-面试准备/项目案例/ | 职业生涯 / 面试 / 项目面试 |
| 03-面试/01-面试准备/Java技术/ | 职业生涯 / 面试 / 面试题库 / Java |
| 03-面试/01-面试准备/Go技术/ | 职业生涯 / 面试 / 面试题库 / Go |
| 03-面试/01-面试准备/AI与大模型/ | 职业生涯 / 面试 / 面试题库 / AI |
| 03-面试/02-公司准备/ | 职业生涯 / 面试 / 面试准备 / 公司定制 |
| 03-面试/03-面试记录/ | 职业生涯 / 面试 / 面试复盘 |
| 04-作品集/personal-website/ | 职业生涯 / 资产 / 项目展示 |

---

## 3. 技术栈文档

### 3.1 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.0 | 前端框架 |
| Vite | 6.4.2 | 构建工具 |
| React Router | 7.9.4 | 路由管理 |
| Motion | 12.23.24 | 动画库 |
| Recharts | 2.15.4 | 图表库 |
| D3-Force | 3.0.0 | 力导向图 |
| GSAP | 3.15.0 | 动画库 |

### 3.2 数据处理技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Gray-Matter | 4.0.3 | Markdown frontmatter 解析 |
| Unified | 11.0.5 | Markdown 处理管道 |
| Remark-Parse | 11.0.0 | Markdown 解析 |
| Remark-GFM | 4.0.1 | GitHub Flavored Markdown |
| Rehype-Raw | 7.0.0 | HTML 处理 |
| Rehype-Sanitize | 6.0.0 | HTML 清理 |
| React-Markdown | 10.1.0 | Markdown 渲染 |

### 3.3 搜索和索引

| 技术 | 版本 | 用途 |
|------|------|------|
| MiniSearch | 7.2.0 | 全文搜索 |
| Fast-Glob | 3.3.3 | 文件匹配 |

### 3.4 工具库

| 技术 | 版本 | 用途 |
|------|------|------|
| Zod | 3.25.76 | 数据验证 |
| XLSX | 0.18.5 | Excel 处理 |

### 3.5 字体

| 技术 | 版本 | 用途 |
|------|------|------|
| @fontsource/jetbrains-mono | 5.3.0 | 等宽字体 |
| @fontsource/noto-sans-sc | 5.2.8 | 中文无衬线字体 |
| @fontsource/noto-serif-sc | 5.2.8 | 中文衬线字体 |
| @fontsource/space-grotesk | 5.3.0 | 英文无衬线字体 |

### 3.6 图标

| 技术 | 版本 | 用途 |
|------|------|------|
| @tabler/icons-react | 3.34.1 | 图标库 |

---

## 4. 架构设计

### 4.1 前端架构

- 基于 React 19 和 Vite 6
- 使用 React Router 进行路由管理
- 组件采用函数式组件和 Hooks
- 使用 Motion 和 GSAP 进行动画处理
- 使用 Recharts 进行数据可视化

### 4.2 数据架构

**核心存储**: Markdown + YAML frontmatter  
**知识库结构**: 分层目录结构 (10_raw, 30_self_media, 40_topics, 50_scripts, wiki)  
**数据索引**: 使用 fast-glob 进行文件扫描  
**搜索**: 使用 MiniSearch 进行全文搜索  
**验证**: 使用 Zod 进行数据验证

### 4.3 服务端架构

- 基于 Vite 插件提供 API
- 自定义 Vite 插件: `workbenchApiPlugin`
- 支持本地 Vault 读取
- 提供数据索引和搜索 API
- 支持隐私保护的数据访问控制

### 4.4 测试架构

- 使用 Node.js 原生测试框架 (`node --test`)
- 测试覆盖率包括：数据真实性验证、UI 信息门控、每日热点、社媒洞察、素材管理、书籍阅读、Vault 同步、图表

### 4.5 隐私保护机制

- 本地优先的数据存储
- 隐私扫描脚本
- 数据真实性验证
- 访问控制机制

---

## 5. 职业生涯模块详细设计

### 5.1 数据模型

#### 岗位模型
```typescript
interface Job {
  id: string;
  company: string;
  title: string;
  description: string;
  source: string;
  location: string;
  salary?: string;
  status: JobStatus;
  matchScore?: number;
  createdAt: Date;
  analysis?: JobAnalysis;
}
```

#### 岗位分析
```typescript
interface JobAnalysis {
  summary: string;
  coreResponsibilities: string[];
  coreTechnologies: string[];
  requirements: string[];
  bonuses: string[];
  level: string;
  myMatchScore: number;
  advantages: string[];
  gaps: string[];
  risks: string[];
  suggestions: string[];
  relatedProjects: string[];
  relatedKnowledge: string[];
  interviewFocus: string[];
}
```

#### 求职进度
```typescript
interface Application {
  id: string;
  jobId: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  interviewRound?: number;
  currentStage: string;
  timeline: TimelineEvent[];
  result?: string;
}
```

#### 面试准备
```typescript
interface InterviewPrep {
  jobId: string;
  jobFocus: string[];
  techFocus: string[];
  projectFocus: string[];
  highFrequencyQuestions: Question[];
  possibleFollowups: string[];
  knowledgeGaps: string[];
  projectAnswers: ProjectAnswer[];
  selfIntroduction: string;
  questionsForInterviewer: string[];
}
```

#### 面试题
```typescript
interface Question {
  id: string;
  question: string;
  myAnswer: string;
  source: string;
  relatedProjects: string[];
  relatedSkills: string[];
  followups: string[];
  quality: number;
  category: QuestionCategory;
}
```

#### 项目面试
```typescript
interface ProjectInterview {
  projectId: string;
  introduction: string;
  architecture: string;
  responsibilities: string[];
  techStack: string[];
  challenges: string[];
  solutions: string[];
  techDecisions: string[];
  outcomes: string[];
  possibleQuestions: ProjectQuestion[];
}
```

#### 面试故事
```typescript
interface InterviewStory {
  id: string;
  title: string;
  category: StoryCategory;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection: string;
  relatedProjects: string[];
  relatedSkills: string[];
  usageCount: number;
}
```

#### 模拟面试
```typescript
interface MockInterview {
  id: string;
  jobId: string;
  direction: string;
  questions: MockQuestion[];
  evaluation: InterviewEvaluation;
  summary: string;
}
```

#### 状态枚举
```typescript
enum JobStatus {
  PENDING_EVALUATION = 'pending_evaluation',
  READY_TO_APPLY = 'ready_to_apply',
  APPLIED = 'applied',
  INTERVIEWING = 'interviewing',
  OFFER = 'offer',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

enum ApplicationStatus {
  PENDING_EVALUATION = 'pending_evaluation',
  READY_TO_APPLY = 'ready_to_apply',
  APPLIED = 'applied',
  FIRST_ROUND = 'first_round',
  SECOND_ROUND = 'second_round',
  THIRD_ROUND = 'third_round',
  OFFER = 'offer',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

enum QuestionCategory {
  JAVA = 'java',
  GO = 'go',
  MYSQL = 'mysql',
  REDIS = 'redis',
  JVM = 'jvm',
  MQ = 'mq',
  SPRING = 'spring',
  MICROSERVICES = 'microservices',
  SYSTEM_DESIGN = 'system_design',
  AI = 'ai',
  RAG = 'rag',
  AGENT = 'agent',
  PROJECT = 'project'
}

enum StoryCategory {
  PROJECT_SUCCESS = 'project_success',
  TECHNICAL_CHALLENGE = 'technical_challenge',
  INCIDENT_HANDLING = 'incident_handling',
  PERFORMANCE_OPTIMIZATION = 'performance_optimization',
  ARCHITECTURE_DECISION = 'architecture_decision',
  TEAM_COLLABORATION = 'team_collaboration',
  CONFLICT_HANDLING = 'conflict_handling',
  PROJECT_DELIVERY = 'project_delivery',
  FAILURE_REVIEW = 'failure_review'
}
```

### 5.2 AI 工作流

#### 岗位分析工作流
- 输入：JD 文本或 URL
- 处理：提取岗位关键信息、岗位类型检测
- 输出：岗位分析报告

#### 岗位匹配工作流
- 输入：岗位分析 + 用户职业资料（来自 career）
- 处理：匹配度计算、优势差距分析
- 输出：匹配度报告

#### 面试准备工作流
- 输入：岗位 JD + 用户职业资料
- 处理：生成面试准备清单、高频问题预测
- 输出：面试准备方案

#### 项目深挖工作流
- 输入：项目信息
- 处理：提取技术难点、架构决策、面试问答
- 输出：项目面试资料

#### 模拟面试工作流
- 输入：岗位 + 面试方向
- 处理：AI 提问、回答评价、追问生成
- 输出：面试对话 + 评价

#### 面试故事生成工作流
- 输入：项目经历 + 故事类型
- 处理：STAR 模板生成
- 输出：面试故事

### 5.3 开发实施计划

#### 第一阶段：基础架构（1-2周）
1. 创建职业生涯模块目录结构
2. 设置路由和导航
3. 创建基础数据模型和 API
4. 实现总览页面框架
5. 集成 career 内容读取

#### 第二阶段：求职模块（2-3周）
1. 实现岗位列表页面
2. 实现岗位详情页面
3. 实现岗位分析 UI
4. 实现求职进度页面
5. 实现 Timeline 组件
6. 集成岗位分析 AI 工作流

#### 第三阶段：面试模块（3-4周）
1. 实现当前面试页面
2. 实现面试准备页面
3. 实现面试题库页面
4. 实现项目面试页面
5. 实现模拟面试页面
6. 集成面试准备 AI 工作流
7. 集成模拟面试 AI 工作流

#### 第四阶段：资产模块（1-2周）
1. 实现面试故事库页面
2. 实现简历页面
3. 实现项目资产页面
4. 实现技能页面
5. 集成故事生成 AI 工作流

#### 第五阶段：优化和测试（1-2周）
1. UI/UX 优化（遵循 studio-quiet-luxury）
2. 性能优化
3. 数据导入导出
4. 用户测试
5. Bug 修复

**总计：8-13周**

---

## 6. UI/UX 设计指南

### 6.1 Design System

基于 finesse-ui 技能自带示例 `studio-quiet-luxury.html` 的设计语言：

#### 6.1.1 Typography
- 标题：Space Grotesk
- 正文：Noto Sans SC
- 代码：JetBrains Mono
- 强调：Noto Serif SC

#### 6.1.2 Spacing
- 基础间距：8px
- 组件间距：16px, 24px, 32px
- 页面边距：48px

#### 6.1.3 Color Palette
- 主色：深灰 #1a1a1a
- 辅助色：中灰 #4a4a4a
- 强调色：金色 #c9a227
- 背景色：浅灰 #f5f5f5
- 边框色：#e0e0e0

#### 6.1.4 Layout
- 响应式栅格系统
- 最大宽度：1200px
- 移动端适配：断点 768px

### 6.2 组件规范

#### 6.2.1 核心组件
- JobCard - 岗位卡片组件
- JobAnalysisPanel - 岗位分析面板
- MatchScore - 匹配度评分组件
- ApplicationTimeline - 求职进度时间线
- InterviewProgress - 面试准备进度
- QuestionCard - 面试题卡片
- ProjectInterviewCard - 项目面试卡片
- StoryCard - 面试故事卡片
- MockInterviewChat - 模拟面试对话组件
- NextActionCard - 下一步行动提示组件
- SkillTag - 技能标签组件
- CompanyResearchPanel - 公司调研面板
- PreparationChecklist - 准备清单组件
- STARStoryEditor - STAR 故事编辑器

#### 6.2.2 交互模式
- 微交互：按钮悬停、卡片阴影
- 页面转场：淡入淡出
- 加载状态：骨架屏
- 错误处理：友好提示

### 6.3 响应式设计
- 移动端优先
- 平板适配
- 桌面端优化

---

## 7. 开发规范

### 7.1 代码规范

#### 7.1.1 命名规范
- 组件：PascalCase (e.g., JobCard)
- 函数：camelCase (e.g., fetchJobs)
- 常量：UPPER_SNAKE_CASE (e.g., API_BASE_URL)
- 文件：kebab-case (e.g., job-card.tsx)

#### 7.1.2 组件规范
- 函数式组件优先
- 使用 TypeScript
- 单一职责原则
- Props 接口定义
- 组件文档注释

#### 7.1.3 状态管理
- 本地状态：useState
- 全局状态：context API
- 复杂状态：考虑状态管理库

### 7.2 测试规范

#### 7.2.1 测试类型
- 单元测试：组件函数测试
- 集成测试：模块间交互测试
- E2E 测试：关键流程测试

#### 7.2.2 测试框架
- 使用 Node.js 原生测试框架 (`node --test`)
- 测试文件命名：*.test.mjs
- 测试覆盖率：核心模块 > 80%

### 7.3 文档规范

#### 7.3.1 代码注释
- 复杂逻辑必须注释
- 接口定义必须注释
- 公共 API 必须注释

#### 7.3.2 项目文档
- README.md：项目概述
- docs/：详细文档
- 组件文档：Storybook 或 inline

### 7.4 Git 工作流

#### 7.4.1 分支策略
- main：生产环境
- develop：开发环境
- feature/*：功能分支
- hotfix/*：紧急修复

#### 7.4.2 提交规范
- feat：新功能
- fix：修复
- docs：文档
- style：格式
- refactor：重构
- test：测试
- chore：构建

#### 7.4.3 代码审查
- Pull Request 必须审查
- 至少一人批准
- CI 通过才能合并

---

## 8. 技术债务和扩展点

### 8.1 当前技术债务

#### 8.1.1 性能优化
- 大文件加载优化
- 搜索性能优化
- 图谱渲染优化

#### 8.1.2 代码质量
- 类型定义完善
- 错误处理统一
- 日志系统规范

#### 8.1.3 测试覆盖
- 组件测试覆盖
- 集成测试完善
- E2E 测试建立

### 8.2 未来扩展方向

#### 8.2.1 功能扩展
- 技能市场
- 工作流可视化编辑器
- 插件生态系统
- 云端同步

#### 8.2.2 技术升级
- 向量数据库集成
- 知识图谱可视化
- 实时协作
- 移动端应用

### 8.3 性能优化计划

#### 8.3.1 前端优化
- 代码分割
- 懒加载
- 缓存策略
- 图片优化

#### 8.3.2 后端优化
- API 优化
- 数据库索引
- 缓存层
- CDN 部署

---

## 9. 参考资源

### 9.1 外部参考
- [career-ops](https://github.com/santifer/career-ops) - 业务流程参考
- [career](https://gitee.com/eason_misu/career.git) - 职业内容参考
- [person_dashboard](https://github.com/oyorf/person_dashboard) - 工作台布局参考
- `studio-quiet-luxury.html`（finesse-ui 技能示例，本地技能目录内，不随仓库分发）- UI/UX 参考

### 9.2 内部文档
- [product-architecture.md](./product-architecture.md) - 产品架构
- [architecture-analysis.md](../architecture/architecture-analysis.md) - 架构分析
- [data-architecture.md](../architecture/data-architecture.md) - 数据架构
- [ui-architecture.md](../architecture/ui-architecture.md) - UI 架构
- [ai-integration-analysis.md](../ai/ai-integration-analysis.md) - AI 集成分析

---

## 10. 变更日志

### 1.0.0 (2026-08-21)
- 初始版本
- 整合现有架构文档
- 添加职业生涯模块详细设计
- 完善技术栈文档
- 添加开发规范和指南

---

## 附录

### A. 术语表

| 术语 | 定义 |
|------|------|
| BeU Workbench | 个人能力操作系统 |
| Skill | 可执行、可交易的能力单元 |
| Workflow | 可视化工作流 |
| Agent | AI 智能代理 |
| Vault | 本地知识库 |
| career-ops | 开源求职系统参考 |
| career | 个人职业知识库 |

### B. 相关链接

- GitHub: https://github.com/your-org/beu-workbench
- 文档: https://docs.beu-workbench.com
- 社区: https://community.beu-workbench.com

---

**文档结束**