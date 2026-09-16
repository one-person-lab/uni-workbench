# AI Demo 详细设计

## 一、模块概述

AI Demo 模块提供三个核心演示场景，用于面试时展示 BeU Workbench 的 AI 能力。

## 二、Demo 场景

### 2.1 Demo 1：RAG（AI 问答助手）

**演示目标：** 展示 RAG 系统能够从知识库中检索相关文档并生成准确答案。

**演示流程：**
```
1. 打开 AI Demo 页面
2. 选择 Demo 1：RAG
3. 输入问题："无人机项目为什么需要视频转码？"
4. 系统检索相关文档
5. 展示检索结果
6. 生成答案
7. 展示来源引用
8. 展示检索过程
```

**预期输出：**
```javascript
{
  answer: "因为项目现场设备输出的是 RTSP，而浏览器无法直接播放 RTSP，因此需要通过转码服务转换为浏览器支持的流媒体格式。",
  sources: [
    {
      chunkId: "chunk-1",
      documentId: "doc-1",
      title: "无人机平台技术方案",
      path: "wiki/projects/drone-platform.md",
      score: 0.95
    },
    {
      chunkId: "chunk-2",
      documentId: "doc-2",
      title: "视频流接入方案",
      path: "wiki/technical/video-streaming.md",
      score: 0.87
    }
  ],
  retrieval: {
    query: "无人机项目为什么需要视频转码？",
    queryEmbedding: [0.1, 0.2, ...],
    results: [...],
    retrievalTime: 150
  }
}
```

**前端展示：**
```
┌─────────────────────────────────────────┐
│ AI Demo - RAG                           │
├─────────────────────────────────────────┤
│ 问题：无人机项目为什么需要视频转码？     │
├─────────────────────────────────────────┤
│ 答案：                                  │
│ 因为项目现场设备输出的是 RTSP，而浏览器   │
│ 无法直接播放 RTSP，因此需要通过转码服务   │
│ 转换为浏览器支持的流媒体格式。           │
├─────────────────────────────────────────┤
│ 来源：                                  │
│ 1. 无人机平台技术方案 (score: 0.95)     │
│ 2. 视频流接入方案 (score: 0.87)         │
├─────────────────────────────────────────┤
│ 检索过程：                              │
│ Query → Embedding (50ms)                │
│ → Vector Search (80ms)                  │
│ → Top K Chunks (5)                      │
│ → Context Building (20ms)               │
│ → LLM Generation (500ms)                │
│ → Total: 650ms                         │
└─────────────────────────────────────────┘
```

### 2.2 Demo 2：Interview Agent（AI 智能助手）

**演示目标：** 展示 Agent 能够分析 JD、查询知识库、匹配项目、调用 Skill 并生成面试准备方案。

**演示流程：**
```
1. 打开 AI Demo 页面
2. 选择 Demo 2：Interview Agent
3. 粘贴 JD 文本
4. 点击执行
5. 展示 Plan
6. 逐步展示 Tool Call
7. 展示 Knowledge Retrieval
8. 展示 Skill 调用
9. 生成最终结果
```

**输入：**
```javascript
{
  jd: `
职位：Java 后端开发工程师

岗位职责：
1. 负责后端服务开发
2. 参与系统设计
3. 优化系统性能

任职要求：
1. 3 年以上 Java 开发经验
2. 熟悉 Spring Boot、Spring Cloud
3. 了解微服务架构
4. 熟悉 MySQL、Redis
5. 有高并发系统经验优先
`
}
```

