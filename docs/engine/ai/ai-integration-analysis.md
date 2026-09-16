# BeU Workbench AI 集成分析

## 一、当前架构

### 1.1 项目目录结构

```
beu-workbench/
├── workbench/                    # 前端主目录
│   ├── src/
│   │   ├── components/           # React 组件
│   │   │   ├── daily-hot/       # 抖音热榜组件
│   │   │   ├── douyin/          # 抖音分析组件
│   │   │   ├── materials/       # 素材管理组件
│   │   │   ├── reader/          # 文档阅读器
│   │   │   ├── social-insights/ # 社媒洞察组件
│   │   │   ├── AppShell.jsx     # 应用外壳
│   │   │   ├── DocumentDrawer.jsx
│   │   │   ├── SearchPalette.jsx
│   │   │   ├── KnowledgeGraph.jsx
│   │   │   └── ...
│   │   ├── pages/               # 页面组件
│   │   │   ├── OverviewPage.jsx
│   │   │   ├── GraphPage.jsx
│   │   │   ├── CollectionPage.jsx
│   │   │   ├── MaterialsPage.jsx
│   │   │   ├── BooksPage.jsx
│   │   │   ├── DailyHotPage.jsx
│   │   │   ├── SocialInsightsPage.jsx
│   │   │   ├── TopicsPage.jsx
│   │   │   ├── DouyinPage.jsx
│   │   │   └── SystemPage.jsx
│   │   ├── lib/                 # 工具库
│   │   │   ├── api.js           # API 客户端
│   │   │   ├── graph.js         # 图谱工具
│   │   │   ├── format.js        # 格式化工具
│   │   │   ├── obsidian-markdown.js
│   │   │   ├── reader-*.js      # 阅读器相关
│   │   │   └── ...
│   │   ├── hooks/               # React Hooks
│   │   │   ├── useVaultSync.js
│   │   │   └── useKnowledgeGraphEngine.js
│   │   ├── graph/               # 知识图谱引擎
│   │   │   ├── graph-engine.js
│   │   │   ├── graph-layout.js
│   │   │   ├── graph-motion.js
│   │   │   ├── graph-renderer.js
│   │   │   └── ...
│   │   ├── data/                # 数据
│   │   │   └── fallback.js      # 回退数据
│   │   ├── App.jsx              # 应用入口
│   │   └── main.jsx
│   ├── server/                  # 后端服务（Vite 插件）
│   │   ├── vault-index.mjs       # Vault 索引
│   │   ├── vite-plugin-workbench.mjs
│   │   ├── codex-runner.mjs     # Codex 运行器
│   │   ├── materials.mjs
│   │   ├── books.mjs
│   │   ├── social-insights.mjs
│   │   ├── reader-*.mjs
│   │   └── ...
│   ├── shared/                  # 共享代码
│   │   ├── ai-hot.mjs
│   │   └── reader-text-contract.mjs
│   ├── public/                  # 静态资源
│   ├── config/                  # 配置
│   ├── templates/               # 模板
│   ├── tests/                   # 测试
│   └── worker/                  # Worker
├── kb/                   # 示例 Vault
├── docs/                        # 文档
├── package.json
├── README.md
└── AGENTS.md
```

### 1.2 前端技术栈

- **框架**: React 19.2.0
- **构建工具**: Vite 6.4.2
- **路由**: React Router 7.9.4
- **动画**: Motion 12.23.24, GSAP 3.15.0
- **图表**: Recharts 2.15.4
- **图形**: D3.js (d3-force 3.0.0)
- **Markdown**: react-markdown 10.1.0, unified 11.0.5, remark-gfm 4.0.1
- **搜索**: minisearch 7.2.0（前端全文搜索）
- **数据处理**: gray-matter 4.0.3
- **图标**: @tabler/icons-react 3.34.1
- **字体**: @fontsource (Noto Sans SC, Noto Serif SC, Space Grotesk, JetBrains Mono)
- **验证**: zod 3.25.76

### 1.3 后端技术栈

- **运行时**: Node.js 20+
- **集成方式**: Vite 插件（开发模式下提供 HTTP API）
- **文件系统**: Node.js fs/promises
- **进程管理**: child_process.spawn（用于 Codex CLI）
- **数据处理**: XLSX（用于抖音数据）

### 1.4 数据存储

- **主要格式**: Markdown + YAML/JSON
- **版本控制**: Git
- **本地路径**: `PERSONAL_DASHBOARD_VAULT_ROOT` 环境变量配置
- **默认路径**: `../kb`（相对于 workbench 目录）
- **索引方式**: 内存索引（通过 server/vault-index.mjs）
- **搜索方式**: minisearch（前端）+ 文件系统遍历（后端）

### 1.5 当前页面与路由

```javascript
/              → OverviewPage（总览）
/graph         → GraphPage（知识星图）
/wiki          → CollectionPage（Wiki 层）
/materials     → MaterialsPage（素材层）
/books         → BooksPage（书架）
/daily-hot     → DailyHotPage（AI 热榜）
/social-insights → SocialInsightsPage（社媒洞察，仅本地）
/topics        → TopicsPage（灵感库）
/content       → CollectionPage（内容中心）
/douyin        → DouyinPage（抖音数据）
/system        → SystemPage（系统）
```

### 1.6 当前 UI 组件

**核心组件：**
- `AppShell` - 应用外壳（侧边栏、头部）
- `DocumentDrawer` - 文档抽屉阅读器
- `SearchPalette` - 搜索面板
- `KnowledgeGraph` - 知识图谱可视化
- `MetricStat` - 指标统计卡片

