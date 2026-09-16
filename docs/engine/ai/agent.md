# Agent 模块详细设计

## 一、模块概述

Agent 模块负责将复杂任务分解为可执行的步骤，通过调用工具和技能完成任务。

## 二、核心组件

### 2.1 Planner（计划生成器）

**职责：**
- 分析任务
- 生成执行计划
- 分解步骤

**接口：**
```typescript
interface Planner {
  plan(task: string, context: Context): Promise<Plan>
}

interface Plan {
  steps: PlanStep[]
  reasoning: string
}

interface PlanStep {
  stepNumber: number
  type: 'tool_call' | 'skill_call' | 'thought'
  description: string
  toolName?: string
  skillName?: string
  input?: unknown
}
```

**实现：**
```javascript
// server/ai/agent/planner.mjs

export class LLMPlanner {
  constructor(llmProvider, toolRegistry, skillEngine) {
    this.llmProvider = llmProvider;
    this.toolRegistry = toolRegistry;
    this.skillEngine = skillEngine;
  }

  async plan(task, context) {
    const tools = this.toolRegistry.listTools();
    const skills = await this.skillEngine.listSkills();

    const systemPrompt = `
你是一个任务规划器。你的职责是将复杂任务分解为可执行的步骤。

可用工具：
${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

可用技能：
${skills.map(s => `- ${s.name}: ${s.description}`).join('\n')}

任务格式：
1. 分析任务
2. 确定需要的工具和技能
3. 生成执行步骤
4. 输出 JSON 格式的计划

计划格式：
{
  "reasoning": "规划过程说明",
  "steps": [
    {
      "stepNumber": 1,
      "type": "tool_call|skill_call|thought",
      "description": "步骤描述",
      "toolName": "工具名称（如果适用）",
      "skillName": "技能名称（如果适用）",
      "input": "输入参数（如果适用）"
    }
  ]
}
`;

    const userPrompt = `
任务：${task}

上下文：
${JSON.stringify(context, null, 2)}

请生成执行计划。
`;

    const response = await this.llmProvider.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const plan = JSON.parse(response.content);
    return plan;
  }
}
```

### 2.2 Executor（执行器）

**职责：**
- 执行计划步骤
- 调用工具
- 调用技能
- 收集结果

**接口：**
```typescript
interface Executor {
  execute(plan: Plan, context: Context): Promise<ExecutionResult>
}

interface ExecutionResult {
  steps: ExecutionStep[]
  finalResult: string
  status: 'completed' | 'failed'
}

interface ExecutionStep {
  stepNumber: number
  type: 'tool_call' | 'skill_call' | 'thought'
  content: string
  toolCall?: ToolCallResult
  skillCall?: SkillCallResult
  thought?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  error?: string
}
```

**实现：**
```javascript
// server/ai/agent/executor.mjs

export class Executor {
  constructor(toolRegistry, skillEngine, llmProvider) {
    this.toolRegistry = toolRegistry;
    this.skillEngine = skillEngine;
    this.llmProvider = llmProvider;
  }

  async execute(plan, context, onStep) {
    const steps = [];
    let finalResult = '';

    for (const planStep of plan.steps) {
      const step = await this.executeStep(planStep, context, onStep);
      steps.push(step);

      if (step.status === 'failed') {
        return {
          steps,
          finalResult: step.error,
          status: 'failed',
        };
      }
    }

    // 生成最终结果
    finalResult = await this.generateFinalResult(steps, context);

    return {
      steps,
      finalResult,
      status: 'completed',
    };
  }

  async executeStep(planStep, context, onStep) {
    const step = {
      stepNumber: planStep.stepNumber,
      type: planStep.type,
      status: 'running',
    };

    try {
      if (onStep) onStep(step);

      if (planStep.type === 'tool_call') {
        const result = await this.toolRegistry.call(planStep.toolName, planStep.input);
        step.toolCall = {
          toolName: planStep.toolName,
          input: planStep.input,
          output: result,
        };
        step.content = `调用工具 ${planStep.toolName}，返回结果`;
      } else if (planStep.type === 'skill_call') {
        const result = await this.skillEngine.execute(planStep.skillName, planStep.input);
        step.skillCall = {
          skillName: planStep.skillName,
          input: planStep.input,
          output: result,
        };
        step.content = `调用技能 ${planStep.skillName}，返回结果`;
      } else if (planStep.type === 'thought') {
        step.thought = planStep.description;
        step.content = planStep.description;
      }

      step.status = 'completed';
    } catch (error) {
      step.status = 'failed';
      step.error = error.message;
    }

    if (onStep) onStep(step);
    return step;
  }

  async generateFinalResult(steps, context) {
    const systemPrompt = `
你是一个结果总结器。你的职责是根据执行步骤生成最终结果。

任务：${context.task}

执行步骤：
${steps.map(s => `- ${s.content}`).join('\n')}

请生成最终结果，要求：
1. 清晰总结执行过程
2. 提供关键发现
3. 给出可操作的建议
`;

    const response = await this.llmProvider.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请生成最终结果。' },
    ]);

    return response.content;
  }
}
```

### 2.3 Agent Core

**职责：**
- 协调 Planner 和 Executor
- 管理执行状态
- 处理错误

**接口：**
```typescript
interface AgentCore {
  execute(task: string, context: Context): Promise<AgentExecution>
  getExecution(executionId: string): Promise<AgentExecution>
  cancelExecution(executionId: string): Promise<void>
}

interface AgentExecution {
  id: string
  agentId: string
  task: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  plan: Plan
  steps: ExecutionStep[]
  result: string
  createdAt: string
  completedAt?: string
}
```

**实现：**
```javascript
// server/ai/agent/agent-core.mjs

export class AgentCore {
  constructor(config) {
    this.planner = new LLMPlanner(config.llmProvider, config.toolRegistry, config.skillEngine);
    this.executor = new Executor(config.toolRegistry, config.skillEngine, config.llmProvider);
    this.executions = new Map();
  }

  async execute(task, context, onStep) {
    const executionId = crypto.randomUUID();
    const execution = {
      id: executionId,
      agentId: context.agentId,
      task,
      status: 'running',
      plan: null,
      steps: [],
      result: null,
      createdAt: new Date().toISOString(),
    };

    this.executions.set(executionId, execution);

    try {
      // 1. 生成计划
      const plan = await this.planner.plan(task, context);
      execution.plan = plan;

      // 2. 执行计划
      const result = await this.executor.execute(plan, context, onStep);
      execution.steps = result.steps;
      execution.result = result.finalResult;
      execution.status = result.status;
      execution.completedAt = new Date().toISOString();
    } catch (error) {
      execution.status = 'failed';
      execution.result = error.message;
      execution.completedAt = new Date().toISOString();
    }

    return execution;
  }

  getExecution(executionId) {
    return this.executions.get(executionId);
  }

  cancelExecution(executionId) {
    const execution = this.executions.get(executionId);
    if (execution) {
      execution.status = 'cancelled';
      execution.completedAt = new Date().toISOString();
    }
  }
}
```

### 2.4 Memory（记忆）

**职责：**
- 存储执行历史
- 检索相关经验
- 上下文管理

**接口：**
```typescript
interface Memory {
  store(execution: AgentExecution): Promise<void>
  retrieve(query: string, topK: number): Promise<AgentExecution[]>
  getContext(executionId: string): Promise<Context>
}
```

**实现：**
```javascript
// server/ai/agent/memory.mjs

export class Memory {
  constructor(vectorStore) {
    this.vectorStore = vectorStore;
    this.executions = new Map();
  }

  async store(execution) {
    this.executions.set(execution.id, execution);

    // 存储到向量数据库（用于检索）
    const embedding = await this.embeddingProvider.embed(execution.task);
    await this.vectorStore.insert(
      {
        id: execution.id,
        content: execution.task,
        metadata: {
          type: 'agent_execution',
          agentId: execution.agentId,
          status: execution.status,
          result: execution.result,
        },
      },
      embedding
    );
  }

  async retrieve(query, topK) {
    const embedding = await this.embeddingProvider.embed(query);
    const results = await this.vectorStore.search(embedding, topK, {
      filters: { type: 'agent_execution' },
    });

    return results.map(r => this.executions.get(r.chunk.id)).filter(Boolean);
  }

  async getContext(executionId) {
    const execution = this.executions.get(executionId);
    if (!execution) return null;

    return {
      task: execution.task,
      plan: execution.plan,
      steps: execution.steps,
      result: execution.result,
    };
  }
}
```

## 三、Interview Agent 实现

### 3.1 Agent 定义

```javascript
// server/ai/agent/agents/interview-agent.mjs

export const interviewAgent = {
  id: 'interview-agent',
  name: 'Interview Agent',
  description: '面试准备智能助手，分析 JD 并生成面试准备方案',
  type: 'interview',
  tools: ['knowledge.search', 'knowledge.get_document', 'project.search', 'project.get'],
  skills: ['jd-analysis', 'project-match', 'interview-preparation'],
  systemPrompt: `
你是一个专业的面试准备助手。你的职责是：
1. 分析职位描述（JD）
2. 提取技术栈和核心要求
3. 查询用户的知识库和项目经验
4. 匹配最相关的项目
5. 生成面试准备方案

你需要调用相应的工具和技能来完成这些任务。
`,
  config: {
    maxIterations: 10,
    temperature: 0.7,
  },
};
```

### 3.2 执行流程

```
输入：JD 文本
  ↓
Planner 生成计划
  ↓
步骤 1：调用 JD Analysis Skill
  ├─ 输入：JD
  └─ 输出：岗位职责、技术栈、关键词
  ↓
步骤 2：调用 knowledge.search
  ├─ 输入：技术栈关键词
  └─ 输出：相关知识文档
  ↓
步骤 3：调用 project.search
  ├─ 输入：技术栈关键词
  └─ 输出：相关项目
  ↓
步骤 4：调用 Project Match Skill
  ├─ 输入：JD + 项目列表
  └─ 输出：最匹配项目、匹配原因
  ↓
步骤 5：调用 Interview Preparation Skill
  ├─ 输入：JD + 匹配项目
  └─ 输出：面试准备方案
  ↓
生成最终结果
```

## 四、API 设计

### 4.1 Agent 管理

```javascript
// 列出 Agent
GET /api/ai/agents

// 获取 Agent 详情
GET /api/ai/agents/:id

// 创建 Agent
POST /api/ai/agents
{
  "name": "Coding Agent",
  "description": "编程助手",
  "type": "coding",
  "tools": ["knowledge.search", "code.execute"],
  "skills": ["code-review", "bug-fix"],
  "systemPrompt": "..."
}

// 删除 Agent
DELETE /api/ai/agents/:id
```

### 4.2 Agent 执行

```javascript
// 执行 Agent
POST /api/ai/agents/:id/execute
{
  "task": "帮我分析这个 Java 后端岗位，并结合我的项目经验生成面试准备方案。",
  "context": {
    "jd": "JD 文本..."
  }
}

// 获取执行详情
GET /api/ai/executions/:id

// 获取执行步骤
GET /api/ai/executions/:id/steps

// 执行事件流（SSE）
GET /api/ai/executions/:id/events

// 取消执行
DELETE /api/ai/executions/:id
```

## 五、前端设计

### 5.1 Agent 页面

**组件结构：**
```
AgentPage
├─ AgentSelector
├─ TaskInput
├─ ExecutionTimeline
│  ├─ PlanView
│  ├─ StepList
│  │  └─ StepCard
│  │     ├─ ToolCall
│  │     ├─ SkillCall
│  │     └─ Thought
│  └─ ResultPanel
└─ ExecutionHistory
```

**关键功能：**
- Agent 选择
- 任务输入
- 执行时间线
- 步骤详情
- 结果展示

### 5.2 组件实现

```javascript
// src/ai/agent/AgentPage.jsx

export function AgentPage() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [task, setTask] = useState('');
  const [execution, setExecution] = useState(null);
  const [steps, setSteps] = useState([]);

  const executeAgent = async () => {
    const response = await fetch(`/api/ai/agents/${selectedAgent.id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });

    const data = await response.json();
    setExecution(data);

    // 连接 SSE 获取实时步骤
    const eventSource = new EventSource(`/api/ai/executions/${data.id}/events`);
    eventSource.onmessage = (event) => {
      const step = JSON.parse(event.data);
      setSteps(prev => [...prev, step]);
    };
  };

  return (
    <div className="agent-page">
      <AgentSelector selected={selectedAgent} onSelect={setSelectedAgent} />
      <TaskInput value={task} onChange={setTask} onExecute={executeAgent} />
      {execution && (
        <ExecutionTimeline execution={execution} steps={steps} />
      )}
    </div>
  );
}
```

### 5.3 Hooks

```javascript
// src/ai/hooks/useAgentExecution.js