**预期输出：**
```javascript
{
  plan: {
    reasoning: "需要分析 JD、查询知识库、匹配项目、调用 Skill",
    steps: [
      {
        stepNumber: 1,
        type: "skill_call",
        description: "调用 JD Analysis Skill 分析 JD",
        skillName: "jd-analysis"
      },
      {
        stepNumber: 2,
        type: "tool_call",
        description: "调用 knowledge.search 查询相关知识",
        toolName: "knowledge.search"
      },
      {
        stepNumber: 3,
        type: "tool_call",
        description: "调用 project.search 查询相关项目",
        toolName: "project.search"
      },
      {
        stepNumber: 4,
        type: "skill_call",
        description: "调用 Project Match Skill 匹配项目",
        skillName: "project-match"
      },
      {
        stepNumber: 5,
        type: "skill_call",
        description: "调用 Interview Preparation Skill 生成面试方案",
        skillName: "interview-preparation"
      }
    ]
  },
  steps: [
    {
      stepNumber: 1,
      type: "skill_call",
      skillCall: {
        skillName: "jd-analysis",
        input: { jd: "..." },
        output: {
          responsibilities: ["负责后端服务开发"],
          techStack: ["Java", "Spring Boot", "Spring Cloud", "MySQL", "Redis"],
          keywords: ["微服务", "高并发"],
          coreRequirements: ["3 年以上 Java 开发经验"],
          priorities: {
            mustHave: ["Java", "Spring Boot"],
            niceToHave: ["Spring Cloud", "高并发"]
          },
          interviewFocus: ["微服务架构", "高并发处理"]
        }
      },
      status: "completed"
    },
    {
      stepNumber: 2,
      type: "tool_call",
      toolCall: {
        toolName: "knowledge.search",
        input: { query: "微服务架构 高并发" },
        output: {
          results: [
            {
              id: "doc-1",
              title: "微服务架构设计",
              path: "wiki/architecture/microservices.md",
              score: 0.92
            }
          ]
        }
      },
      status: "completed"
    },
    {
      stepNumber: 3,
      type: "tool_call",
      toolCall: {
        toolName: "project.search",
        input: { query: "Java Spring Boot 微服务" },
        output: {
          results: [
            {
              id: "project-1",
              name: "消防物联网平台",
              techStack: ["Java", "Spring Boot", "MyBatis"],
              matchScore: 0.9
            },
            {
              id: "project-2",
              name: "无人机实战平台",
              techStack: ["Java", "Spring Cloud", "Kubernetes"],
              matchScore: 0.85
            }
          ]
        }
      },
      status: "completed"
    },
    {
      stepNumber: 4,
      type: "skill_call",
      skillCall: {
        skillName: "project-match",
        input: {
          jd: "...",
          techStack: ["Java", "Spring Boot"],
          projects: [...]
        },
        output: {
          matchedProjects: [
            {
              projectId: "project-1",
              projectName: "消防物联网平台",
              matchScore: 0.9,
              matchReason: "技术栈完全匹配",
              interviewPoints: ["Spring Boot 使用经验"]
            }
          ]
        }
      },
      status: "completed"
    },
    {
      stepNumber: 5,
      type: "skill_call",
      skillCall: {
        skillName: "interview-preparation",
        input: {
          jd: "...",
          matchedProjects: [...],
          techStack: [...]
        },
        output: {
          technicalQuestions: [
            {
              question: "Spring Boot 的自动装配原理是什么？",
              category: "framework",
              difficulty: "medium",
              suggestedAnswer: "Spring Boot 通过 @EnableAutoConfiguration 注解...",
              relatedProject: "消防物联网平台"
            }
          ],
          projectQuestions: [
            {
              question: "在消防物联网平台中，你是如何设计消息队列的？",
              project: "消防物联网平台",
              focus: "系统设计",
              suggestedAnswer: "我使用了 RabbitMQ...",
              followUp: ["消息丢失如何处理？"]
            }
          ],
          recommendedPreparation: [
            "复习 Spring Boot 核心原理",
            "准备消防物联网项目的详细技术细节"
          ]
        }
      },
      status: "completed"
    }
  ],
  result: {
    summary: "根据 JD 分析，最匹配的项目是消防物联网平台。建议重点准备 Spring Boot 核心原理、微服务架构设计、以及消防物联网项目的详细技术细节。",
    matchScore: 0.9,
    recommendedProjects: ["消防物联网平台"]
  }
}
```