**领域组件：**
- `DailyHotPage` + 相关组件 - 抖音热榜
- `DouyinPage` + 相关组件 - 抖音数据分析
- `SocialInsightsPage` + 相关组件 - 社媒洞察
- `MaterialsPage` + 相关组件 - 素材管理
- `BooksPage` + 相关组件 - 书籍阅读

**通用组件：**
- `PageHeader` - 页面头部
- `DecryptedText` - 解密文本动画
- `DotEyes` - 动态眼睛效果

### 1.7 当前 API 接口

```javascript
GET  /api/overview              # 总览数据
GET  /api/graph                # 知识图谱数据
GET  /api/collections/:kind     # 集合数据（wiki/materials/content）
GET  /api/materials            # 素材首页
GET  /api/materials/folder     # 素材文件夹
GET  /api/material-reading-queue  # 素材阅读队列
POST /api/material-reading-queue  # 添加到阅读队列
DELETE /api/material-reading-queue/:id  # 从阅读队列移除
GET  /api/books                # 书籍列表
GET  /api/search               # 搜索
GET  /api/document/:id          # 文档详情
GET  /api/document/:id/content  # 文档内容
POST /api/document/:id/notes   # 文档笔记
POST /api/document/:id/explanations  # 文档解释
GET  /api/reader/:id/image      # 文档图片
GET  /api/vault/events         # Vault 事件流（SSE）
POST /api/codex/jobs           # 创建 Codex 任务
GET  /api/codex/jobs/:id       # 获取 Codex 任务
DELETE /api/codex/jobs/:id     # 取消 Codex 任务
GET  /api/codex/jobs/:id/events  # Codex 任务事件流（SSE）
POST /api/codex/jobs/:id/confirm  # 确认 Codex 任务结果
GET  /api/social-insights      # 社媒洞察
GET  /api/social-trends        # 社媒趋势
GET  /api/daily-hot            # AI 热榜
GET  /api/config/attention     # 注意力策略配置
```

### 1.8 当前数据模型

**Document（文档）：**
```javascript
{
  id: string,              // 唯一标识
  path: string,            // Vault 相对路径
  title: string,           // 标题
  section: string,         // 所属分类
  kind: string,            // 类型（wiki/material/book等）
  layer: string,           // 层级（raw/wiki/run）
  status: string,          // 状态
  previewKind: string,     // 预览类型（markdown/image）
  extension: string,       // 文件扩展名
  createdAt: string,       // 创建时间
  modifiedAt: string,      // 修改时间
  tags: string[],          // 标签
  degree: number,          // 节点度数（图谱）
  metadata: object        // 元数据
}
```

**Graph（知识图谱）：**
```javascript
{
  nodes: [{
    id: string,
    title: string,
    type: string,          // concept/framework/diagnosis/analysis等
    section: string,
    status: string,
    degree: number,
    tags: string[]
  }],
  edges: [{
    source: string,
    target: string,
    weight: number
  }],
  typeCounts: object,
  stats: {
    nodeCount: number,
    edgeCount: number
  }
}
```

**Overview（总览）：**
```javascript
{
  metrics: {
    raw: number,           // RAW 素材数
    wiki: number,          // Wiki 页面数
    topics: number,        // 选题数
    candidates: number,    // 候选题数
    publishedWorks: number, // 已发布作品数
    totalPlays: number,    // 总播放量
    // ...
  },
  recent: Document[],      // 最近文档
  activity: object[],     // 活动记录
  wikiStatus: object,     // Wiki 状态
  douyinAvailable: boolean,
  douyinTrend: object[],
  // ...
}
```

## 二、当前能力

### 2.1 Knowledge 能力

**已实现：**
- ✅ Markdown 文档索引和检索
- ✅ Obsidian Vault 同步
- ✅ 文档分类（Wiki 层、素材层、内容层等）
- ✅ 文档阅读器（支持 Markdown 渲染）
- ✅ 双向链接（Obsidian wikilinks）
- ✅ 知识图谱可视化（D3.js 力导向图）
- ✅ 全文搜索（minisearch）
- ✅ 文档笔记和解释
- ✅ 书籍阅读进度跟踪
- ✅ 素材阅读队列

**未实现：**
- ❌ PDF/TXT/DOCX 等其他格式支持
- ❌ 文档分块（Chunking）
- ❌ 向量化（Embedding）
- ❌ 语义搜索
- ❌ 知识库管理（多知识库支持）

### 2.2 Search 能力

**已实现：**
- ✅ 前端全文搜索（minisearch）
- ✅ 搜索面板（SearchPalette）
- ✅ 快捷键支持（Cmd/Ctrl + K）
- ✅ 搜索结果分类
- ✅ 搜索历史

**未实现：**
- ❌ 向量搜索
- ❌ 混合搜索（关键词 + 向量）
- ❌ 搜索结果重排序（Rerank）
- ❌ 搜索结果解释（为什么匹配）

### 2.3 Dashboard 能力

**已实现：**
- ✅ 总览页面（OverviewPage）
- ✅ 指标统计卡片
- ✅ 最近活动时间线
- ✅ 知识图谱预览
- ✅ 最近文档列表
- ✅ Vault 同步状态

**未实现：**
- ❌ AI 能力指标
- ❌ Skill 使用统计
- ❌ Agent 执行历史
- ❌ RAG 检索统计

### 2.4 当前 AI 能力

