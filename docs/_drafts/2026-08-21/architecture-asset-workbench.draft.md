# BeU Workbench 核心架构设计：个人能力资产工作台

## 核心定位

**BeU Workbench = 一人公司的个人能力资产工作台**

不是知识库、学习网站、课程平台、传统 SaaS 或商城，而是帮助个人将能力转化为资产，再将资产转化为产品的生产系统。

## 核心数据模型

### 1. Asset（能力资产）- 核心抽象

Asset 是所有内容的基础抽象单元，类型包括：

- `knowledge` - 知识
- `skill` - 技能
- `prompt` - 提示词
- `workflow` - 工作流
- `template` - 模板
- `tutorial` - 教程
- `case` - 案例
- `project` - 项目
- `agent` - 智能体
- `tool` - 工具

#### Asset 数据结构

```typescript
interface Asset {
  id: string;
  type: AssetType;
  title: string;
  description: string;
  content: any; // 根据 type 存储 不同结构的内容
  tags: string[];
  author: string; // 个人品牌
  status: 'draft' | 'published' | 'archived';
  version: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
  relatedAssets: string[]; // 关联的其他 Asset ID
}
```

### 2. Skill（技能）

Skill 是可执行、可验证、可评估的能力单元。

```typescript
interface Skill extends Asset {
  type: 'skill';
  content: {
    level: number; // 1-100
    category: string;
    prerequisites: string[]; // 前置技能
    learningPath: string[]; // 学习路径
    assessmentMethod: string;
    projectIds: string[]; // 关联项目
  };
}
```

### 3. Prompt（提示词）

Prompt 是可复用的 AI 交互模板。

```typescript
interface Prompt extends Asset {
  type: 'prompt';
  content: {
    template: string;
    variables: Array<{
      name: string;
      type: string;
      required: boolean;
      defaultValue?: string;
    }>;
    targetModel: string; // gpt-4, claude-3, etc.
    examples: Array<{
      input: Record<string, any>;
      output: string;
    }>;
  };
}
```

### 4. Workflow（工作流）

Workflow 是可执行的自动化流程。

```typescript
interface Workflow extends Asset {
  type: 'workflow';
  content: {
    steps: Array<{
      id: string;
      type: 'manual' | 'prompt' | 'tool' | 'agent';
      name: string;
      config: any;
      nextSteps: string[];
    }>;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
    requiredAssets: string[]; // 依赖的 Asset
  };
}
```

### 5. Template（模板）

Template 是可复用的内容框架。

```typescript
interface Template extends Asset {
  type: 'template';
  content: {
    structure: any;
    placeholders: Array<{
      key: string;
      description: string;
      required: boolean;
    }>;
    examples: any[];
  };
}
```

### 6. Tutorial（教程）

Tutorial 是结构化的学习内容。

```typescript
interface Tutorial extends Asset {
  type: 'tutorial';
  content: {
    chapters: Array<{
      title: string;
      content: string;
      exercises?: any[];
    }>;
    duration: number; // 分钟
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    prerequisites: string[];
  };
}
```

### 7. Case（案例）

Case 是真实的应用实例。

```typescript
interface Case extends Asset {
  type: 'case';
  content: {
    context: string;
    problem: string;
    solution: string;
    result: string;
    lessons: string[];
    usedAssets: string[]; // 使用的 Asset
  };
}
```

### 8. Product（数字产品）

Product 是可售卖的 Asset 组合。

```typescript
interface Product {
  id: string;
  title: string;
  description: string;
  author: string;
  authorProfile: {
    name: string;
    avatar: string;
    bio: string;
    socials: Record<string, string>;
  };
  status: 'draft' | 'published' | 'archived';
  pricing: {
    type: 'one-time' | 'subscription' | 'free';
    amount?: number;
    currency?: string;
  };
  assets: ProductAsset[]; // 包含的 Asset
  version: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  statistics: {
    views: number;
    sales: number;
    rating: number;
  };
}

interface ProductAsset {
  assetId: string;
  type: AssetType;
  included: boolean;
  order: number;
}
```

### 9. AuthorProfile（作者/个人品牌）

```typescript
interface AuthorProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  tagline: string;
  socials: {
    wechat?: string;
    email?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  expertise: string[];
  verified: boolean;
  createdAt: string;
}
```

## 核心数据流

```
个人能力
  ↓
Knowledge (知识)
  ↓
Skill (技能)
  ↓
Prompt + Workflow + Template
  ↓
Tutorial + Case
  ↓
Asset (资产)
  ↓
Product (产品)
  ↓
Distribution (分发)
  ↓
Revenue (收入)
```

## 模块关系图

