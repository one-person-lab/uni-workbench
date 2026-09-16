# BeU Workbench 架构设计
# 一人公司个人能力资产工作台

## 一、架构原则

### 1.1 核心原则

**"一人公司可运营"**

所有架构决策必须回答：
- 一个人能否维护？
- 是否支持自动化？
- 是否支持低成本启动？
- 是否支持高复用？

### 1.2 分层原则

```
基础设施层
  ↓
数据层
  ↓
领域层
  ↓
应用层
  ↓
展示层
  ↓
分发层
```

### 1.3 扩展性原则

- 模块化设计，支持渐进式扩展
- 商业化能力按阶段实现（P0 → P1 → P2 → P3）
- 不预先实现复杂功能，但架构上留有扩展接口

## 二、核心领域模型

### 2.1 Asset（资产）

资产是个人能力的基本抽象单元。

```javascript
// Asset 基础模型
{
  id: string
  type: AssetType  // knowledge, skill, prompt, workflow, template, tutorial, case, project, agent, tool
  title: string
  description: string
  content: object   // 根据类型不同，结构不同
  tags: string[]
  author: string
  status: AssetStatus  // draft, published, archived
  version: string
  createdAt: string
  updatedAt: string
  metadata: object
  relatedAssets: string[]  // 关联的其他资产 ID
}
```

### 2.2 AssetType（资产类型）

```javascript
{
  KNOWLEDGE: 'knowledge',    // 知识条目
  SKILL: 'skill',            // 技能
  PROMPT: 'prompt',          // 提示词
  WORKFLOW: 'workflow',      // 工作流
  TEMPLATE: 'template',      // 模板
  TUTORIAL: 'tutorial',      // 教程
  CASE: 'case',              // 案例
  PROJECT: 'project',        // 项目
  AGENT: 'agent',            // 智能体
  TOOL: 'tool'               // 工具
}
```

### 2.3 Product（产品）

产品是多个资产的组合，面向用户销售。

```javascript
{
  id: string
  title: string
  description: string
  author: string
  authorProfile: {
    name: string
    avatar: string
    bio: string
    socials: object
  }
  status: ProductStatus  // draft, published, archived
  pricing: {
    type: PricingType  // one-time, subscription, free
    amount: number
    currency: string
  }
  assets: string[]  // 包含的资产 ID 列表
  version: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  statistics: {
    views: number
    sales: number
    rating: number
  }
}
```

### 2.4 AuthorProfile（作者档案）

支持个人品牌驱动商业化。

```javascript
{
  id: string
  name: string
  avatar: string
  bio: string
  tagline: string
  socials: {
    wechat: string
    email: string
    github: string
    twitter: string
    website: string
  }
  expertise: string[]
  verified: boolean
  createdAt: string
}
```

### 2.5 领域关系

```
AuthorProfile
  ↓
Product
  ↓
ProductAsset (关联表)
  ↓
Asset
  ↓
relatedAssets (关联)
```

## 三、分层架构

### 3.1 基础设施层

**职责**：提供底层技术支持

- 本地存储（localStorage）
- 未来扩展：云存储、CDN、数据库

**关键设计**：
- 存储接口抽象，支持未来切换
- 文件上传接口抽象
- 缓存策略

### 3.2 数据层

**职责**：数据持久化和访问

- `storage.js`：统一存储接口
- 未来扩展：数据库适配器

**关键设计**：
- Repository 模式
- 数据访问抽象
- 事务支持（预留）

### 3.3 领域层

**职责**：核心业务逻辑

- `models.js`：领域模型定义
- 领域服务（未来扩展）

**关键设计**：
- 纯函数优先
- 领域逻辑与数据访问分离
- 不依赖 UI 框架

### 3.4 应用层

**职责**：编排领域服务，处理应用逻辑

- `useAssets.js`：React Hooks
- 未来扩展：Service 层

**关键设计**：
- 状态管理
- 副作用处理
- 业务流程编排

### 3.5 展示层

**职责**：用户界面