**已实现：**
- ✅ Codex CLI 集成（用于小红书图文草稿生成）
- ✅ Codex 任务管理（创建、执行、取消、确认）
- ✅ Codex 任务事件流（SSE）
- ✅ AI 热榜数据（外部 API）

**未实现：**
- ❌ RAG 系统
- ❌ LLM 对话
- ❌ Agent 系统
- ❌ Skill 系统
- ❌ Tool 系统
- ❌ 向量数据库
- ❌ Embedding 服务
- ❌ 通用 LLM Provider

## 三、当前问题

### 3.1 架构问题

1. **AI 能力缺失**
   - 当前只有 Codex CLI 的简单集成，缺乏通用 AI 能力
   - 没有 RAG、Agent、Skill 等核心 AI 模块
   - 无法满足面试演示需求

2. **数据模型限制**
   - Document 模型仅针对 Markdown 文档
   - 缺乏 KnowledgeBase、Skill、Agent、Workflow 等核心实体
   - 没有考虑多用户、多工作空间的扩展性

3. **搜索能力局限**
   - 只有关键词搜索，没有语义搜索
   - 无法进行 RAG 检索
   - 搜索结果缺乏相关性排序

4. **后端架构简单**
   - 当前后端只是 Vite 插件，缺乏独立服务
   - 没有数据库（只有文件系统）
   - 没有异步任务队列（除了 Codex）

### 3.2 功能问题

1. **知识管理**
   - 不支持文档分块
   - 不支持向量化
   - 不支持知识库管理

2. **AI 功能**
   - 没有 RAG 系统
   - 没有 Agent 系统
   - 没有 Skill 系统
   - 没有 Tool 系统

3. **演示能力**
   - 无法演示 RAG
   - 无法演示 Agent
   - 无法演示 Skill
   - 无法满足面试需求

### 3.3 技术问题

1. **向量数据库**
   - 没有向量数据库支持
   - 需要选择和集成（pgvector/Qdrant/Chroma）

2. **LLM 集成**
   - 没有通用 LLM Provider
   - 需要支持 OpenAI Compatible API
   - API Key 管理需要设计

3. **Embedding**
   - 没有 Embedding 服务
   - 需要集成 Embedding Provider

4. **Agent 执行**
   - 没有 Agent 运行时
   - 需要设计 Agent 框架

## 四、可复用模块

### 4.1 前端可复用模块

**UI 组件：**
- `AppShell` - 可复用于 AI 页面布局
- `DocumentDrawer` - 可复用于 AI 结果展示
- `SearchPalette` - 可复用于 AI 对话界面
- `KnowledgeGraph` - 可复用于知识图谱展示
- `MetricStat` - 可复用于 AI 指标展示
- `PageHeader` - 可复用于页面头部

**工具库：**
- `lib/api.js` - API 客户端模式可复用
- `lib/format.js` - 格式化工具可复用
- `lib/graph.js` - 图谱工具可复用
- `hooks/useVaultSync.js` - 数据同步模式可复用

**设计系统：**
- 现有的 CSS 变量和设计 token
- 紫色主题可延续
- 动画效果（GSAP、Motion）可复用

### 4.2 后端可复用模块

**索引系统：**
- `server/vault-index.mjs` - Vault 索引逻辑可复用
- 文件系统遍历和过滤逻辑可复用
- Markdown 解析和元数据提取可复用

**API 模式：**
- Vite 插件模式可复用
- SSE 事件流模式可复用（用于 Agent 执行过程）
- 错误处理模式可复用

**任务管理：**
- `server/codex-runner.mjs` - 任务管理逻辑可复用
- Job 状态管理可复用
- 任务事件流可复用

### 4.3 数据可复用

**示例 Vault：**
- `kb/` 中的示例数据可作为 RAG 测试数据
- Wiki 层的结构化知识可复用
- 项目文档可复用

## 五、RAG 架构方案

### 5.1 技术选型

**向量数据库：pgvector**
- 理由：基于 PostgreSQL，稳定性高，生态成熟
- 部署：可通过 Docker 部署，也可使用云服务（Supabase、Neon）
- 集成：Node.js pg 库 + pgvector 扩展

**Embedding Provider：OpenAI Compatible API**
- 理由：通用性强，支持多种模型
- 配置：环境变量 `EMBEDDING_BASE_URL`、`EMBEDDING_API_KEY`、`EMBEDDING_MODEL`

**LLM Provider：OpenAI Compatible API**
- 理由：通用性强，支持多种模型
- 配置：环境变量 `LLM_BASE_URL`、`LLM_API_KEY`、`LLM_MODEL`

### 5.2 架构设计

```
用户问题
    ↓
Query Processing
    ↓
Embedding API
    ↓
pgvector (相似度搜索)
    ↓
Top K Chunks
    ↓
Context Building
    ↓
LLM API
    ↓
Answer + Citations
    ↓
Response
```

### 5.3 数据模型

**KnowledgeBase（知识库）：**
```javascript
{
  id: string,
  name: string,
  description: string,
  vaultPath: string,        // Vault 路径
  createdAt: string,
  updatedAt: string
}
```

**DocumentChunk（文档分块）：**
```javascript
{
  id: string,
  documentId: string,      // 关联文档
  knowledgeBaseId: string, // 关联知识库
  content: string,         // 分块内容
  metadata: {
    title: string,
    path: string,
    section: string,
    chunkIndex: number,
    // ...
  },
  embedding: number[],      // 向量（存储在 pgvector）
  createdAt: string
}
```

