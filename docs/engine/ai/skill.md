# Skill 模块详细设计

## 一、模块概述

Skill 模块负责管理和执行可复用的能力单元，Skill 独立于 Agent，可被多个 Agent 调用。

## 二、核心组件

### 2.1 Skill Definition（技能定义）

**职责：**
- 定义 Skill 的结构和元数据
- 验证 Skill 定义
- 管理 Skill 版本

**接口：**
```typescript
interface Skill {
  id: string
  name: string
  description: string
  category: 'analysis' | 'generation' | 'extraction' | 'comparison'
  instructions: string
  inputSchema: ZodSchema
  outputSchema: ZodSchema
  tools: string[]
  examples: SkillExample[]
  metadata: {
    author: string
    version: string
    tags: string[]
    createdAt: string
    updatedAt: string
  }
}

interface SkillExample {
  input: unknown
  output: unknown
  description: string
}
```

**示例：**
```javascript
// server/ai/skill/skills/jd-analysis.mjs

export const jdAnalysisSkill = {
  id: 'jd-analysis',
  name: 'JD Analysis',
  description: '分析职位描述，提取岗位职责、技术栈、关键词',
  category: 'analysis',
  instructions: `
你是一个专业的 JD 分析助手。你的职责是：
1. 仔细阅读职位描述（JD）
2. 提取岗位职责
3. 提取技术栈
4. 提取关键词
5. 分析核心要求
6. 识别优先级
7. 输出面试重点

输出格式：
{
  "responsibilities": ["职责1", "职责2"],
  "techStack": ["技术1", "技术2"],
  "keywords": ["关键词1", "关键词2"],
  "coreRequirements": ["要求1", "要求2"],
  "priorities": {
    "mustHave": ["必须1"],
    "niceToHave": ["加分项1"]
  },
  "interviewFocus": ["面试重点1", "面试重点2"]
}
`,
  inputSchema: z.object({
    jd: z.string().describe('职位描述文本'),
  }),
  outputSchema: z.object({
    responsibilities: z.array(z.string()),
    techStack: z.array(z.string()),
    keywords: z.array(z.string()),
    coreRequirements: z.array(z.string()),
    priorities: z.object({
      mustHave: z.array(z.string()),
      niceToHave: z.array(z.string()),
    }),
    interviewFocus: z.array(z.string()),
  }),
  tools: [],
  examples: [
    {
      input: { jd: 'Java 后端开发工程师...' },
      output: {
        responsibilities: ['负责后端开发'],
        techStack: ['Java', 'Spring Boot'],
        keywords: ['微服务', '分布式'],
        coreRequirements: ['3 年以上经验'],
        priorities: {
          mustHave: ['Java', 'Spring'],
          niceToHave: ['Kubernetes'],
        },
        interviewFocus: ['微服务架构', '并发编程'],
      },
      description: '分析 Java 后端 JD',
    },
  ],
  metadata: {
    author: 'beu',
    version: '1.0.0',
    tags: ['interview', 'analysis', 'jd'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
};
```

### 2.2 Skill Engine（技能引擎）

**职责：**
- 执行 Skill
- 验证输入输出
- 调用依赖工具
- 管理 Skill 生命周期

**接口：**
```typescript
interface SkillEngine {
  execute(skillId: string, input: unknown): Promise<SkillExecution>
  getSkill(skillId: string): Promise<Skill>
  listSkills(filters?: SkillFilters): Promise<Skill[]>
  registerSkill(skill: Skill): void
}

interface SkillExecution {
  id: string
  skillId: string
  input: unknown
  output: unknown
  status: 'pending' | 'running' | 'completed' | 'failed'
  error?: string
  toolCalls: ToolCall[]
  executionTime: number
  createdAt: string
  completedAt?: string
}
```

**实现：**
```javascript
// server/ai/skill/skill-core.mjs

export class SkillEngine {
  constructor(llmProvider, toolRegistry) {
    this.llmProvider = llmProvider;
    this.toolRegistry = toolRegistry;
    this.skills = new Map();
  }

  registerSkill(skill) {
    this.skills.set(skill.id, skill);
  }

  async getSkill(skillId) {
    return this.skills.get(skillId);
  }

  async listSkills(filters = {}) {
    let skills = Array.from(this.skills.values());

    if (filters.category) {
      skills = skills.filter(s => s.category === filters.category);
    }

    if (filters.tags) {
      skills = skills.filter(s =>
        filters.tags.some(tag => s.metadata.tags.includes(tag))
      );
    }

    return skills;
  }

  async execute(skillId, input) {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    const executionId = crypto.randomUUID();
    const startTime = Date.now();

    const execution = {
      id: executionId,
      skillId,
      input,
      output: null,
      status: 'running',
      toolCalls: [],
      executionTime: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. 验证输入
      const validatedInput = skill.inputSchema.parse(input);

      // 2. 构建提示词
      const prompt = this.buildPrompt(skill, validatedInput);

      // 3. 调用 LLM
      const response = await this.llmProvider.chat([
        { role: 'system', content: skill.instructions },
        { role: 'user', content: prompt },
      ]);

      // 4. 解析输出
      const output = JSON.parse(response.content);
      const validatedOutput = skill.outputSchema.parse(output);

      execution.output = validatedOutput;
      execution.status = 'completed';
    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
    }

    execution.executionTime = Date.now() - startTime;
    execution.completedAt = new Date().toISOString();

    return execution;
  }

  buildPrompt(skill, input) {
    return `
