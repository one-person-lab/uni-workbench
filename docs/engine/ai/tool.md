# Tool 模块详细设计

## 一、模块概述

Tool 模块提供统一的工具接口，Agent 和 Skill 通过 Tool 调用外部能力。

## 二、核心组件

### 2.1 Tool Definition（工具定义）

**职责：**
- 定义 Tool 的结构和元数据
- 验证 Tool 定义
- 管理 Tool 版本

**接口：**
```typescript
interface Tool {
  name: string
  description: string
  inputSchema: ZodSchema
  outputSchema: ZodSchema
  execute: (input: unknown) => Promise<unknown>
  metadata: {
    category: string
    timeout: number
    rateLimit?: number
  }
}
```

**示例：**
```javascript
// server/ai/tools/knowledge/search.mjs

import { z } from 'zod';

export const knowledgeSearchTool = {
  name: 'knowledge.search',
  description: '搜索知识库中的文档',
  inputSchema: z.object({
    query: z.string().describe('搜索查询'),
    topK: z.number().default(5).describe('返回结果数量'),
    filters: z.object({
      section: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }).optional(),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      id: z.string(),
      title: z.string(),
      path: z.string(),
      content: z.string(),
      metadata: z.object({
        section: z.string(),
        tags: z.array(z.string()),
      }),
      score: z.number(),
    })),
  }),
  execute: async (input, context) => {
    const { vaultIndex } = context;
    const results = await vaultIndex.search(input.query, {
      limit: input.topK,
      filters: input.filters,
    });
    return { results };
  },
  metadata: {
    category: 'knowledge',
    timeout: 5000,
  },
};
```

### 2.2 Tool Registry（工具注册表）

**职责：**
- 注册 Tool
- 调用 Tool
- 管理 Tool 生命周期

**接口：**
```typescript
interface ToolRegistry {
  register(tool: Tool): void
  call(toolName: string, input: unknown, context?: Context): Promise<ToolResult>
  getTool(toolName: string): Tool
  listTools(): Tool[]
  unregister(toolName: string): void
}

interface ToolResult {
  output: unknown
  executionTime: number
  error?: string
}
```

**实现：**
```javascript
// server/ai/tools/tool-registry.mjs

export class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  register(tool) {
    this.tools.set(tool.name, tool);
  }

  async call(toolName, input, context = {}) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    const startTime = Date.now();

    try {
      // 1. 验证输入
      const validatedInput = tool.inputSchema.parse(input);

      // 2. 执行工具
      const output = await tool.execute(validatedInput, context);

      // 3. 验证输出
      const validatedOutput = tool.outputSchema.parse(output);

      return {
        output: validatedOutput,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        output: null,
        executionTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  getTool(toolName) {
    return this.tools.get(toolName);
  }

  listTools() {
    return Array.from(this.tools.values());
  }

  unregister(toolName) {
    this.tools.delete(toolName);
  }
}
```

### 2.3 Tool Executor（工具执行器）

**职责：**
- 超时控制
- 错误处理
- 速率限制

**实现：**
```javascript
// server/ai/tools/tool-executor.mjs

export class ToolExecutor {
  constructor(toolRegistry) {
    this.toolRegistry = toolRegistry;
    this.rateLimits = new Map();
  }

  async execute(toolName, input, context = {}) {
    const tool = this.toolRegistry.getTool(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    // 1. 速率限制检查
    this.checkRateLimit(toolName, tool.metadata.rateLimit);

    // 2. 超时控制
    const timeout = tool.metadata.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const result = await this.toolRegistry.call(toolName, input, context);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Tool execution timeout: ${toolName}`);
      }
      throw error;
    }
  }

  checkRateLimit(toolName, rateLimit) {
    if (!rateLimit) return;

    const now = Date.now();
    const window = 60000; // 1 分钟
    const calls = this.rateLimits.get(toolName) || [];

    // 清理过期记录
    const validCalls = calls.filter(call => now - call < window);
    this.rateLimits.set(toolName, validCalls);

    if (validCalls.length >= rateLimit) {
      throw new Error(`Rate limit exceeded for tool: ${toolName}`);
    }

    // 记录调用
    validCalls.push(now);
    this.rateLimits.set(toolName, validCalls);
  }
}
```

## 三、第一阶段 Tool 实现

### 3.1 knowledge.search

**功能：** 搜索知识库中的文档

**输入：**
```javascript
{
  query: "无人机项目",
  topK: 5,
  filters: {
    section: "wiki",
    tags: ["project"]
  }
}
```

**输出：**
```javascript
{
  results: [
    {
      id: "doc-1",
      title: "无人机实战平台",
      path: "wiki/projects/drone-platform.md",
      content: "无人机实战平台是一个...",
      metadata: {
        section: "wiki",
        tags: ["project", "iot"]
      },
      score: 0.95
    }
  ]
}
```

**实现：**
```javascript
// server/ai/tools/knowledge/search.mjs