**Conversation（对话）：**
```javascript
{
  id: string,
  knowledgeBaseId: string,
  title: string,
  createdAt: string,
  updatedAt: string
}
```

**Message（消息）：**
```javascript
{
  id: string,
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  citations: [{
    chunkId: string,
    documentId: string,
    relevance: number
  }],
  metadata: {
    query: string,
    retrievedChunks: number,
    model: string
  },
  createdAt: string
}
```

**RetrievalRecord（检索记录）：**
```javascript
{
  id: string,
  messageId: string,
  query: string,
  embedding: number[],
  topK: DocumentChunk[],
  retrievalTime: number,
  createdAt: string
}
```

### 5.4 API 设计

```javascript
// 知识库管理
GET    /api/ai/knowledge-bases              # 列出知识库
POST   /api/ai/knowledge-bases              # 创建知识库
GET    /api/ai/knowledge-bases/:id           # 获取知识库详情
DELETE /api/ai/knowledge-bases/:id           # 删除知识库
POST   /api/ai/knowledge-bases/:id/index     # 索引知识库

// RAG 对话
POST   /api/ai/conversations                # 创建对话
GET    /api/ai/conversations/:id             # 获取对话详情
GET    /api/ai/conversations/:id/messages   # 获取对话消息
POST   /api/ai/conversations/:id/messages   # 发送消息（RAG）

// 检索
POST   /api/ai/retrieve                     # 检索相关文档
GET    /api/ai/retrieve/:id                  # 获取检索详情
```

### 5.5 文件结构

```
workbench/
├── src/
│   ├── ai/
│   │   ├── rag/
│   │   │   ├── RAGPage.jsx           # RAG 对话页面
│   │   │   ├── ConversationPanel.jsx  # 对话面板
│   │   │   ├── MessageList.jsx        # 消息列表
│   │   │   ├── CitationPanel.jsx      # 引用面板
│   │   │   └── RetrievalDebug.jsx     # 检索调试
│   │   ├── lib/
│   │   │   ├── llm-provider.js       # LLM Provider
│   │   │   ├── embedding-provider.js # Embedding Provider
│   │   │   ├── vector-store.js       # Vector Store
│   │   │   └── rag-service.js        # RAG 服务
│   │   └── hooks/
│   │       ├── useRAGConversation.js
│   │       └── useRAGRetrieval.js
│   └── ...
├── server/
│   ├── ai/
│   │   ├── rag/
│   │   │   ├── rag-api.mjs           # RAG API
│   │   │   ├── chunking.mjs          # 文档分块
│   │   │   └── retrieval.mjs         # 检索逻辑
│   │   ├── llm/
│   │   │   ├── llm-provider.mjs      # LLM Provider
│   │   │   └── openai-client.mjs     # OpenAI 客户端
│   │   ├── embedding/
│   │   │   ├── embedding-provider.mjs
│   │   │   └── openai-embedding.mjs
│   │   └── vector/
│   │       ├── vector-store.mjs
│   │       └── pgvector-store.mjs    # pgvector 实现
│   └── ...
└── ...
```

## 六、Agent 架构方案

### 6.1 核心概念

Agent = Task Planner + Tool Executor + Skill Caller

**执行流程：**
```
Task
  ↓
Plan Generation（LLM）
  ↓
Tool Execution（循环）
  ↓
Observation
  ↓
Next Action Decision（LLM）
  ↓
Final Answer
```

### 6.2 架构设计

```
Agent
  ├─ Planner（计划生成器）
  ├─ Executor（执行器）
  ├─ ToolRegistry（工具注册表）
  └─ Memory（记忆）
```

### 6.3 数据模型

**Agent（智能体）：**
```javascript
{
  id: string,
  name: string,
  description: string,
  type: 'interview' | 'coding' | 'research' | 'creator',
  tools: string[],         // 可用工具列表
  skills: string[],        // 可用技能列表
  systemPrompt: string,    // 系统提示词
  config: {
    maxIterations: number,
    temperature: number
  },
  createdAt: string
}
```

**AgentExecution（执行记录）：**
```javascript
{
  id: string,
  agentId: string,
  task: string,
  status: 'pending' | 'running' | 'completed' | 'failed',
  plan: string[],
  steps: AgentStep[],
  result: string,
  metadata: object,
  createdAt: string,
  completedAt: string
}
```

**AgentStep（执行步骤）：**
```javascript
{
  id: string,
  executionId: string,
  stepNumber: number,
  type: 'tool_call' | 'skill_call' | 'thought',
  content: string,
  toolCall?: {
    toolName: string,
    input: object,
    output: object,
    error?: string
  },
  skillCall?: {
    skillName: string,
    input: object,
    output: object,
    error?: string
  },
  thought?: string,
  createdAt: string
}
```

### 6.4 API 设计

```javascript
// Agent 管理
GET    /api/ai/agents                       # 列出 Agent
POST   /api/ai/agents                       # 创建 Agent
GET    /api/ai/agents/:id                    # 获取 Agent 详情
DELETE /api/ai/agents/:id                    # 删除 Agent

// Agent 执行
POST   /api/ai/agents/:id/execute           # 执行 Agent
GET    /api/ai/agents/:id/executions        # 获取执行历史
GET    /api/ai/executions/:id               # 获取执行详情
GET    /api/ai/executions/:id/steps         # 获取执行步骤
GET    /api/ai/executions/:id/events        # 执行事件流（SSE）
DELETE /api/ai/executions/:id               # 取消执行
```