输入：
${JSON.stringify(input, null, 2)}

请按照 instructions 的要求处理输入，并输出 JSON 格式的结果。
`;
  }
}
```

### 2.3 Skill Registry（技能注册表）

**职责：**
- 自动注册 Skill
- 管理 Skill 依赖
- 提供 Skill 发现

**实现：**
```javascript
// server/ai/skill/skill-registry.mjs

export class SkillRegistry {
  constructor(skillEngine) {
    this.skillEngine = skillEngine;
  }

  async registerFromDirectory(directory) {
    const files = await fs.readdir(directory);
    for (const file of files) {
      if (file.endsWith('.mjs')) {
        const module = await import(path.join(directory, file));
        const skill = module.default || Object.values(module)[0];
        if (skill) {
          this.skillEngine.registerSkill(skill);
        }
      }
    }
  }

  async registerBuiltInSkills() {
    const skillsDirectory = path.join(__dirname, 'skills');
    await this.registerFromDirectory(skillsDirectory);
  }
}
```

## 三、第一阶段 Skill 实现

### 3.1 JD Analysis Skill

**功能：** 分析职位描述，提取关键信息

**输入：**
```javascript
{
  jd: "Java 后端开发工程师\n\n岗位职责：\n1. 负责后端服务开发\n2. 参与系统设计\n\n任职要求：\n1. 3 年以上 Java 开发经验\n2. 熟悉 Spring Boot\n3. 了解微服务架构"
}
```

**输出：**
```javascript
{
  responsibilities: [
    "负责后端服务开发",
    "参与系统设计"
  ],
  techStack: [
    "Java",
    "Spring Boot",
    "微服务架构"
  ],
  keywords: [
    "后端开发",
    "系统设计",
    "微服务"
  ],
  coreRequirements: [
    "3 年以上 Java 开发经验",
    "熟悉 Spring Boot",
    "了解微服务架构"
  ],
  priorities: {
    mustHave: [
      "Java",
      "Spring Boot"
    ],
    niceToHave: [
      "微服务架构"
    ]
  },
  interviewFocus: [
    "微服务架构设计",
    "Spring Boot 使用经验",
    "后端开发经验"
  ]
}
```

### 3.2 Project Match Skill

**功能：** 根据 JD 匹配最相关的项目

**输入：**
```javascript
{
  jd: "Java 后端开发工程师...",
  techStack: ["Java", "Spring Boot", "微服务"],
  projects: [
    {
      id: "project-1",
      name: "消防物联网平台",
      techStack: ["Java", "Spring Boot", "MyBatis"],
      description: "..."
    },
    {
      id: "project-2",
      name: "无人机实战平台",
      techStack: ["Java", "Spring Cloud", "Kubernetes"],
      description: "..."
    }
  ]
}
```

**输出：**
```javascript
{
  matchedProjects: [
    {
      projectId: "project-1",
      projectName: "消防物联网平台",
      matchScore: 0.9,
      matchReason: "技术栈完全匹配，包含 Java 和 Spring Boot",
      relevantTech: ["Java", "Spring Boot", "MyBatis"],
      interviewPoints: [
        "Spring Boot 在项目中的应用",
        "MyBatis 的使用经验"
      ]
    },
    {
      projectId: "project-2",
      projectName: "无人机实战平台",
      matchScore: 0.8,
      matchReason: "技术栈部分匹配，包含 Java 和微服务",
      relevantTech: ["Java", "Spring Cloud", "Kubernetes"],
      interviewPoints: [
        "微服务架构设计",
        "Kubernetes 部署经验"
      ]
    }
  ],
  recommendedProjects: ["project-1", "project-2"],
  summary: "共有 2 个项目匹配，最匹配的是消防物联网平台"
}
```

### 3.3 Interview Preparation Skill

**功能：** 生成面试准备方案

**输入：**
```javascript
{
  jd: "Java 后端开发工程师...",
  matchedProjects: [
    {
      projectId: "project-1",
      projectName: "消防物联网平台",
      techStack: ["Java", "Spring Boot"],
      interviewPoints: ["Spring Boot 在项目中的应用"]
    }
  ],
  techStack: ["Java", "Spring Boot", "微服务"]
}
```

