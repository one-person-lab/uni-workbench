# BeU Workbench AI 架构

## 一、总体架构

### 1.1 架构分层

```
┌─────────────────────────────────────────────────────────┐
│                     UI Layer                             │
│  AI Q&A | Agent | Skills | Knowledge Graph | Dashboard   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
│  RAG Service | Agent Core | Skill Engine | Tool Registry │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Integration Layer                      │
│  LLM Provider | Embedding Provider | Vector Store       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                             │
│  pgvector | File System | Vault Index                   │
└─────────────────────────────────────────────────────────┘
```

### 1.2 核心模块关系

```
User
  ↓
AI Q&A (RAG)
  ├─→ KnowledgeBase
  ├─→ DocumentChunk
  ├─→ Embedding Provider
  ├─→ Vector Store
  └─→ LLM Provider

User
  ↓
Agent
  ├─→ Tool Registry
  ├─→ Skill Engine
  ├─→ LLM Provider
  └─→ KnowledgeBase

Skill
  ├─→ Tool Registry
  ├─→ LLM Provider
  └─→ KnowledgeBase

Tool
  ├─→ File System
  ├─→ Vault Index
  └─→ Vector Store
```

### 1.3 技术选型确认

| 模块 | 技术选型 | 理由 |
|------|---------|------|
| 向量数据库 | pgvector (PostgreSQL) | 成熟稳定，SQL 兼容，云服务支持 |
| LLM Provider | OpenAI Compatible API | 通用性强，支持多种模型 |
| Embedding Provider | OpenAI Compatible API | 通用性强，支持多种模型 |
| 前端框架 | React 19.2.0 | 现有技术栈 |
| 构建工具 | Vite 6.4.2 | 现有技术栈 |
| 后端运行时 | Node.js 20+ | 现有技术栈 |
| 验证库 | Zod 3.25.76 | 现有技术栈 |

## 二、模块设计

### 2.1 RAG 模块

**职责：**
- 文档分块
- 向量化
- 语义检索
- 上下文构建
- 答案生成

**接口：**
```typescript
interface RAGService {
  // 检索
  retrieve(query: string, options: RetrieveOptions): Promise<RetrievalResult>

  // 问答
  answer(query: string, context: string): Promise<Answer>

  // 对话
  chat(conversationId: string, message: string): Promise<ChatResponse>
}
```

**依赖：**
- Embedding Provider
- Vector Store
- LLM Provider

### 2.2 Agent 模块

**职责：**
- 任务规划
- 工具调用
- 步骤执行
- 结果聚合

**接口：**
```typescript
interface AgentCore {
  // 执行任务
  execute(task: string, context: Context): Promise<AgentExecution>

  // 获取执行状态
  getExecution(executionId: string): Promise<AgentExecution>

  // 取消执行
  cancelExecution(executionId: string): Promise<void>
}
```

**依赖：**
- LLM Provider
- Tool Registry
- Skill Engine

### 2.3 Skill 模块

**职责：**
- Skill 定义
- Skill 执行
- Skill 管理

**接口：**
```typescript
interface SkillEngine {
  // 执行 Skill
  execute(skillId: string, input: unknown): Promise<SkillExecution>

  // 获取 Skill
  getSkill(skillId: string): Promise<Skill>

  // 列出 Skill
  listSkills(filters?: SkillFilters): Promise<Skill[]>
}
```

**依赖：**
- LLM Provider
- Tool Registry

### 2.4 Tool 模块

**职责：**
- 工具注册
- 工具调用
- 工具管理

**接口：**
```typescript
interface ToolRegistry {
  // 注册工具
  register(tool: Tool): void

  // 调用工具
  call(toolName: string, input: unknown): Promise<ToolResult>

  // 获取工具
  getTool(toolName: string): Tool

  // 列出工具
  listTools(): Tool[]
}
```

**依赖：**
- File System
- Vault Index
- Vector Store

## 三、数据流

### 3.1 RAG 数据流