### 6.5 文件结构

```
workbench/
├── src/
│   ├── ai/
│   │   ├── agent/
│   │   │   ├── AgentPage.jsx          # Agent 页面
│   │   │   ├── AgentExecutor.jsx      # Agent 执行器
│   │   │   ├── ExecutionTimeline.jsx  # 执行时间线
│   │   │   ├── StepCard.jsx           # 步骤卡片
│   │   │   └── ResultPanel.jsx        # 结果面板
│   │   ├── lib/
│   │   │   ├── agent-core.js          # Agent 核心
│   │   │   ├── planner.js             # 计划生成器
│   │   │   ├── executor.js            # 执行器
│   │   │   └── memory.js              # 记忆
│   │   └── hooks/
│   │       └── useAgentExecution.js
│   └── ...
├── server/
│   ├── ai/
│   │   ├── agent/
│   │   │   ├── agent-api.mjs          # Agent API
│   │   │   ├── agent-core.mjs         # Agent 核心
│   │   │   ├── planner.mjs            # 计划生成器
│   │   │   └── executor.mjs           # 执行器
│   │   └── ...
│   └── ...
└── ...
```

## 七、Skill 架构方案

### 7.1 核心概念

Skill = 可复用的能力单元

**设计原则：**
- Skill 独立于 Agent
- Skill 可被多个 Agent 调用
- Skill 有明确的输入输出
- Skill 可测试

### 7.2 架构设计

```
Skill
  ├─ Definition（定义）
  ├─ Instructions（指令）
  ├─ Input Schema（输入模式）
  ├─ Output Schema（输出模式）
  ├─ Tools（依赖工具）
  └─ Examples（示例）
```

### 7.3 数据模型

**Skill（技能）：**
```javascript
{
  id: string,
  name: string,
  description: string,
  category: 'analysis' | 'generation' | 'extraction',
  instructions: string,      // 执行指令
  inputSchema: object,       // Zod schema
  outputSchema: object,      // Zod schema
  tools: string[],          // 依赖的工具
  examples: [{
    input: object,
    output: object
  }],
  metadata: {
    author: string,
    version: string,
    tags: string[]
  },
  createdAt: string
}
```

**SkillExecution（执行记录）：**
```javascript
{
  id: string,
  skillId: string,
  agentExecutionId?: string, // 关联的 Agent 执行
  input: object,
  output: object,
  status: 'pending' | 'running' | 'completed' | 'failed',
  error?: string,
  toolCalls: ToolCall[],
  executionTime: number,
  createdAt: string
}
```

### 7.4 第一阶段 Skill

**JD Analysis Skill：**
- 输入：JD 文本
- 输出：岗位职责、技术栈、关键词、核心要求、优先级、面试重点

**Project Match Skill：**
- 输入：JD
- 查询：Knowledge、Projects
- 输出：最匹配项目、匹配原因、推荐项目、对应技术经验

**Interview Preparation Skill：**
- 输入：JD + 项目经验
- 输出：技术面试题、项目面试题、架构问题、AI 问题、推荐回答方向

**Project Deep Dive Skill：**
- 输入：项目名称
- 输出：项目背景、系统架构、我的职责、技术难点、解决方案、技术选型、技术取舍、项目成果、面试追问

### 7.5 API 设计

```javascript
// Skill 管理
GET    /api/ai/skills                       # 列出 Skill
POST   /api/ai/skills                       # 创建 Skill
GET    /api/ai/skills/:id                    # 获取 Skill 详情
DELETE /api/ai/skills/:id                    # 删除 Skill

// Skill 执行
POST   /api/ai/skills/:id/execute           # 执行 Skill
GET    /api/ai/skills/:id/executions        # 获取执行历史
GET    /api/ai/skill-executions/:id         # 获取执行详情
```

### 7.6 文件结构

```
workbench/
├── src/
│   ├── ai/
│   │   ├── skill/
│   │   │   ├── SkillPage.jsx          # Skill 页面
│   │   │   ├── SkillCard.jsx          # Skill 卡片
│   │   │   ├── SkillExecutor.jsx      # Skill 执行器
│   │   │   └── SkillEditor.jsx        # Skill 编辑器
│   │   ├── lib/
│   │   │   ├── skill-core.js          # Skill 核心
│   │   │   └── skill-registry.js      # Skill 注册表
│   │   └── hooks/
│   │       └── useSkillExecution.js
│   └── ...
├── server/
│   ├── ai/
│   │   ├── skill/
│   │   │   ├── skill-api.mjs          # Skill API
│   │   │   ├── skill-core.mjs         # Skill 核心
│   │   │   └── skills/
│   │   │       ├── jd-analysis.mjs
│   │   │       ├── project-match.mjs
│   │   │       ├── interview-prep.mjs
│   │   │       └── project-deep-dive.mjs
│   │   └── ...
│   └── ...
└── ...
```

## 八、Tool 架构方案

### 8.1 核心概念

Tool = Agent 可调用的统一接口

**设计原则：**
- 统一接口
- 类型安全
- 可测试
- 可复用

### 8.2 架构设计

```
Tool
  ├─ Name（名称）
  ├─ Description（描述）
  ├─ Input Schema（输入模式）
  ├─ Output Schema（输出模式）
  └─ Execute（执行函数）
```

### 8.3 数据模型

**Tool（工具）：**
```javascript
{
  name: string,
  description: string,
  inputSchema: object,       // Zod schema
  outputSchema: object,      // Zod schema
  execute: (input) => Promise<output>
}
```

