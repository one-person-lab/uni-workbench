# 原项目架构分析

## 技术栈

### 前端技术
- **React**: 19.2.0
- **Vite**: 6.4.2
- **React Router**: 7.9.4
- **Motion**: 12.23.24 (动画库)
- **Recharts**: 2.15.4 (图表库)
- **D3-Force**: 3.0.0 (力导向图)
- **GSAP**: 3.15.0 (动画库)

### 数据处理
- **Gray-Matter**: 4.0.3 (Markdown frontmatter 解析)
- **Unified**: 11.0.5 (Markdown 处理管道)
- **Remark-Parse**: 11.0.0 (Markdown 解析)
- **Remark-GFM**: 4.0.1 (GitHub Flavored Markdown)
- **Rehype-Raw**: 7.0.0 (HTML 处理)
- **Rehype-Sanitize**: 6.0.0 (HTML 清理)
- **React-Markdown**: 10.1.0 (Markdown 渲染)

### 搜索和索引
- **MiniSearch**: 7.2.0 (全文搜索)
- **Fast-Glob**: 3.3.3 (文件匹配)

### 工具库
- **Zod**: 3.25.76 (数据验证)
- **XLSX**: 0.18.5 (Excel 处理)

### 字体
- **@fontsource/jetbrains-mono**: 5.3.0
- **@fontsource/noto-sans-sc**: 5.2.8
- **@fontsource/noto-serif-sc**: 5.2.8
- **@fontsource/space-grotesk**: 5.3.0

### 图标
- **@tabler/icons-react**: 3.34.1

## 项目结构

```
person_dashboard/
├── kb/           # Markdown Vault 与 synthetic demo 数据
│   ├── 10_raw/          # 原始素材
│   ├── 30_self_media/   # 社媒数据
│   ├── 40_topics/       # 主题档案
│   ├── 50_scripts/      # 脚本
│   └── wiki/            # Wiki 知识
├── workbench/           # 前端、服务端、测试、模板和开发工具
│   ├── src/             # 前端源码
│   ├── server/          # 服务端 API
│   ├── public/          # 静态资源
│   ├── shared/          # 共享代码
│   ├── config/          # 配置文件
│   ├── scripts/         # 脚本工具
│   ├── templates/       # 模板
│   ├── tests/           # 测试
│   ├── worker/          # Worker
│   └── docs/            # 文档
├── docs/                # 项目文档
├── README.md
├── AGENTS.md
└── LICENSE
```

## 核心模块分析

### 1. 前端架构
- 基于 React 19 和 Vite 6
- 使用 React Router 进行路由管理
- 组件采用函数式组件和 Hooks
- 使用 Motion 和 GSAP 进行动画处理
- 使用 Recharts 进行数据可视化

### 2. 数据架构
- **核心存储**: Markdown + YAML frontmatter
- **知识库结构**: 分层目录结构 (10_raw, 30_self_media, 40_topics, 50_scripts, wiki)
- **数据索引**: 使用 fast-glob 进行文件扫描
- **搜索**: 使用 MiniSearch 进行全文搜索
- **验证**: 使用 Zod 进行数据验证

### 3. 服务端架构
- 基于 Vite 插件提供 API
- 自定义 Vite 插件: `workbenchApiPlugin`
- 支持本地 Vault 读取
- 提供数据索引和搜索 API
- 支持隐私保护的数据访问控制

### 4. 测试架构
- 使用 Node.js 原生测试框架 (`node --test`)
- 测试覆盖率包括：
  - 数据真实性验证
  - UI 信息门控
  - 每日热点
  - 社媒洞察
  - 素材管理
  - 书籍阅读
  - Vault 同步
  - 图表渲染
  - 阅读器功能
  - Wiki 导入
  - API 测试

### 5. 隐私保护
- 明确的隐私扫描工具 (`privacy:scan`)
- 本地环境变量配置
- 数据脱敏机制
- 防止个人数据泄露的规则

## 可复用模块

### 1. 数据处理层
- Markdown 解析和渲染
- YAML frontmatter 处理
- 文件索引和搜索
- 数据验证

### 2. UI 组件
- 知识图谱组件
- 数据可视化组件
- 阅读器组件
- 文档列表组件

### 3. 服务端 API
- Vault 读取 API
- 搜索 API
- 数据聚合 API

### 4. 测试框架
- 数据验证测试
- 隐私扫描测试
- API 测试

## 需要删除的模块

根据 BeU Workbench 的产品定位，以下模块可能需要删除或重构：

1. **社媒洞察模块**: 原项目专注于抖音数据，BeU Workbench 应该支持更通用的社媒平台
2. **抖音特定功能**: 过于垂直，需要通用化
3. **个人账号数据展示**: 需要重新设计以支持多种账号类型

## 需要重构的模块

### 1. 知识库结构
- **原结构**: 10_raw, 30_self_media, 40_topics, 50_scripts, wiki
- **新结构**: 需要支持 Knowledge, Skills, Workflows, Agents, Tools, Templates, Projects

### 2. 数据模型
- **原模型**: 针对社媒研究和阅读的特定模型
- **新模型**: 需要支持 Skill、Workflow、Agent 等新概念

### 3. UI 设计
- **原设计**: 针对社媒洞察和阅读的界面
- **新设计**: 需要建立全新的 Design System

### 4. 数据索引
- **原索引**: 针对特定数据类型的索引
- **新索引**: 需要支持新的数据类型和关系

## 数据流分析

### 原项目数据流
```
kb (Markdown)
  ↓
文件扫描 (fast-glob)
  ↓
解析 (gray-matter, unified)
  ↓
索引 (MiniSearch)
  ↓
API (Vite 插件)
  ↓
前端渲染 (React)
```

### 新项目数据流
```
多类型数据源 (Knowledge, Skills, Workflows, Agents, Tools, Templates, Projects)
  ↓
统一文件扫描
  ↓
智能解析和验证
  ↓
多维索引
  ↓
统一 API
  ↓
模块化前端渲染
```

## 扩展点分析

### 1. 数据源扩展
- 原项目主要支持 Markdown Vault
- 新项目需要支持更多数据源和格式

### 2. Agent 集成
- 原项目通过环境变量支持 Codex、Claude Code
- 新项目需要更完整的 Agent Runtime 和扩展接口

### 3. 技能系统
- 原项目有基础的 Agent Skills
- 新项目需要完整的 Skill 管理系统

### 4. 工作流引擎
- 原项目缺少工作流概念
- 新项目需要实现工作流引擎

## 技术债务和限制

### 1. 依赖版本
- React 19.2.0 较新，可能有兼容性问题
- 某些依赖可能需要更新

### 2. 性能
- 字体文件较大 (中文字体)
- 前端打包文件较大
- 需要优化构建输出

### 3. 测试覆盖
- 现有测试较为全面
- 但新功能需要补充测试

### 4. 文档
- 原项目文档较为完善
- 需要补充 BeU Workbench 特有功能的文档

## 结论

原项目 person_dashboard 具有良好的技术基础和架构设计，特别是：

1. **数据优先**: 基于 Markdown 和 Git 的数据架构
2. **隐私保护**: 完善的隐私扫描和数据保护机制
3. **可测试性**: 全面的测试覆盖
4. **可扩展性**: 清晰的模块划分

BeU Workbench 可以基于这些优势进行扩展，同时需要：

1. **重构数据模型**: 支持新的概念和关系
2. **重新设计 UI**: 建立新的 Design System
3. **实现新功能**: Skills、Workflows、Agents 等
4. **优化性能**: 解决构建和运行时的性能问题
5. **补充文档**: 为新功能提供完整文档