**前端展示：**
```
┌─────────────────────────────────────────┐
│ AI Demo - Interview Agent              │
├─────────────────────────────────────────┤
│ Plan:                                  │
│ 1. 调用 JD Analysis Skill 分析 JD      │
│ 2. 调用 knowledge.search 查询相关知识  │
│ 3. 调用 project.search 查询相关项目    │
│ 4. 调用 Project Match Skill 匹配项目  │
│ 5. 调用 Interview Preparation Skill    │
├─────────────────────────────────────────┤
│ Step 1: ✓ JD Analysis Skill             │
│ 输出：                                  │
│ - 技术栈: Java, Spring Boot, ...        │
│ - 核心要求: 3 年以上 Java 开发经验      │
│ - 面试重点: 微服务架构, 高并发处理     │
├─────────────────────────────────────────┤
│ Step 2: ✓ knowledge.search             │
│ 输出：                                  │
│ - 微服务架构设计 (score: 0.92)          │
├─────────────────────────────────────────┤
│ Step 3: ✓ project.search               │
│ 输出：                                  │
│ - 消防物联网平台 (score: 0.9)           │
│ - 无人机实战平台 (score: 0.85)          │
├─────────────────────────────────────────┤
│ Step 4: ✓ Project Match Skill          │
│ 输出：                                  │
│ - 最匹配: 消防物联网平台                │
│ - 匹配原因: 技术栈完全匹配              │
├─────────────────────────────────────────┤
│ Step 5: ✓ Interview Preparation Skill   │
│ 输出：                                  │
│ - 技术面试题: Spring Boot 自动装配...   │
│ - 项目面试题: 消防物联网平台消息队列...  │
├─────────────────────────────────────────┤
│ 最终结果：                              │
│ 根据 JD 分析，最匹配的项目是消防物联网  │
│ 平台。建议重点准备 Spring Boot 核心原   │
│ 理、微服务架构设计、以及消防物联网项目  │
│ 的详细技术细节。                        │
└─────────────────────────────────────────┘
```

### 2.3 Demo 3：Project Deep Dive Skill

**演示目标：** 展示 Skill 能够深入分析项目并生成完整的面试素材。

**演示流程：**
```
1. 打开 AI Demo 页面
2. 选择 Demo 3：Project Deep Dive
3. 输入项目名称："消防物联网平台"
4. 点击执行
5. 展示 Skill 执行过程
6. 生成项目分析结果
```

**输入：**
```javascript
{
  projectName: "消防物联网平台"
}
```

**预期输出：**
```javascript
{
  projectBackground: "消防物联网平台是一个面向消防行业的物联网监控平台，旨在通过物联网技术实现对消防设备的实时监控和预警。",
  projectGoals: [
    "实时监控消防设备状态",
    "预警火灾风险",
    "数据分析和可视化",
    "提高应急响应效率"
  ],
  systemArchitecture: {
    layers: [
      {
        name: "设备层",
        components: ["传感器", "网关", "边缘计算设备"],
        description: "负责数据采集和初步处理"
      },
      {
        name: "接入层",
        components: ["MQTT 服务", "HTTP API"],
        description: "负责设备接入和数据传输"
      },
      {
        name: "业务层",
        components: ["微服务集群", "消息队列", "缓存"],
        description: "负责业务逻辑处理"
      },
      {
        name: "数据层",
        components: ["MySQL", "Redis", "MongoDB"],
        description: "负责数据存储和查询"
      }
    ],
    diagram: "设备层 → 接入层 → 业务层 → 数据层"
  },
  myResponsibilities: [
    "负责后端服务开发",
    "设计消息队列架构",
    "优化数据库性能",
    "实现设备监控功能"
  ],
  techStack: {
    backend: ["Java", "Spring Boot", "MyBatis"],
    middleware: ["RabbitMQ", "Redis", "Kafka"],
    database: ["MySQL", "MongoDB", "InfluxDB"],
    deployment: ["Docker", "Kubernetes", "Jenkins"]
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
    },
    {
      challenge: "设备离线检测",
      solution: "心跳机制 + 超时检测",
      result: "离线检测准确率 99%"
    }
  ],
  technologyChoices: [
    {
      decision: "选择 RabbitMQ 而非 Kafka",
      reason: "业务场景适合消息队列而非流处理",
      tradeOff: "牺牲了一定的吞吐量，获得了更好的可靠性"
    },
    {
      decision: "选择 MySQL 而非 PostgreSQL",
      reason: "团队更熟悉 MySQL 生态",
      tradeOff: "牺牲了一些高级特性，获得了更好的开发效率"
    }
  ],
  projectResults: [
    "部署 50 个消防站点",
    "监控 10 万设备",
    "预警准确率 95%",
    "应急响应时间缩短 50%"
  ],
  interviewFollowUp: [
    "如果设备数量翻倍，系统如何扩展？",
    "消息队列宕机如何处理？",
    "如何保证数据一致性？",
    "为什么选择 RabbitMQ 而非 Kafka？"
  ],
  naturalLanguageAnswer: "这是一个面向消防行业的物联网监控平台。我在项目中负责后端服务开发，包括设备接入、数据处理、业务逻辑等模块。系统采用微服务架构，使用 MQTT 协议接入设备，通过消息队列削峰填谷，使用 Redis 缓存提高性能。项目支持 10 万设备同时在线，预警准确率达到 95%。"
}
```