### 8.4 第一阶段 Tool

**knowledge.search：**
- 输入：query, filters
- 输出：documents[]

**knowledge.get_document：**
- 输入：documentId
- 输出：document

**knowledge.get_context：**
- 输入：documentId, contextSize
- 输出：context

**project.search：**
- 输入：query, filters
- 输出：projects[]

**project.get：**
- 输入：projectId
- 输出：project

**skill.execute：**
- 输入：skillId, input
- 输出：result

### 8.5 文件结构

```
workbench/
├── server/
│   ├── ai/
│   │   ├── tools/
│   │   │   ├── tool-registry.mjs     # 工具注册表
│   │   │   ├── knowledge/
│   │   │   │   ├── search.mjs
│   │   │   │   ├── get-document.mjs
│   │   │   │   └── get-context.mjs
│   │   │   ├── project/
│   │   │   │   ├── search.mjs
│   │   │   │   └── get.mjs
│   │   │   └── skill/
│   │   │       └── execute.mjs
│   │   └── ...
│   └── ...
└── ...
```

## 九、数据模型总结

### 9.1 核心实体关系

```
User
  ↓ (1:N)
Workspace
  ↓ (1:N)
KnowledgeBase
  ↓ (1:N)
Document
  ↓ (1:N)
DocumentChunk

User
  ↓ (1:N)
Skill

User
  ↓ (1:N)
Agent

AgentExecution
  ↓ (1:N)
AgentStep

Conversation
  ↓ (1:N)
Message

Message
  ↓ (1:N)
RetrievalRecord
```

### 9.2 数据库选择

**主数据库：pgvector（PostgreSQL + pgvector）**
- 存储所有结构化数据
- 存储向量（Embedding）
- 支持复杂查询

**文件系统：**
- 存储 Markdown 文档
- 存储配置文件
- 存储用户数据

### 9.3 数据迁移策略

第一阶段：
- 使用文件系统 + 内存索引（保持现状）
- pgvector 仅用于 RAG（向量搜索）

第二阶段：
- 逐步迁移到 pgvector
- 保持文件系统作为文档存储

## 十、API 设计总结

### 10.1 新增 API 路由

```javascript
// RAG
/api/ai/knowledge-bases
/api/ai/conversations
/api/ai/retrieve

// Agent
/api/ai/agents
/api/ai/executions

// Skill
/api/ai/skills
/api/ai/skill-executions

// Tool（内部使用，不直接暴露）
```

### 10.2 API 鉴权

第一阶段：
- 无鉴权（本地使用）

第二阶段：
- 简单的 API Key 鉴权
- 支持 Workspace 隔离

## 十一、前端页面设计

### 11.1 新增页面

**AI Q&A 页面（/ai/qa）：**
- 对话界面
- 引用面板
- 检索调试

**Agent 页面（/ai/agent）：**
- Agent 选择
- 任务输入
- 执行时间线
- 结果展示

**Skill 页面（/ai/skills）：**
- Skill 列表
- Skill 详情
- Skill 执行
- Skill 编辑

**AI Demo 页面（/ai/demo）：**
- Demo 1：RAG
- Demo 2：Interview Agent
- Demo 3：Project Deep Dive

### 11.2 路由更新

```javascript
// App.jsx
<Route path="/ai/qa" element={<AIQAPage />} />
<Route path="/ai/agent" element={<AgentPage />} />
<Route path="/ai/skills" element={<SkillsPage />} />
<Route path="/ai/demo" element={<AIDemoPage />} />
```

### 11.3 导航更新

```javascript
// AppShell.jsx
{ to: "/ai/qa", label: "AI Q&A", icon: IconMessage }
{ to: "/ai/agent", label: "AI Agent", icon: IconRobot }
{ to: "/ai/skills", label: "Skills", icon: IconBrain }
{ to: "/ai/demo", label: "AI Demo", icon: IconDeviceDesktop }
```

## 十二、文件结构调整方案

### 12.1 新增目录

```
workbench/
├── src/
│   └── ai/                    # AI 模块
│       ├── rag/               # RAG
│       ├── agent/             # Agent
│       ├── skill/             # Skill
│       ├── lib/               # AI 工具库
│       └── hooks/             # AI Hooks
├── server/
│   └── ai/                    # AI 后端
│       ├── rag/
│       ├── agent/
│       ├── skill/
│       ├── llm/
│       ├── embedding/
│       ├── vector/
│       └── tools/
└── docs/
    └── ai/                    # AI 文档
        ├── architecture.md
        ├── rag.md
        ├── agent.md
        ├── skill.md
        ├── tool.md
        └── demo.md
```

### 12.2 配置文件

```
workbench/
├── .env.example              # 新增环境变量示例
└── config/
    └── ai-config.example.mjs # AI 配置示例
```

### 12.3 环境变量

```bash
# LLM
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-xxx
LLM_MODEL=gpt-4

# Embedding
EMBEDDING_BASE_URL=https://api.openai.com/v1
EMBEDDING_API_KEY=sk-xxx
EMBEDDING_MODEL=text-embedding-3-small

# Vector Store
DATABASE_URL=postgresql://user:pass@localhost:5432/beu
```

## 十三、第一阶段开发计划

### 13.1 阶段划分

**阶段 1：项目分析（当前）**
- ✅ 完成项目分析
- ✅ 创建分析文档
- ⏳ 等待确认

**阶段 2：AI 架构确定**
- 确定 RAG 技术选型
- 确定 Agent 架构
- 确定 Skill 架构
- 确定 Tool 架构
- 确定数据模型
- 创建架构文档