import { z } from 'zod';

export const knowledgeSearchTool = {
  name: 'knowledge.search',
  description: '搜索知识库中的文档',
  inputSchema: z.object({
    query: z.string().describe('搜索查询'),
    topK: z.number().default(5).describe('返回结果数量'),
    filters: z.object({
      section: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }).optional(),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      id: z.string(),
      title: z.string(),
      path: z.string(),
      content: z.string(),
      metadata: z.object({
        section: z.string(),
        tags: z.array(z.string()),
      }),
      score: z.number(),
    })),
  }),
  execute: async (input, context) => {
    const { vaultIndex } = context;
    const results = await vaultIndex.search(input.query, {
      limit: input.topK,
      filters: input.filters,
    });
    return { results };
  },
  metadata: {
    category: 'knowledge',
    timeout: 5000,
  },
};
```

### 3.2 knowledge.get_document

**功能：** 获取文档详情

**输入：**
```javascript
{
  documentId: "doc-1"
}
```

**输出：**
```javascript
{
  id: "doc-1",
  title: "无人机实战平台",
  path: "wiki/projects/drone-platform.md",
  content: "无人机实战平台是一个...",
  metadata: {
    section: "wiki",
    tags: ["project", "iot"],
    createdAt: "2026-01-01T00:00:00Z",
    modifiedAt: "2026-01-01T00:00:00Z"
  }
}
```

**实现：**
```javascript
// server/ai/tools/knowledge/get-document.mjs

import { z } from 'zod';

export const knowledgeGetDocumentTool = {
  name: 'knowledge.get_document',
  description: '获取文档详情',
  inputSchema: z.object({
    documentId: z.string().describe('文档 ID'),
  }),
  outputSchema: z.object({
    id: z.string(),
    title: z.string(),
    path: z.string(),
    content: z.string(),
    metadata: z.object({
      section: z.string(),
      tags: z.array(z.string()),
      createdAt: z.string(),
      modifiedAt: z.string(),
    }),
  }),
  execute: async (input, context) => {
    const { vaultIndex } = context;
    const document = await vaultIndex.getDocument(input.documentId);
    return document;
  },
  metadata: {
    category: 'knowledge',
    timeout: 3000,
  },
};
```

### 3.3 knowledge.get_context

**功能：** 获取文档上下文

**输入：**
```javascript
{
  documentId: "doc-1",
  contextSize: 1000
}
```

**输出：**
```javascript
{
  documentId: "doc-1",
  context: "无人机实战平台是一个面向...",
  contextSize: 1000,
  tokens: 250
}
```

**实现：**
```javascript
// server/ai/tools/knowledge/get-context.mjs

import { z } from 'zod';

export const knowledgeGetContextTool = {
  name: 'knowledge.get_context',
  description: '获取文档上下文',
  inputSchema: z.object({
    documentId: z.string().describe('文档 ID'),
    contextSize: z.number().default(1000).describe('上下文大小（字符数）'),
  }),
  outputSchema: z.object({
    documentId: z.string(),
    context: z.string(),
    contextSize: z.number(),
    tokens: z.number(),
  }),
  execute: async (input, context) => {
    const { vaultIndex } = context;
    const document = await vaultIndex.getDocument(input.documentId);
    const contextText = document.content.slice(0, input.contextSize);
    const tokens = Math.ceil(contextText.length / 4);

    return {
      documentId: input.documentId,
      context: contextText,
      contextSize: input.contextSize,
      tokens,
    };
  },
  metadata: {
    category: 'knowledge',
    timeout: 3000,
  },
};
```

### 3.4 project.search

**功能：** 搜索项目

**输入：**
```javascript
{
  query: "Java 后端",
  topK: 5
}
```

**输出：**
```javascript
{
  results: [
    {
      id: "project-1",
      name: "消防物联网平台",
      techStack: ["Java", "Spring Boot"],
      description: "消防物联网平台是一个...",
      matchScore: 0.9
    }
  ]
}
```

**实现：**
```javascript
// server/ai/tools/project/search.mjs