```
用户问题
  ↓
RAG Service
  ↓
Embedding Provider (向量化查询)
  ↓
Vector Store (相似度搜索)
  ↓
Top K Chunks
  ↓
Context Builder (构建上下文)
  ↓
LLM Provider (生成答案)
  ↓
Answer + Citations
  ↓
用户
```

### 3.2 Agent 数据流

```
用户任务
  ↓
Agent Core
  ↓
Planner (生成计划)
  ↓
Executor (执行步骤)
  ↓
Tool Registry (调用工具)
  ↓
Skill Engine (调用技能)
  ↓
LLM Provider (生成决策)
  ↓
Observation
  ↓
Next Action Decision
  ↓
Final Answer
  ↓
用户
```

### 3.3 Skill 数据流

```
输入
  ↓
Skill Engine
  ↓
LLM Provider (处理指令)
  ↓
Tool Registry (调用工具)
  ↓
Vector Store (检索知识)
  ↓
输出
```

## 四、接口设计

### 4.1 API 命名空间

所有 AI 相关 API 使用 `/api/ai` 命名空间：

```
/api/ai/knowledge-bases
/api/ai/conversations
/api/ai/retrieve
/api/ai/agents
/api/ai/executions
/api/ai/skills
/api/ai/skill-executions
```

### 4.2 错误处理

统一错误格式：

```typescript
interface APIError {
  error: {
    code: string
    message: string
    details?: unknown
  }
}
```

错误码规范：
- `RAG_` 开头：RAG 相关错误
- `AGENT_` 开头：Agent 相关错误
- `SKILL_` 开头：Skill 相关错误
- `TOOL_` 开头：Tool 相关错误
- `LLM_` 开头：LLM 相关错误
- `EMBEDDING_` 开头：Embedding 相关错误
- `VECTOR_` 开头：Vector Store 相关错误

### 4.3 事件流

使用 Server-Sent Events (SSE) 推送实时事件：

```
GET /api/ai/executions/:id/events
```

事件格式：

```typescript
interface AgentEvent {
  type: 'step_started' | 'step_completed' | 'tool_call' | 'skill_call' | 'thought' | 'completed' | 'failed'
  data: unknown
  timestamp: string
}
```

## 五、配置管理

### 5.1 环境变量

```bash
# LLM
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-xxx
LLM_MODEL=gpt-4
LLM_TIMEOUT=30000

# Embedding
EMBEDDING_BASE_URL=https://api.openai.com/v1
EMBEDDING_API_KEY=sk-xxx
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
EMBEDDING_TIMEOUT=30000

# Vector Store
DATABASE_URL=postgresql://user:pass@localhost:5432/beu
VECTOR_TABLE_NAME=document_chunks
VECTOR_DIMENSIONS=1536

# AI
AI_MAX_RETRIEVAL_COUNT=5
AI_MAX_CONTEXT_TOKENS=4000
AI_TEMPERATURE=0.7
```

### 5.2 配置文件

`config/ai-config.mjs`:

```javascript
export const aiConfig = {
  rag: {
    maxRetrievalCount: 5,
    maxContextTokens: 4000,
    chunkSize: 512,
    chunkOverlap: 50,
  },
  agent: {
    maxIterations: 10,
    temperature: 0.7,
    timeout: 300000,
  },
  skill: {
    timeout: 60000,
  },
  tool: {
    timeout: 30000,
  },
};
```

## 六、安全考虑

### 6.1 API Key 管理

- 禁止在代码中硬编码 API Key
- 使用环境变量存储 API Key
- 提供配置文件示例（`.env.example`）
- 生产环境使用密钥管理服务

### 6.2 数据隔离

第一阶段：
- 单用户，无隔离

第二阶段：
- Workspace 隔离
- User 隔离

### 6.3 访问控制

第一阶段：
- 无鉴权（本地使用）

第二阶段：
- API Key 鉴权
- Workspace 隔离

## 七、性能优化

### 7.1 缓存策略