**前端展示：**
```
┌─────────────────────────────────────────┐
│ AI Demo - Project Deep Dive            │
├─────────────────────────────────────────┤
│ 项目背景：                              │
│ 消防物联网平台是一个面向消防行业的物联网 │
│ 监控平台，旨在通过物联网技术实现对消防 │
│ 设备的实时监控和预警。                   │
├─────────────────────────────────────────┤
│ 项目目标：                              │
│ • 实时监控消防设备状态                  │
│ • 预警火灾风险                          │
│ • 数据分析和可视化                      │
│ • 提高应急响应效率                      │
├─────────────────────────────────────────┤
│ 系统架构：                              │
│ 设备层 (传感器、网关)                    │
│   ↓                                     │
│ 接入层 (MQTT 服务)                      │
│   ↓                                     │
│ 业务层 (微服务集群、消息队列)             │
│   ↓                                     │
│ 数据层 (MySQL、Redis)                    │
├─────────────────────────────────────────┤
│ 我的职责：                              │
│ • 负责后端服务开发                      │
│ • 设计消息队列架构                      │
│ • 优化数据库性能                        │
│ • 实现设备监控功能                      │
├─────────────────────────────────────────┤
│ 技术栈：                                │
│ 后端: Java, Spring Boot, MyBatis        │
│ 中间件: RabbitMQ, Redis, Kafka          │
│ 数据库: MySQL, MongoDB, InfluxDB        │
│ 部署: Docker, Kubernetes, Jenkins       │
├─────────────────────────────────────────┤
│ 技术挑战：                              │
│ 1. 高并发设备接入                       │
│    解决: MQTT 集群 + 消息队列削峰       │
│    结果: 支持 10 万设备同时在线          │
│                                         │
│ 2. 实时数据处理                         │
│    解决: Redis 缓存 + 流式计算           │
│    结果: 数据处理延迟 < 100ms            │
├─────────────────────────────────────────┤
│ 技术选型：                              │
• 选择 RabbitMQ 而非 Kafka                 │
  理由: 业务场景适合消息队列而非流处理     │
  权衡: 牺牲了吞吐量，获得了可靠性          │
├─────────────────────────────────────────┤
│ 项目成果：                              │
│ • 部署 50 个消防站点                    │
│ • 监控 10 万设备                        │
│ • 预警准确率 95%                        │
│ • 应急响应时间缩短 50%                   │
├─────────────────────────────────────────┤
│ 面试追问：                              │
│ • 如果设备数量翻倍，系统如何扩展？       │
│ • 消息队列宕机如何处理？                 │
│ • 如何保证数据一致性？                   │
├─────────────────────────────────────────┤
│ 自然语言回答：                          │
│ 这是一个面向消防行业的物联网监控平台...    │
└─────────────────────────────────────────┘
```

## 三、前端设计

### 3.1 AI Demo 页面

**组件结构：**
```
AIDemoPage
├─ DemoSelector
│  ├─ Demo1Card (RAG)
│  ├─ Demo2Card (Interview Agent)
│  └─ Demo3Card (Project Deep Dive)
├─ Demo1View
│  ├─ QueryInput
│  ├─ AnswerDisplay
│  ├─ SourceList
│  └─ RetrievalDebug
├─ Demo2View
│  ├─ JDInput
│  ├─ PlanView
│  ├─ ExecutionTimeline
│  └─ ResultPanel
└─ Demo3View
   ├─ ProjectInput
   ├─ SkillExecution
   └─ ProjectAnalysis
```