**输出：**
```javascript
{
  technicalQuestions: [
    {
      question: "Spring Boot 的自动装配原理是什么？",
      category: "framework",
      difficulty: "medium",
      suggestedAnswer: "Spring Boot 通过 @EnableAutoConfiguration 注解...",
      relatedProject: "消防物联网平台"
    },
    {
      question: "微服务架构中如何处理分布式事务？",
      category: "architecture",
      difficulty: "hard",
      suggestedAnswer: "可以使用 Saga 模式、TCC、本地消息表...",
      relatedProject: "无人机实战平台"
    }
  ],
  projectQuestions: [
    {
      question: "在消防物联网平台中，你是如何设计消息队列的？",
      project: "消防物联网平台",
      focus: "系统设计",
      suggestedAnswer: "我使用了 RabbitMQ 作为消息队列...",
      followUp: [
        "消息丢失如何处理？",
        "消息重复消费如何处理？"
      ]
    }
  ],
  architectureQuestions: [
    {
      question: "如果让你设计一个高并发的订单系统，你会怎么设计？",
      focus: "系统设计",
      suggestedAnswer: "我会从以下方面考虑：分库分表、缓存、异步处理..."
    }
  ],
  aiQuestions: [
    {
      question: "你如何看待 AI 在后端开发中的应用？",
      focus: "AI 能力",
      suggestedAnswer: "AI 可以用于代码生成、自动化测试、性能优化..."
    }
  ],
  recommendedPreparation: [
    "复习 Spring Boot 核心原理",
    "准备消防物联网项目的详细技术细节",
    "了解微服务架构的最佳实践",
    "准备分布式系统的设计案例"
  ]
}
```

### 3.4 Project Deep Dive Skill

**功能：** 深入分析项目，生成面试素材

**输入：**
```javascript
{
  projectName: "消防物联网平台"
}
```

**输出：**
```javascript
{
  projectBackground: "消防物联网平台是一个面向消防行业的物联网监控平台...",
  projectGoals: [
    "实时监控消防设备状态",
    "预警火灾风险",
    "数据分析和可视化"
  ],
  systemArchitecture: {
    layers: [
      "设备层：传感器、网关",
      "接入层：MQTT 服务",
      "业务层：微服务",
      "数据层：MySQL、Redis"
    ],
    diagram: "..."
  },
  myResponsibilities: [
    "负责后端服务开发",
    "设计消息队列架构",
    "优化数据库性能"
  ],
  techStack: {
    backend: ["Java", "Spring Boot", "MyBatis"],
    middleware: ["RabbitMQ", "Redis"],
    database: ["MySQL", "MongoDB"],
    deployment: ["Docker", "Kubernetes"]
  },
  technicalChallenges: [
    {
      challenge: "高并发设备接入",
      solution: "使用 MQTT 集群 + 消息队列削峰",
      result: "支持 10 万设备同时在线"
    },
    {
      challenge: "实时数据处理",
      solution: "使用 Redis 缓存 + 流式计算",
      result: "数据处理延迟 < 100ms"
    }
  ],
  technologyChoices: [
    {
      decision: "选择 RabbitMQ 而非 Kafka",
      reason: "业务场景适合消息队列而非流处理",
      tradeOff: "牺牲了一定的吞吐量，获得了更好的可靠性"
    }
  ],
  projectResults: [
    "部署 50 个消防站点",
    "监控 10 万设备",
    "预警准确率 95%"
  ],
  interviewFollowUp: [
    "如果设备数量翻倍，系统如何扩展？",
    "消息队列宕机如何处理？",
    "如何保证数据一致性？"
  ],
  naturalLanguageAnswer: "这是一个面向消防行业的物联网监控平台..."
}
```

## 四、API 设计

### 4.1 Skill 管理

```javascript
// 列出 Skill
GET /api/ai/skills?category=analysis&tags=interview

// 获取 Skill 详情
GET /api/ai/skills/:id

// 创建 Skill
POST /api/ai/skills
{
  "name": "Code Review",
  "description": "代码审查技能",
  "category": "analysis",
  "instructions": "...",
  "inputSchema": {...},
  "outputSchema": {...},
  "tools": ["code.execute"],
  "examples": [...]
}

// 删除 Skill
DELETE /api/ai/skills/:id
```

### 4.2 Skill 执行

```javascript
// 执行 Skill
POST /api/ai/skills/:id/execute
{
  "input": {
    "jd": "Java 后端开发工程师..."
  }
}

// 获取执行详情
GET /api/ai/skill-executions/:id

// 获取执行历史
GET /api/ai/skills/:id/executions
```

## 五、前端设计

### 5.1 Skill 页面