**阶段 3：RAG 实现**
- 集成 pgvector
- 实现 Embedding Provider
- 实现 Vector Store
- 实现文档分块
- 实现 RAG 服务
- 实现 RAG API
- 实现 AI Q&A 页面
- 测试 RAG 功能

**阶段 4：Skill 实现**
- 实现 Skill 核心
- 实现 Skill API
- 实现 JD Analysis Skill
- 实现 Project Match Skill
- 实现 Interview Preparation Skill
- 实现 Project Deep Dive Skill
- 实现 Skill 页面
- 测试 Skill 功能

**阶段 5：Tool 实现**
- 实现 Tool 注册表
- 实现 knowledge.search
- 实现 knowledge.get_document
- 实现 knowledge.get_context
- 实现 project.search
- 实现 project.get
- 实现 skill.execute
- 测试 Tool 功能

**阶段 6：Agent 实现**
- 实现 Agent 核心
- 实现 Planner
- 实现 Executor
- 实现 Memory
- 实现 Agent API
- 实现 Agent 页面
- 测试 Agent 功能

**阶段 7：Interview Agent 实现**
- 定义 Interview Agent
- 实现 Interview Agent 逻辑
- 集成 JD Analysis Skill
- 集成 Project Match Skill
- 集成 Interview Preparation Skill
- 测试 Interview Agent

**阶段 8：AI Demo 实现**
- 实现 AI Demo 页面
- 实现 Demo 1（RAG）
- 实现 Demo 2（Interview Agent）
- 实现 Demo 3（Project Deep Dive）
- 准备演示数据
- 测试 Demo 流程

**阶段 9：文档完善**
- 创建 AI 架构文档
- 创建 RAG 文档
- 创建 Agent 文档
- 创建 Skill 文档
- 创建 Tool 文档
- 创建 Demo 文档
- 更新 README

### 13.2 时间估算

- 阶段 1：1 天（已完成）
- 阶段 2：1 天
- 阶段 3：3-4 天
- 阶段 4：2-3 天
- 阶段 5：1-2 天
- 阶段 6：3-4 天
- 阶段 7：2-3 天
- 阶段 8：2-3 天
- 阶段 9：1-2 天

**总计：15-23 天**

## 十四、预计修改的文件

### 14.1 新增文件

**前端：**
- `src/ai/rag/RAGPage.jsx`
- `src/ai/rag/ConversationPanel.jsx`
- `src/ai/rag/MessageList.jsx`
- `src/ai/rag/CitationPanel.jsx`
- `src/ai/rag/RetrievalDebug.jsx`
- `src/ai/agent/AgentPage.jsx`
- `src/ai/agent/AgentExecutor.jsx`
- `src/ai/agent/ExecutionTimeline.jsx`
- `src/ai/agent/StepCard.jsx`
- `src/ai/agent/ResultPanel.jsx`
- `src/ai/skill/SkillPage.jsx`
- `src/ai/skill/SkillCard.jsx`
- `src/ai/skill/SkillExecutor.jsx`
- `src/ai/skill/SkillEditor.jsx`
- `src/ai/demo/AIDemoPage.jsx`
- `src/ai/lib/llm-provider.js`
- `src/ai/lib/embedding-provider.js`
- `src/ai/lib/vector-store.js`
- `src/ai/lib/rag-service.js`
- `src/ai/lib/agent-core.js`
- `src/ai/lib/skill-core.js`
- `src/ai/hooks/useRAGConversation.js`
- `src/ai/hooks/useRAGRetrieval.js`
- `src/ai/hooks/useAgentExecution.js`
- `src/ai/hooks/useSkillExecution.js`

**后端：**
- `server/ai/rag/rag-api.mjs`
- `server/ai/rag/chunking.mjs`
- `server/ai/rag/retrieval.mjs`
- `server/ai/agent/agent-api.mjs`
- `server/ai/agent/agent-core.mjs`
- `server/ai/agent/planner.mjs`
- `server/ai/agent/executor.mjs`
- `server/ai/skill/skill-api.mjs`
- `server/ai/skill/skill-core.mjs`
- `server/ai/skill/skills/jd-analysis.mjs`
- `server/ai/skill/skills/project-match.mjs`
- `server/ai/skill/skills/interview-prep.mjs`
- `server/ai/skill/skills/project-deep-dive.mjs`
- `server/ai/llm/llm-provider.mjs`
- `server/ai/llm/openai-client.mjs`
- `server/ai/embedding/embedding-provider.mjs`
- `server/ai/embedding/openai-embedding.mjs`
- `server/ai/vector/vector-store.mjs`
- `server/ai/vector/pgvector-store.mjs`
- `server/ai/tools/tool-registry.mjs`
- `server/ai/tools/knowledge/search.mjs`
- `server/ai/tools/knowledge/get-document.mjs`
- `server/ai/tools/knowledge/get-context.mjs`
- `server/ai/tools/project/search.mjs`
- `server/ai/tools/project/get.mjs`
- `server/ai/tools/skill/execute.mjs`

**文档：**
- `docs/workbench/ai/architecture.md`
- `docs/workbench/ai/rag.md`
- `docs/workbench/ai/agent.md`
- `docs/workbench/ai/skill.md`
- `docs/workbench/ai/tool.md`
- `docs/workbench/ai/demo.md`

**配置：**
- `workbench/.env.example`
- `workbench/config/ai-config.example.mjs`