**关键功能：**
- Demo 选择
- 输入表单
- 执行状态
- 结果展示
- 过程可视化

### 3.2 组件实现

```javascript
// src/ai/demo/AIDemoPage.jsx

export function AIDemoPage() {
  const [selectedDemo, setSelectedDemo] = useState(null);

  return (
    <div className="ai-demo-page">
      <DemoSelector onSelect={setSelectedDemo} />
      {selectedDemo === 'rag' && <Demo1View />}
      {selectedDemo === 'agent' && <Demo2View />}
      {selectedDemo === 'skill' && <Demo3View />}
    </div>
  );
}
```

### 3.3 Demo 1 实现

```javascript
// src/ai/demo/Demo1View.jsx

export function Demo1View() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    setLoading(true);
    const response = await fetch('/api/ai/demo/rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="demo-1-view">
      <h2>Demo 1: RAG（AI 问答助手）</h2>
      <QueryInput value={query} onChange={setQuery} onExecute={execute} />
      {loading && <LoadingSpinner />}
      {result && (
        <>
          <AnswerDisplay answer={result.answer} />
          <SourceList sources={result.sources} />
          <RetrievalDebug retrieval={result.retrieval} />
        </>
      )}
    </div>
  );
}
```

### 3.4 Demo 2 实现

```javascript
// src/ai/demo/Demo2View.jsx

export function Demo2View() {
  const [jd, setJD] = useState('');
  const [execution, setExecution] = useState(null);
  const [steps, setSteps] = useState([]);

  const execute = async () => {
    const response = await fetch('/api/ai/demo/interview-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jd }),
    });
    const data = await response.json();
    setExecution(data);

    const eventSource = new EventSource(`/api/ai/executions/${data.id}/events`);
    eventSource.onmessage = (event) => {
      const step = JSON.parse(event.data);
      setSteps(prev => [...prev, step]);
    };
  };

  return (
    <div className="demo-2-view">
      <h2>Demo 2: Interview Agent（AI 智能助手）</h2>
      <JDInput value={jd} onChange={setJD} onExecute={execute} />
      {execution && (
        <>
          <PlanView plan={execution.plan} />
          <ExecutionTimeline steps={steps} />
          <ResultPanel result={execution.result} />
        </>
      )}
    </div>
  );
}
```

### 3.5 Demo 3 实现

```javascript
// src/ai/demo/Demo3View.jsx

export function Demo3View() {
  const [projectName, setProjectName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    setLoading(true);
    const response = await fetch('/api/ai/demo/project-deep-dive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName }),
    });
    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="demo-3-view">
      <h2>Demo 3: Project Deep Dive Skill</h2>
      <ProjectInput value={projectName} onChange={setProjectName} onExecute={execute} />
      {loading && <LoadingSpinner />}
      {result && <ProjectAnalysis result={result} />}
    </div>
  );
}
```

## 四、API 设计

### 4.1 Demo API

```javascript
// Demo 1: RAG
POST /api/ai/demo/rag
{
  "query": "无人机项目为什么需要视频转码？"
}

// Demo 2: Interview Agent
POST /api/ai/demo/interview-agent
{
  "jd": "Java 后端开发工程师..."
}

// Demo 3: Project Deep Dive
POST /api/ai/demo/project-deep-dive
{
  "projectName": "消防物联网平台"
}
```

### 4.2 Demo 实现

```javascript
// server/ai/demo/demo-api.mjs

export class DemoAPI {
  constructor(ragService, agentCore, skillEngine) {
    this.ragService = ragService;
    this.agentCore = agentCore;
    this.skillEngine = skillEngine;
  }

  async executeRAGDemo(query) {
    // 使用默认知识库
    const result = await this.ragService.chat('demo-conversation', query);
    return result;
  }

  async executeInterviewAgentDemo(jd) {
    const execution = await this.agentCore.execute(
      '帮我分析这个 JD 并生成面试准备方案',
      { jd, agentId: 'interview-agent' }
    );
    return execution;
  }

  async executeProjectDeepDiveDemo(projectName) {
    const execution = await this.skillEngine.execute('project-deep-dive', {
      projectName,
    });
    return execution;
  }
}
```