- `AssetLibraryPage`：资产库页面
- `AssetDetailPage`：资产详情页
- `ProductLibraryPage`：产品库页面
- `ProductDetailPage`：产品详情页
- `AuthorProfilePage`：作者档案页
- 各种编辑器页面

**关键设计**：
- 组件化
- 响应式设计
- 无障碍访问

### 3.6 分发层

**职责**：内容分发和交付（未来扩展）

- 产品页面
- 下载接口
- 授权验证
- 自动交付

**关键设计**：
- 静态化支持
- CDN 友好
- SEO 优化

## 四、商业化架构扩展

### 4.1 阶段化实现

#### P0（当前阶段）
- Asset 基础抽象
- Product 基础抽象
- AuthorProfile 基础抽象
- 本地存储
- 基础 UI

#### P1（产品组合与交付）
- ProductAsset 关联管理
- 产品版本管理
- 发布流程
- 基础交付接口

#### P2（支付与订单）
- Payment 接口抽象
- Order 模型
- Entitlement 模型
- 基础支付集成

#### P3（高级商业化）
- 订阅管理
- 会员系统
- 分销系统
- 营销自动化

### 4.2 商业化扩展接口

```javascript
// 支付接口抽象（预留）
interface PaymentGateway {
  createPayment(amount, currency): Promise<PaymentResult>
  verifyPayment(paymentId): Promise<boolean>
  refundPayment(paymentId): Promise<boolean>
}

// 交付接口抽象（预留）
interface DeliverySystem {
  deliverProduct(productId, userId): Promise<DeliveryResult>
  generateDownloadLink(productId, userId): Promise<string>
  verifyAccess(productId, userId): Promise<boolean>
}

// 授权接口抽象（预留）
interface EntitlementService {
  grantAccess(userId, productId): Promise<void>
  revokeAccess(userId, productId): Promise<void>
  checkAccess(userId, productId): Promise<boolean>
}
```

## 五、数据流设计

### 5.1 资产创建流程

```
用户输入
  ↓
表单验证
  ↓
创建 Asset 对象
  ↓
持久化到存储
  ↓
更新 UI 状态
  ↓
导航到详情页
```

### 5.2 产品组合流程

```
选择 Asset
  ↓
添加到 Product
  ↓
设置产品信息
  ↓
配置定价
  ↓
保存 Product
  ↓
发布（可选）
```

### 5.3 交付流程（未来）

```
用户购买
  ↓
创建订单
  ↓
支付处理
  ↓
授权验证
  ↓
触发交付
  ↓
生成下载链接
  ↓
发送通知
```

## 六、自动化设计

### 6.1 自动交付

- 产品发布后自动生成交付包
- 购买后自动授权
- 自动生成下载链接
- 自动发送通知

### 6.2 自动更新

- Asset 更新后自动同步到 Product
- Product 版本自动管理
- 用户自动获得更新通知

### 6.3 自动通知

- 产品发布通知
- 更新通知
- 购买确认
- 交付通知

## 七、一人公司友好设计

### 7.1 低维护成本

- 无需数据库配置（初期）
- 无需服务器部署（初期）
- 无需复杂运维（初期）
- 自动化流程优先

### 7.2 低学习成本

- 直观的 UI
- 清晰的工作流
- 完善的文档
- 示例模板

### 7.3 高复用性

- Asset 可复用
- Template 可复用
- Workflow 可复用
- Product 可复用

### 7.4 高自动化

- 自动化交付
- 自动化更新
- 自动化通知
- 自动化授权

## 八、技术栈选择

### 8.1 前端框架

- React：组件化，生态成熟
- Vite：快速开发体验

### 8.2 状态管理

- React Hooks：简单直接
- 未来扩展：Zustand 或 Jotai（如果需要）

### 8.3 存储

- localStorage：初期快速启动
- 未来扩展：IndexedDB、云存储

### 8.4 路由

- React Router：标准方案

### 8.5 样式

- CSS Modules：模块化
- 未来扩展：Tailwind CSS（如果需要）

## 九、安全设计

### 9.1 数据安全