export function useAgentExecution(agentId) {
  const [execution, setExecution] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);

  const execute = async (task) => {
    setLoading(true);
    const response = await fetch(`/api/ai/agents/${agentId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });

    const data = await response.json();
    setExecution(data);

    const eventSource = new EventSource(`/api/ai/executions/${data.id}/events`);
    eventSource.onmessage = (event) => {
      const step = JSON.parse(event.data);
      setSteps(prev => [...prev, step]);
    };

    setLoading(false);
  };

  return { execution, steps, execute, loading };
}
```

## 六、配置

### 6.1 环境变量

```bash
# Agent
AGENT_MAX_ITERATIONS=10
AGENT_TEMPERATURE=0.7
AGENT_TIMEOUT=300000
```

### 6.2 配置文件

```javascript
// config/ai-config.mjs
export const agentConfig = {
  maxIterations: 10,
  temperature: 0.7,
  timeout: 300000,
  memory: {
    enabled: true,
    maxHistory: 100,
  },
};
```

## 七、测试

### 7.1 单元测试

```javascript
// tests/agent/planner.test.mjs
import { describe, it } from 'node:test';
import { LLMPlanner } from '../server/ai/agent/planner.mjs';

describe('LLMPlanner', () => {
  it('should generate plan', async () => {
    const planner = new LLMPlanner(llmProvider, toolRegistry, skillEngine);
    const plan = await planner.plan('test task', {});
    assert.ok(plan.steps.length > 0);
  });
});
```

### 7.2 集成测试

```javascript
// tests/agent/agent-core.test.mjs
import { describe, it } from 'node:test';
import { AgentCore } from '../server/ai/agent/agent-core.mjs';

describe('AgentCore', () => {
  it('should execute task', async () => {
    const agentCore = new AgentCore(config);
    const execution = await agentCore.execute('test task', {});
    assert.strictEqual(execution.status, 'completed');
  });
});
```

## 八、错误处理

### 8.1 错误类型

```javascript
class AgentError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export const AgentErrorCodes = {
  PLANNING_FAILED: 'AGENT_PLANNING_FAILED',
  EXECUTION_FAILED: 'AGENT_EXECUTION_FAILED',
  TOOL_CALL_FAILED: 'AGENT_TOOL_CALL_FAILED',
  SKILL_CALL_FAILED: 'AGENT_SKILL_CALL_FAILED',
  TIMEOUT: 'AGENT_TIMEOUT',
};
```

### 8.2 错误处理

```javascript
try {
  const execution = await agentCore.execute(task, context);
} catch (error) {
  if (error.code === 'AGENT_PLANNING_FAILED') {
    // 处理规划失败
  } else if (error.code === 'AGENT_EXECUTION_FAILED') {
    // 处理执行失败
  }
}
```

## 九、性能优化

### 9.1 并行执行

```javascript
// 并行执行独立步骤
async executeParallelSteps(steps, context) {
  const results = await Promise.all(
    steps.map(step => this.executeStep(step, context))
  );
  return results;
}
```

### 9.2 缓存

```javascript
// 缓存执行结果
class ExecutionCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    this.cache.set(key, value);
  }
}
```

## 十、总结

Agent 模块的核心流程：

1. **规划**：Task → Planner → Plan
2. **执行**：Plan → Executor → Steps
3. **记忆**：Execution → Memory
4. **结果**：Steps → Final Result

关键设计点：
- Planner 使用 LLM 生成计划
- Executor 逐步执行计划
- Memory 存储和检索执行历史
- SSE 实时推送执行步骤