## 五、演示数据准备

### 5.1 RAG 演示数据

需要在知识库中添加以下文档：

**无人机平台技术方案.md**
```markdown
# 无人机平台技术方案

## 视频转码

项目现场设备输出的是 RTSP 流，而浏览器无法直接播放 RTSP。因此需要通过转码服务将 RTSP 转换为 HLS 或 DASH 格式，以便在浏览器中播放。

转码服务使用 FFmpeg 实现，支持实时转码和自适应码率。
```

**视频流接入方案.md**
```markdown
# 视频流接入方案

## RTSP 转 HLS

RTSP (Real Time Streaming Protocol) 是实时流传输协议，但不支持浏览器直接播放。HLS (HTTP Live Streaming) 是苹果提出的流媒体协议，支持浏览器播放。

转码流程：
1. 接收 RTSP 流
2. 解码
3. 重新编码为 HLS
4. 通过 HTTP 分发
```

### 5.2 Interview Agent 演示数据

需要在知识库中添加以下文档：

**微服务架构设计.md**
```markdown
# 微服务架构设计

## 核心概念

微服务架构是一种将单体应用拆分为多个小型服务的架构风格。

## 技术栈

- Spring Boot
- Spring Cloud
- Netflix OSS
- Docker
- Kubernetes
```

**高并发处理.md**
```markdown
# 高并发处理

## 缓存策略

- Redis 缓存热点数据
- 本地缓存减少网络开销
- 缓存预热提高命中率

## 消息队列

- RabbitMQ 削峰填谷
- Kafka 流式处理
- 异步解耦
```

### 5.3 Project Deep Dive 演示数据

需要在知识库中添加以下项目文档：

**消防物联网平台.md**
```markdown
# 消防物联网平台

## 项目背景

消防物联网平台是一个面向消防行业的物联网监控平台。

## 系统架构

### 设备层
- 传感器
- 网关
- 边缘计算设备

### 接入层
- MQTT 服务
- HTTP API

### 业务层
- 微服务集群
- 消息队列
- 缓存

### 数据层
- MySQL
- Redis
- MongoDB

## 技术栈

- 后端: Java, Spring Boot, MyBatis
- 中间件: RabbitMQ, Redis, Kafka
- 数据库: MySQL, MongoDB, InfluxDB
- 部署: Docker, Kubernetes, Jenkins

## 技术挑战

### 高并发设备接入
**解决方案**: MQTT 集群 + 消息队列削峰
**结果**: 支持 10 万设备同时在线

### 实时数据处理
**解决方案**: Redis 缓存 + 流式计算
**结果**: 数据处理延迟 < 100ms

## 项目成果

- 部署 50 个消防站点
- 监控 10 万设备
- 预警准确率 95%
- 应急响应时间缩短 50%
```

## 六、演示脚本

### 6.1 Demo 1 演示脚本

```
面试官：你能演示一下你的 AI 问答助手吗？

我：好的。我打开 BeU Workbench 的 AI Demo 页面，选择 Demo 1：RAG。

我输入问题："无人机项目为什么需要视频转码？"

系统自动检索知识库，找到了相关文档。

答案：因为项目现场设备输出的是 RTSP，而浏览器无法直接播放 RTSP，因此需要通过转码服务转换为浏览器支持的流媒体格式。

来源：无人机平台技术方案（匹配度 95%）、视频流接入方案（匹配度 87%）

检索过程：Query → Embedding (50ms) → Vector Search (80ms) → Top K Chunks (5) → Context Building (20ms) → LLM Generation (500ms) → Total: 650ms

整个检索和生成过程只需要 650ms，能够实时回答问题。
```

### 6.2 Demo 2 演示脚本