```
┌─────────────────────────────────────────────────────────┐
│                   BeU Workbench                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │  Knowledge   │───→│    Skill     │                  │
│  └──────────────┘    └──────┬───────┘                  │
│                            ↓                            │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   Prompt     │←───│  Workflow    │                  │
│  └──────────────┘    └──────┬───────┘                  │
│                            ↓                            │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │  Template    │←───│   Tutorial   │                  │
│  └──────────────┘    └──────┬───────┘                  │
│                            ↓                            │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │    Case      │←───│   Project    │                  │
│  └──────────────┘    └──────┬───────┘                  │
│                            ↓                            │
│                     ┌──────────────┐                    │
│                     │    Asset     │                    │
│                     └──────┬───────┘                    │
│                            ↓                            │
│                     ┌──────────────┐                    │
│                     │   Product    │                    │
│                     └──────┬───────┘                    │
│                            ↓                            │
│                     ┌──────────────┐                    │
│                     │ Distribution │                    │
│                     └──────────────┘                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│              Existing Modules (Keep)                     │
│  ├── Career (职业生涯)                                   │
│  ├── Knowledge (知识库)                                  │
│  ├── Skills (技能)                                       │
│  └── Projects (项目)                                     │
└─────────────────────────────────────────────────────────┘
```

## P0 阶段实现内容

### 目标
建立 Asset 抽象层，实现基础数据模型和管理界面。

### 实现清单

#### 1. 核心数据模型
- [ ] Asset 基础抽象
- [ ] Skill 数据结构
- [ ] Prompt 数据结构
- [ ] Workflow 数据结构
- [ ] Template 数据结构
- [ ] Tutorial 数据结构
- [ ] Case 数据结构
- [ ] Product 数据结构
- [ ] AuthorProfile 数据结构

#### 2. 数据存储层
- [ ] Asset 存储服务 (src/assets/storage.js)
- [ ] Asset CRUD 操作
- [ ] Asset 关联管理
- [ ] Asset 版本管理（基础）

#### 3. 页面组件
- [ ] AssetLibraryPage - 资产库总览
- [ ] AssetDetailPage - 资产详情
- [ ] AssetEditorPage - 资产编辑器
- [ ] SkillEditorPage - Skill 专用编辑器
- [ ] PromptEditorPage - Prompt 专用编辑器
- [ ] WorkflowEditorPage - Workflow 专用编辑器
- [ ] ProductLibraryPage - 产品库
- [ ] ProductDetailPage - 产品详情
- [ ] ProductEditorPage - 产品编辑器
- [ ] AuthorProfilePage - 个人品牌页面

#### 4. 导航集成
- [ ] 在 AppShell 添加导航项
- [ ] 在 App.jsx 添加路由

#### 5. UI 组件
- [ ] AssetCard 组件
- [ ] AssetList 组件
- [ ] AssetTag 组件
- [ ] AssetTypeBadge 组件
- [ ] ProductCard 组件
- [ ] AuthorCard 组件

#### 6. 样式
- [ ] src/styles/assets.css

### P0 阶段不实现
- ❌ 支付系统
- ❌ 订单系统
- ❌ 用户系统
- ❌ 权益系统
- ❌ 社群功能
- ❌ 分销系统
- ❌ 营销自动化

### P0 阶段只做
- ✅ 为商业化留下扩展接口
- ✅ 架构可扩展
- ✅ 数据模型支持未来扩展

## 技术实现策略

### 1. 数据存储
使用 localStorage 存储 Asset 数据，为未来迁移到数据库预留接口。

### 2. 类型安全
使用 TypeScript 接口定义所有数据结构。

### 3. 组件设计
采用模块化设计，每个 Asset 类型有独立的编辑器组件。

### 4. 扩展性
- Product 结构预留 pricing 字段
- Asset 结构预留 metadata 扩展字段
- 所有实体都有 createdAt/updatedAt 时间戳

## 与现有模块的关系

### Career 模块
Career 模块中的"技能"、"项目"、"面试故事"可以逐步迁移到 Asset 模型：
- Career 技能 → Asset.Skill
- Career 项目 → Asset.Project
- Career 面试故事 → Asset.Case

### Knowledge 模块
Knowledge 模块中的文档可以部分转化为：
- 知识文档 → Asset.Knowledge
- 教程 → Asset.Tutorial

### Skills 模块
Skills 模块可以与 Asset.Skill 统一。

## 未来扩展接口

### 支付接口
```typescript
interface PaymentGateway {
  createPayment(product: Product): Promise<Payment>;
  verifyPayment(paymentId: string): Promise<boolean>;
}
```

### 订单接口
```typescript
interface OrderService {
  createOrder(product: Product, user: User): Promise<Order>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
}
```

### 权益接口
```typescript
interface EntitlementService {
  checkEntitlement(user: User, product: Product): Promise<boolean>;
  grantEntitlement(user: User, product: Product): Promise<void>;
}
```

## 设计判断标准

任何功能都需要回答：
1. 是否帮助沉淀能力？
2. 是否提高复用率？
3. 是否降低交付成本？
4. 是否支持产品化？
5. 是否支持自动交付？
6. 是否支持建立个人品牌？
7. 是否有助于获得收入？

如果无法帮助一人公司提高效率或收入，不要做。