### 14.2 修改文件

**前端：**
- `src/App.jsx` - 添加 AI 路由
- `src/components/AppShell.jsx` - 添加 AI 导航
- `src/main.jsx` - 添加 AI 样式导入

**后端：**
- `server/vite-plugin-workbench.mjs` - 添加 AI API 路由

**文档：**
- `README.md` - 更新项目描述

### 14.3 依赖更新

**新增依赖：**
```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "pgvector": "^0.1.5",
    "openai": "^4.20.0",
    "zod": "^3.25.76" // 已有
  }
}
```

## 十五、不应该修改的文件

### 15.1 核心业务文件

**不应修改：**
- `src/components/daily-hot/` - 抖音热榜组件
- `src/components/douyin/` - 抖音分析组件
- `src/components/materials/` - 素材管理组件
- `src/components/social-insights/` - 社媒洞察组件
- `src/pages/DailyHotPage.jsx`
- `src/pages/DouyinPage.jsx`
- `src/pages/SocialInsightsPage.jsx`
- `src/pages/MaterialsPage.jsx`
- `src/pages/BooksPage.jsx`
- `src/pages/TopicsPage.jsx`
- `server/daily-hot.mjs`
- `server/douyin.mjs`
- `server/social-insights.mjs`
- `server/materials.mjs`
- `server/books.mjs`

**理由：**
- 这些是业务功能，与 AI 模块无关
- 修改可能破坏现有功能
- 保持模块化

### 15.2 基础设施文件

**不应修改：**
- `src/graph/` - 知识图谱引擎
- `src/lib/obsidian-markdown.js`
- `src/lib/reader-*.js`
- `server/vault-index.mjs`
- `server/codex-runner.mjs`
- `server/reader-*.mjs`

**理由：**
- 这些是基础设施，应该保持稳定
- AI 模块应该复用而不是修改
- 修改可能影响其他功能

### 15.3 配置文件

**不应修改：**
- `vite.config.mjs`
- `package.json`（除了添加依赖）
- `tsconfig.json`（如果有）

**理由：**
- 构建配置应该保持稳定
- 不要改变构建流程

## 十六、风险与挑战

### 16.1 技术风险

1. **pgvector 部署**
   - 风险：用户可能不会部署 PostgreSQL
   - 缓解：提供 Docker 一键部署方案

2. **LLM API 成本**
   - 风险：频繁调用可能产生成本
   - 缓解：提供使用量统计和限制

3. **Embedding 质量**
   - 风险：Embedding 质量影响 RAG 效果
   - 缓解：支持多种 Embedding 模型

### 16.2 架构风险

1. **模块耦合**
   - 风险：AI 模块与现有代码耦合
   - 缓解：严格模块化，使用清晰的接口

2. **性能问题**
   - 风险：RAG 检索可能较慢
   - 缓解：缓存、异步处理

3. **数据一致性**
   - 风险：文件系统和数据库不一致
   - 缓解：定期同步、版本控制

### 16.3 产品风险

1. **演示失败**
   - 风险：面试时 AI 功能失败
   - 缓解：充分的测试、回退方案

2. **体验不佳**
   - 风险：AI 回答质量不高
   - 缓解：精心设计 Prompt、提供检索结果

## 十七、成功标准

### 17.1 功能验收

**Demo 1（RAG）：**
- ✅ 能够输入问题
- ✅ 能够检索相关文档
- ✅ 能够生成回答
- ✅ 能够展示来源
- ✅ 能够展示检索过程

**Demo 2（Interview Agent）：**
- ✅ 能够输入 JD
- ✅ 能够展示 Plan
- ✅ 能够展示 Tool Call
- ✅ 能够展示 Knowledge Retrieval
- ✅ 能够展示 Skill 调用
- ✅ 能够生成面试准备方案

**Demo 3（Project Deep Dive）：**
- ✅ 能够输入项目名称
- ✅ 能够生成项目介绍
- ✅ 能够生成系统架构
- ✅ 能够生成技术难点
- ✅ 能够生成面试追问

### 17.2 质量验收

- ✅ 所有测试通过
- ✅ 现有功能不被破坏
- ✅ 代码符合规范
- ✅ 文档完整
- ✅ 可以本地完整启动

### 17.3 演示验收

- ✅ 演示流程控制在 1-3 分钟
- ✅ 演示过程流畅
- ✅ 演示结果真实
- ✅ 能够回答面试官问题

## 十八、总结

### 18.1 当前状态

BeU Workbench 是一个基于 React + Vite 的kb工作台，具有以下特点：

**优势：**
- ✅ 完善的文档阅读和知识图谱能力
- ✅ 良好的 UI/UX 设计
- ✅ 模块化的代码结构
- ✅ 本地优先的数据存储

**不足：**
- ❌ 缺乏 AI 能力
- ❌ 没有 RAG 系统
- ❌ 没有 Agent 系统
- ❌ 没有 Skill 系统

### 18.2 目标

第一阶段的目标是：

1. 实现 RAG 系统
2. 实现 Agent 系统
3. 实现 Skill 系统
4. 实现 Tool 系统
5. 实现 Interview Agent
6. 实现 AI Demo

### 18.3 原则

**开发原则：**
- 不破坏现有功能
- 优先复用现有代码
- 不进行无意义的大规模重构
- AI 模块模块化
- 逐步演进

**设计原则：**
- 模块化
- 可扩展
- 可测试
- 可维护

### 18.4 下一步

等待确认分析文档，然后进入阶段 2：AI 架构确定。