```
面试官：你能演示一下你的 AI 智能助手吗？

我：好的。我选择 Demo 2：Interview Agent。

我粘贴一个 Java 后端岗位的 JD。

系统自动生成执行计划：
1. 调用 JD Analysis Skill 分析 JD
2. 调用 knowledge.search 查询相关知识
3. 调用 project.search 查询相关项目
4. 调用 Project Match Skill 匹配项目
5. 调用 Interview Preparation Skill 生成面试方案

系统逐步执行：
- Step 1: ✓ JD Analysis Skill - 提取技术栈、核心要求
- Step 2: ✓ knowledge.search - 找到微服务架构相关文档
- Step 3: ✓ project.search - 找到消防物联网平台、无人机实战平台
- Step 4: ✓ Project Match Skill - 最匹配消防物联网平台
- Step 5: ✓ Interview Preparation Skill - 生成面试准备方案

最终结果：根据 JD 分析，最匹配的项目是消防物联网平台。建议重点准备 Spring Boot 核心原理、微服务架构设计、以及消防物联网项目的详细技术细节。

整个 Agent 执行过程完全透明，可以看到每一步的执行情况和结果。
```

### 6.3 Demo 3 演示脚本

```
面试官：你能深入介绍一下你的项目吗？

我：好的。我选择 Demo 3：Project Deep Dive。

我输入项目名称："消防物联网平台"。

系统自动调用 Project Deep Dive Skill，生成完整的项目分析：

项目背景：消防物联网平台是一个面向消防行业的物联网监控平台...

系统架构：设备层 → 接入层 → 业务层 → 数据层

我的职责：负责后端服务开发、设计消息队列架构、优化数据库性能...

技术栈：Java, Spring Boot, RabbitMQ, Redis, MySQL...

技术挑战：
1. 高并发设备接入 - 解决方案：MQTT 集群 + 消息队列削峰
2. 实时数据处理 - 解决方案：Redis 缓存 + 流式计算

技术选型：选择 RabbitMQ 而非 Kafka，因为业务场景适合消息队列而非流处理...

项目成果：部署 50 个消防站点、监控 10 万设备、预警准确率 95%...

面试追问：如果设备数量翻倍，系统如何扩展？消息队列宕机如何处理？如何保证数据一致性？

这个 Skill 能够自动从项目文档中提取关键信息，生成完整的面试素材。
```

## 七、演示时间控制

### 7.1 时间分配

**Demo 1（RAG）：**
- 开场介绍：10 秒
- 输入问题：5 秒
- 等待结果：3 秒
- 解释结果：20 秒
- 总计：约 38 秒

**Demo 2（Interview Agent）：**
- 开场介绍：10 秒
- 粘贴 JD：5 秒
- 等待执行：10 秒
- 解释执行过程：30 秒
- 解释结果：20 秒
- 总计：约 75 秒

**Demo 3（Project Deep Dive）：**
- 开场介绍：10 秒
- 输入项目名：3 秒
- 等待结果：5 秒
- 解释结果：30 秒
- 总计：约 48 秒

**总计：约 2.5 分钟**

### 7.2 优化建议

1. **预设输入**：提前准备好演示用的 JD 和项目名称
2. **快速导航**：设置快捷键快速切换 Demo
3. **并行执行**：某些步骤可以并行执行以减少等待时间
4. **缓存结果**：缓存常用查询结果以提高响应速度

## 八、错误处理

### 8.1 演示失败应对

**RAG 检索失败：**
- 回退方案：使用关键词搜索
- 解释：展示 fallback 机制

**Agent 执行失败：**
- 回退方案：直接调用 Skill
- 解释：展示错误信息

**Skill 执行失败：**
- 回退方案：使用预定义的回答
- 解释：展示 Skill 的局限性

### 8.2 网络问题

**LLM API 超时：**
- 回退方案：使用本地模型或缓存结果
- 解释：网络延迟

**向量数据库连接失败：**
- 回退方案：使用关键词搜索
- 解释：基础设施问题

## 九、总结

AI Demo 模块提供三个核心演示场景：

1. **Demo 1（RAG）**：展示知识检索和问答能力
2. **Demo 2（Interview Agent）**：展示 Agent 的规划和执行能力
3. **Demo 3（Project Deep Dive）**：展示 Skill 的深度分析能力

关键设计点：
- 演示流程清晰
- 执行过程透明
- 结果可视化
- 时间控制在 1-3 分钟
- 提供回退方案