- 本地数据加密（未来）
- 备份机制（未来）
- 访问控制（未来）

### 9.2 商业安全

- 支付安全（未来）
- 授权验证（未来）
- 防刷机制（未来）

## 十、性能优化

### 10.1 前端性能

- 代码分割
- 懒加载
- 虚拟滚动（大数据量时）
- 缓存策略

### 10.2 存储性能

- 索引优化（未来）
- 分页加载
- 增量更新

## 十一、可观测性

### 11.1 日志

- 用户行为日志
- 错误日志
- 性能日志

### 11.2 监控

- 错误监控（未来）
- 性能监控（未来）
- 业务指标监控（未来）

## 十二、测试策略

### 12.1 单元测试

- 领域逻辑测试
- 工具函数测试

### 12.2 集成测试

- 存储层测试
- API 测试（未来）

### 12.3 E2E 测试

- 关键流程测试
- 购买流程测试（未来）

## 十三、部署策略

### 13.1 初期部署

- 静态托管（Vercel、Netlify）
- 无服务器架构

### 13.2 未来扩展

- 容器化部署
- CDN 加速
- 多区域部署

## 十四、扩展点设计

### 14.1 存储扩展

```javascript
// 存储接口抽象
interface StorageAdapter {
  get(key): Promise<any>
  set(key, value): Promise<void>
  delete(key): Promise<void>
  list(): Promise<any[]>
}
```

### 14.2 支付扩展

```javascript
// 支付网关接口
interface PaymentGateway {
  createPayment(amount, currency): Promise<PaymentResult>
  verifyPayment(paymentId): Promise<boolean>
}
```

### 14.3 通知扩展

```javascript
// 通知服务接口
interface NotificationService {
  sendNotification(userId, message): Promise<void>
  sendEmail(userId, subject, body): Promise<void>
}
```

## 十五、架构演进路径

### 15.1 阶段 1：本地版本（当前）

- 纯前端
- 本地存储
- 单人使用

### 15.2 阶段 2：云端版本

- 后端 API
- 云数据库
- 多用户支持

### 15.3 阶段 3：商业化版本

- 支付集成
- 订单系统
- 交付系统

### 15.4 阶段 4：平台版本

- 多作者支持
- 社群功能
- 高级商业化

## 十六、关键决策记录

### 16.1 为什么选择本地存储优先？

- 降低启动成本
- 无需服务器配置
- 快速验证产品
- 一人公司友好

### 16.2 为什么采用模块化设计？

- 支持渐进式扩展
- 降低维护成本
- 提高复用性
- 便于团队协作（未来）

### 16.3 为什么预留商业化接口？

- 不预先实现复杂功能
- 但架构上支持扩展
- 避免后期重构
- 保持灵活性

## 十七、技术债务管理

### 17.1 当前技术债务

- 无类型检查（TypeScript 考虑中）
- 测试覆盖不足
- 错误处理不完善

### 17.2 偿还计划

- 逐步引入 TypeScript
- 增加关键路径测试
- 完善错误处理

## 十八、架构图

```
┌─────────────────────────────────────────┐
│           展示层 (Presentation)          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Pages   │  │Components│  │Editors │ │
│  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│            应用层 (Application)           │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   Hooks  │  │ Services │  │Flows   │ │
│  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│             领域层 (Domain)               │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Models  │  │Logic     │  │Rules   │ │
│  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│              数据层 (Data)               │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Storage  │  │Repository │  │Cache   │ │
│  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│           基础设施层 (Infrastructure)     │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ LocalSto │  │Future:DB │  │CDN     │ │
│  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────┘
```

## 十九、总结

本架构设计的核心目标：

1. **支持一人公司运营**：低维护成本、高自动化
2. **渐进式扩展**：从本地到云端，从免费到商业化
3. **模块化设计**：职责清晰、易于维护
4. **预留扩展接口**：不预先实现复杂功能，但架构上支持

始终记住：BeU Workbench 是"一人公司的个人能力资产工作台"，帮助一个人把能力变成资产，再把资产变成产品。