import { z } from 'zod';

export const projectSearchTool = {
  name: 'project.search',
  description: '搜索项目',
  inputSchema: z.object({
    query: z.string().describe('搜索查询'),
    topK: z.number().default(5).describe('返回结果数量'),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      id: z.string(),
      name: z.string(),
      techStack: z.array(z.string()),
      description: z.string(),
      matchScore: z.number(),
    })),
  }),
  execute: async (input, context) => {
    const { vaultIndex } = context;
    // 从 Vault 中搜索项目文档
    const results = await vaultIndex.search(input.query, {
      limit: input.topK,
      filters: { section: 'projects' },
    });

    // 转换为项目格式
    const projects = results.map(doc => ({
      id: doc.id,
      name: doc.title,
      techStack: doc.metadata.techStack || [],
      description: doc.content.slice(0, 200),
      matchScore: doc.score,
    }));

    return { results: projects };
  },
  metadata: {
    category: 'project',
    timeout: 5000,
  },
};
```

### 3.5 project.get

**功能：** 获取项目详情

**输入：**
```javascript
{
  projectId: "project-1"
}
```

**输出：**
```javascript
{
  id: "project-1",
  name: "消防物联网平台",
  techStack: ["Java", "Spring Boot", "MyBatis"],
  description: "消防物联网平台是一个...",
  architecture: "...",
  responsibilities: ["负责后端开发"],
  challenges: [
    {
      challenge: "高并发设备接入",
      solution: "使用 MQTT 集群"
    }
  ],
  results: ["部署 50 个站点"]
}
```

**实现：**
```javascript
// server/ai/tools/project/get.mjs

import { z } from 'zod';

export const projectGetTool = {
  name: 'project.get',
  description: '获取项目详情',
  inputSchema: z.object({
    projectId: z.string().describe('项目 ID'),
  }),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
    techStack: z.array(z.string()),
    description: z.string(),
    architecture: z.string(),
    responsibilities: z.array(z.string()),
    challenges: z.array(z.object({
      challenge: z.string(),
      solution: z.string(),
    })),
    results: z.array(z.string()),
  }),
  execute: async (input, context) => {
    const { vaultIndex } = context;
    const document = await vaultIndex.getDocument(input.projectId);

    // 解析项目文档
    const metadata = document.metadata || {};
    return {
      id: document.id,
      name: document.title,
      techStack: metadata.techStack || [],
      description: document.content.slice(0, 500),
      architecture: metadata.architecture || '',
      responsibilities: metadata.responsibilities || [],
      challenges: metadata.challenges || [],
      results: metadata.results || [],
    };
  },
  metadata: {
    category: 'project',
    timeout: 3000,
  },
};
```

### 3.6 skill.execute

**功能：** 执行 Skill

**输入：**
```javascript
{
  skillId: "jd-analysis",
  input: {
    jd: "Java 后端开发工程师..."
  }
}
```

**输出：**
```javascript
{
  executionId: "exec-1",
  skillId: "jd-analysis",
  output: {
    responsibilities: ["负责后端开发"],
    techStack: ["Java", "Spring Boot"]
  },
  executionTime: 1500
}
```

**实现：**
```javascript
// server/ai/tools/skill/execute.mjs

import { z } from 'zod';

export const skillExecuteTool = {
  name: 'skill.execute',
  description: '执行 Skill',
  inputSchema: z.object({
    skillId: z.string().describe('Skill ID'),
    input: z.any().describe('Skill 输入'),
  }),
  outputSchema: z.object({
    executionId: z.string(),
    skillId: z.string(),
    output: z.any(),
    executionTime: z.number(),
  }),
  execute: async (input, context) => {
    const { skillEngine } = context;
    const execution = await skillEngine.execute(input.skillId, input.input);
    return {
      executionId: execution.id,
      skillId: execution.skillId,
      output: execution.output,
      executionTime: execution.executionTime,
    };
  },
  metadata: {
    category: 'skill',
    timeout: 60000,
  },
};
```

## 四、Tool Registry 初始化

### 4.1 注册所有 Tool

```javascript
// server/ai/tools/index.mjs