**组件结构：**
```
SkillsPage
├─ SkillList
│  └─ SkillCard
│     ├─ SkillInfo
│     ├─ SkillCategory
│     └─ SkillTags
├─ SkillDetail
│  ├─ SkillDescription
│  ├─ SkillInput
│  ├─ SkillOutput
│  └─ SkillExamples
└─ SkillExecutor
   ├─ InputForm
   ├─ ExecutionStatus
   └─ OutputDisplay
```

**关键功能：**
- Skill 列表
- Skill 详情
- Skill 执行
- 示例展示

### 5.2 组件实现

```javascript
// src/ai/skill/SkillPage.jsx

export function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [execution, setExecution] = useState(null);

  useEffect(() => {
    fetch('/api/ai/skills')
      .then(res => res.json())
      .then(data => setSkills(data));
  }, []);

  const executeSkill = async (skillId, input) => {
    const response = await fetch(`/api/ai/skills/${skillId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    const data = await response.json();
    setExecution(data);
  };

  return (
    <div className="skills-page">
      <SkillList skills={skills} onSelect={setSelectedSkill} />
      {selectedSkill && (
        <SkillDetail skill={selectedSkill} onExecute={executeSkill} />
      )}
      {execution && <ExecutionResult execution={execution} />}
    </div>
  );
}
```

### 5.3 Hooks

```javascript
// src/ai/hooks/useSkillExecution.js

export function useSkillExecution(skillId) {
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = async (input) => {
    setLoading(true);
    const response = await fetch(`/api/ai/skills/${skillId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    const data = await response.json();
    setExecution(data);
    setLoading(false);
  };

  return { execution, execute, loading };
}
```

## 六、配置

### 6.1 环境变量

```bash
# Skill
SKILL_TIMEOUT=60000
SKILL_MAX_EXECUTIONS=100
```

### 6.2 配置文件

```javascript
// config/ai-config.mjs
export const skillConfig = {
  timeout: 60000,
  maxExecutions: 100,
  cache: {
    enabled: true,
    ttl: 3600000,
  },
};
```

## 七、测试

### 7.1 单元测试

```javascript
// tests/skill/skill-core.test.mjs
import { describe, it } from 'node:test';
import { SkillEngine } from '../server/ai/skill/skill-core.mjs';

describe('SkillEngine', () => {
  it('should execute skill', async () => {
    const skillEngine = new SkillEngine(llmProvider, toolRegistry);
    skillEngine.registerSkill(jdAnalysisSkill);
    const execution = await skillEngine.execute('jd-analysis', { jd: 'test' });
    assert.strictEqual(execution.status, 'completed');
  });
});
```

### 7.2 Skill 测试

```javascript
// tests/skill/jd-analysis.test.mjs
import { describe, it } from 'node:test';
import { jdAnalysisSkill } from '../server/ai/skill/skills/jd-analysis.mjs';

describe('JD Analysis Skill', () => {
  it('should analyze JD correctly', async () => {
    const result = await skillEngine.execute('jd-analysis', {
      jd: 'Java 后端开发工程师...'
    });
    assert.ok(result.output.techStack.includes('Java'));
  });
});
```

## 八、错误处理

### 8.1 错误类型

```javascript
class SkillError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export const SkillErrorCodes = {
  SKILL_NOT_FOUND: 'SKILL_NOT_FOUND',
  INPUT_VALIDATION_FAILED: 'SKILL_INPUT_VALIDATION_FAILED',
  OUTPUT_VALIDATION_FAILED: 'SKILL_OUTPUT_VALIDATION_FAILED',
  EXECUTION_FAILED: 'SKILL_EXECUTION_FAILED',
  TIMEOUT: 'SKILL_TIMEOUT',
};
```

### 8.2 错误处理

```javascript
try {
  const execution = await skillEngine.execute(skillId, input);
} catch (error) {
  if (error.code === 'SKILL_INPUT_VALIDATION_FAILED') {
    // 处理输入验证失败
  } else if (error.code === 'SKILL_EXECUTION_FAILED') {
    // 处理执行失败
  }
}
```

## 九、性能优化

### 9.1 缓存

```javascript
// Skill 执行结果缓存
class SkillExecutionCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 3600000; // 1 小时
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value) {
    this.cache.set(key, { value, timestamp: Date.now() });
  }
}
```

### 9.2 批量执行

```javascript
// 批量执行 Skill
async executeBatch(skillId, inputs) {
  const results = await Promise.all(
    inputs.map(input => this.execute(skillId, input))
  );
  return results;
}
```

## 十、总结

Skill 模块的核心流程：

1. **定义**：Skill Definition
2. **注册**：Skill Registry
3. **执行**：Skill Engine
4. **验证**：Input/Output Schema

关键设计点：
- Skill 独立于 Agent
- 使用 Zod 进行输入输出验证
- 支持示例和文档
- 可缓存执行结果