**Embedding 缓存：**
- 缓存文档 Embedding
- 缓存查询 Embedding
- 缓存时间：24 小时

**检索缓存：**
- 缓存检索结果
- 缓存时间：5 分钟

**对话缓存：**
- 缓存对话上下文
- 缓存时间：会话期间

### 7.2 异步处理

**文档索引：**
- 异步处理
- 进度推送（SSE）

**Agent 执行：**
- 异步执行
- 实时推送（SSE）

### 7.3 批量处理

**Embedding：**
- 批量处理（最多 100 个文档）
- 速率限制

**检索：**
- 批量检索（最多 10 个查询）

## 八、测试策略

### 8.1 单元测试

- RAG Service
- Agent Core
- Skill Engine
- Tool Registry
- LLM Provider
- Embedding Provider
- Vector Store

### 8.2 集成测试

- RAG 端到端
- Agent 端到端
- Skill 端到端
- Tool 端到端

### 8.3 演示测试

- Demo 1（RAG）
- Demo 2（Interview Agent）
- Demo 3（Project Deep Dive）

## 九、监控与日志

### 9.1 指标

- RAG 检索延迟
- RAG 检索准确率
- Agent 执行时间
- Agent 执行成功率
- Skill 执行时间
- Skill 执行成功率
- LLM 调用次数
- LLM 调用成本

### 9.2 日志

- Agent 执行日志
- Skill 执行日志
- Tool 调用日志
- RAG 检索日志
- LLM 调用日志

## 十、扩展性

### 10.1 插件化

**Tool 插件：**
- 支持自定义 Tool
- 动态注册

**Skill 插件：**
- 支持自定义 Skill
- 动态加载

**Agent 插件：**
- 支持自定义 Agent
- 动态配置

### 10.2 多模型支持

**LLM Provider：**
- OpenAI
- Anthropic
- Azure OpenAI
- 本地模型（Ollama）

**Embedding Provider：**
- OpenAI
- Cohere
- 本地模型

### 10.3 多向量数据库

**Vector Store：**
- pgvector
- Qdrant
- Chroma
- Pinecone

## 十一、版本兼容性

### 11.1 数据版本

- DocumentChunk 版本字段
- 向量维度兼容
- 数据迁移脚本

### 11.2 API 版本

- API 版本号
- 向后兼容
- 废弃策略

## 十二、部署架构

### 12.1 本地部署

```
PostgreSQL (pgvector)
  ↓
Node.js Backend (Vite Plugin)
  ↓
React Frontend
```

### 12.2 Docker 部署

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
  app:
    build: .
    depends_on:
      - postgres
```

### 12.3 云部署

- Supabase（PostgreSQL + pgvector）
- Neon（PostgreSQL + pgvector）
- Railway（PostgreSQL + pgvector）

## 十三、开发规范

### 13.1 代码规范

- TypeScript 类型定义
- Zod 运行时验证
- 错误处理
- 日志记录

### 13.2 文档规范

- API 文档
- 架构文档
- 使用文档
- 开发文档

### 13.3 测试规范

- 单元测试覆盖率 > 80%
- 集成测试必须通过
- 演示测试必须通过

## 十四、里程碑

### 14.1 第一阶段

- ✅ RAG 基础功能
- ✅ Agent 基础功能
- ✅ Skill 基础功能
- ✅ Tool 基础功能
- ✅ Interview Agent
- ✅ AI Demo

### 14.2 第二阶段

- 多用户支持
- Workspace 隔离
- API 鉴权
- 多模型支持

### 14.3 第三阶段

- 插件系统
- 市场系统
- 商业化

## 十五、总结

本架构设计遵循以下原则：

1. **模块化**：各模块独立，职责清晰
2. **可扩展**：支持插件、多模型、多向量数据库
3. **可测试**：单元测试、集成测试、演示测试
4. **可维护**：清晰的接口、完善的文档
5. **性能优化**：缓存、异步、批量处理
6. **安全**：API Key 管理、数据隔离、访问控制

下一步：开始实现 RAG 模块。