import { ToolRegistry } from './tool-registry.mjs';
import { knowledgeSearchTool } from './knowledge/search.mjs';
import { knowledgeGetDocumentTool } from './knowledge/get-document.mjs';
import { knowledgeGetContextTool } from './knowledge/get-context.mjs';
import { projectSearchTool } from './project/search.mjs';
import { projectGetTool } from './project/get.mjs';
import { skillExecuteTool } from './skill/execute.mjs';

export function createToolRegistry(context) {
  const registry = new ToolRegistry();

  // 注册 Knowledge Tools
  registry.register(knowledgeSearchTool);
  registry.register(knowledgeGetDocumentTool);
  registry.register(knowledgeGetContextTool);

  // 注册 Project Tools
  registry.register(projectSearchTool);
  registry.register(projectGetTool);

  // 注册 Skill Tool
  registry.register(skillExecuteTool);

  return registry;
}
```

## 五、API 设计

### 5.1 Tool 管理

```javascript
// 列出所有 Tool
GET /api/ai/tools

// 获取 Tool 详情
GET /api/ai/tools/:name

// 调用 Tool
POST /api/ai/tools/:name/call
{
  "input": {
    "query": "无人机项目"
  }
}
```

## 六、前端设计

### 6.1 Tool 调用 Hook

```javascript
// src/ai/hooks/useToolCall.js

export function useToolCall(toolName) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = async (input) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/tools/${toolName}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { result, call, loading, error };
}
```

## 七、配置

### 7.1 环境变量

```bash
# Tool
TOOL_DEFAULT_TIMEOUT=30000
TOOL_RATE_LIMIT_ENABLED=true
TOOL_RATE_LIMIT=100
```

### 7.2 配置文件

```javascript
// config/ai-config.mjs
export const toolConfig = {
  defaultTimeout: 30000,
  rateLimit: {
    enabled: true,
    limit: 100,
    window: 60000,
  },
};
```

## 八、测试

### 8.1 单元测试

```javascript
// tests/tools/tool-registry.test.mjs
import { describe, it } from 'node:test';
import { ToolRegistry } from '../server/ai/tools/tool-registry.mjs';

describe('ToolRegistry', () => {
  it('should register and call tool', async () => {
    const registry = new ToolRegistry();
    registry.register(testTool);
    const result = await registry.call('test', { input: 'test' });
    assert.ok(result.output);
  });
});
```

### 8.2 Tool 测试

```javascript
// tests/tools/knowledge/search.test.mjs
import { describe, it } from 'node:test';
import { knowledgeSearchTool } from '../server/ai/tools/knowledge/search.mjs';

describe('Knowledge Search Tool', () => {
  it('should search documents', async () => {
    const result = await knowledgeSearchTool.execute(
      { query: 'test', topK: 5 },
      { vaultIndex: mockVaultIndex }
    );
    assert.ok(result.results.length > 0);
  });
});
```

## 九、错误处理

### 9.1 错误类型

```javascript
class ToolError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export const ToolErrorCodes = {
  TOOL_NOT_FOUND: 'TOOL_NOT_FOUND',
  INPUT_VALIDATION_FAILED: 'TOOL_INPUT_VALIDATION_FAILED',
  OUTPUT_VALIDATION_FAILED: 'TOOL_OUTPUT_VALIDATION_FAILED',
  EXECUTION_FAILED: 'TOOL_EXECUTION_FAILED',
  TIMEOUT: 'TOOL_TIMEOUT',
  RATE_LIMIT_EXCEEDED: 'TOOL_RATE_LIMIT_EXCEEDED',
};
```

### 9.2 错误处理

```javascript
try {
  const result = await toolRegistry.call(toolName, input);
} catch (error) {
  if (error.code === 'TOOL_NOT_FOUND') {
    // 处理工具不存在
  } else if (error.code === 'TOOL_TIMEOUT') {
    // 处理超时
  } else if (error.code === 'TOOL_RATE_LIMIT_EXCEEDED') {
    // 处理速率限制
  }
}
```

## 十、总结

Tool 模块的核心流程：

1. **定义**：Tool Definition
2. **注册**：Tool Registry
3. **调用**：Tool Executor
4. **验证**：Input/Output Schema

关键设计点：
- 统一接口
- 类型安全（Zod）
- 超时控制
- 速率限制
- 错误处理