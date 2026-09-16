# BeU Workbench UI 架构 (优化版)

## 设计原则 (参考 Affine)

- **现代极简**: 参考 Affine 的设计语言，简洁但功能强大
- **性能优先**: 60fps 的流畅体验，避免卡顿
- **可访问性**: WCAG 2.1 AA 标准，支持键盘导航
- **深色模式**: 完美的深色模式支持，不是简单的颜色反转
- **信息密度**: 高效的信息展示，避免信息过载
- **AI Native**: 为 AI 交互设计，智能反馈和辅助
- **长时间使用**: 考虑长时间使用的疲劳问题
- **Desktop First**: 优先桌面端体验，同时兼顾移动端
- **插件友好**: UI 支持插件扩展和自定义

## 避免的设计问题

- **AI Slop**: 避免低质量的 AI 装饰和过度动画
- **大量渐变**: 避免过度使用渐变，保持简洁
- **到处圆角卡片**: 避免过度圆角化，使用适度的圆角
- **紫色 AI 风**: 避免刻板的 AI 设计风格，建立独特的设计语言
- **无意义的 Dashboard 图表**: 避免装饰性图表，注重功能性
- **过度装饰**: 专注于功能性，减少视觉噪音
- **信息堆叠**: 合理的信息层次，避免信息过载

## Design System (参考 Radix UI + Tailwind CSS)

### Color Tokens (优化版)

```css
/* 主色调 - 参考现代设计系统 */
:root {
  /* 主色系 */
  --color-primary: #000000;
  --color-primary-hover: #1a1a1a;
  --color-primary-active: #333333;
  
  /* 品牌色 - 更现代的配色 */
  --color-brand: #6366f1; /* Indigo */
  --color-brand-light: #818cf8;
  --color-brand-dark: #4f46e5;
  
  /* 功能色 */
  --color-success: #10b981; /* Emerald */
  --color-warning: #f59e0b; /* Amber */
  --color-error: #ef4444; /* Red */
  --color-info: #3b82f6; /* Blue */
  
  /* 中性色 - 更细致的灰度 */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-bg-hover: #e2e8f0;
  
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #94a3b8;
  --color-text-disabled: #cbd5e1;
  
  /* 边框色 */
  --color-border-light: #e2e8f0;
  --color-border-medium: #cbd5e1;
  --color-border-dark: #94a3b8;
  
  /* 交互色 */
  --color-interaction-hover: rgba(99, 102, 241, 0.1);
  --color-interaction-active: rgba(99, 102, 241, 0.2);
  --color-interaction-focus: rgba(99, 102, 241, 0.3);
}

/* 深色模式 - 完美的深色配色 */
[data-theme="dark"] {
  --color-primary: #ffffff;
  --color-primary-hover: #f1f5f9;
  --color-primary-active: #e2e8f0;
  
  --color-brand: #818cf8;
  --color-brand-light: #a5b4fc;
  --color-brand-dark: #6366f1;
  
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-tertiary: #334155;
  --color-bg-hover: #475569;
  
  --color-text-primary: #f8fafc;
  --color-text-secondary: #cbd5e1;
  --color-text-tertiary: #64748b;
  --color-text-disabled: #475569;
  
  --color-border-light: #334155;
  --color-border-medium: #475569;
  --color-border-dark: #64748b;
}
```

### Typography (优化版)

```css
/* 字体家族 - 参考现代设计系统 */
:root {
  /* 主字体 */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
  --font-serif: 'Merriweather', 'Noto Serif SC', serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* 字体大小 - 更现代的缩放 */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;  /* 36px */
  --font-size-5xl: 3rem;      /* 48px */
  
  /* 字重 - 更细致的字重 */
  --font-weight-thin: 100;
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
  
  /* 行高 - 更适合阅读 */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* 字母间距 */
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
}
```

### Spacing (优化版)

```css
/* 间距系统 - 基于 4px 网格 */
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-5: 1.25rem;  /* 20px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  --spacing-10: 2.5rem;  /* 40px */
  --spacing-12: 3rem;    /* 48px */
  --spacing-16: 4rem;    /* 64px */
  --spacing-20: 5rem;    /* 80px */
  --spacing-24: 6rem;    /* 96px */
}
```

### Radius (优化版)

```css
/* 圆角 - 更现代的圆角系统 */
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;  /* 2px */
  --radius-base: 0.25rem; /* 4px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-2xl: 1rem;     /* 16px */
  --radius-3xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;
}
```

### Shadow (优化版)

```css
/* 阴影 - 更自然的阴影系统 */
:root {
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  /* 内阴影 */
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}

/* 深色模式阴影 */
[data-theme="dark"] {
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4);
  --shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
```

## 组件架构 (基于 Radix UI)

### 基础组件 (Radix UI Primitives)

```tsx
// Button 组件 - 基于 Radix UI
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// Input 组件 - 基于 Radix UI
interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Card 组件 - 现代化卡片设计
interface CardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  hoverable?: boolean;
  selectable?: boolean;
  selected?: boolean;
}

// Dialog 组件 - 基于 Radix UI Dialog
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

// Tooltip 组件 - 基于 Radix UI
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}
```

### 布局组件 (优化版)

```tsx
// Layout 组件 - 参考现代布局系统
interface LayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarWidth?: number;
  children: React.ReactNode;
  className?: string;
}

// Grid 组件 - CSS Grid 布局
interface GridProps {
  columns?: number | 'auto' | responsive;
  gap?: number;
  children: React.ReactNode;
  className?: string;
}

// Stack 组件 - Flexbox 布局
interface StackProps {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  spacing?: number;
  wrap?: boolean;
  children: React.ReactNode;
  className?: string;
}

// Container 组件 - 响应式容器
interface ContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: number;
  children: React.ReactNode;
  className?: string;
}
```

### 数据展示组件 (增强版)

```tsx
// Table 组件 - 现代化表格
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
}

// List 组件 - 虚拟滚动列表
interface ListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  virtual?: boolean;
  height?: number;
  className?: string;
}

// CardList 组件 - 卡片网格
interface CardListProps<T> {
  data: T[];
  renderCard: (item: T) => React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

// Tree 组件 - 树形结构
interface TreeProps<T> {
  data: TreeNode<T>[];
  renderItem: (node: TreeNode<T>) => React.ReactNode;
  expandable?: boolean;
  selectable?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}
```

### 导航组件 (优化版)

```tsx
// Sidebar 组件 - 现代化侧边栏
interface SidebarProps {
  items: NavItem[];
  activeItem?: string;
  onItemClick?: (item: NavItem) => void;
  collapsible?: boolean;
  className?: string;
}

// Breadcrumb 组件 - 面包屑导航
interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

// Tabs 组件 - 基于 Radix UI
interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  variant?: 'default' | 'underlined' | 'pills';
  className?: string;
}

// Command Palette 组件 - 命令面板
interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  commands: Command[];
  placeholder?: string;
  className?: string;
}
```

### 专业组件 (新增)

```tsx
// WorkflowEditor 组件 - 工作流可视化编辑器
interface WorkflowEditorProps {
  workflow: Workflow;
  onChange: (workflow: Workflow) => void;
  readOnly?: boolean;
  className?: string;
}

// SkillEditor 组件 - Skill 编辑器
interface SkillEditorProps {
  skill: Skill;
  onChange: (skill: Skill) => void;
  mode?: 'edit' | 'preview' | 'execute';
  className?: string;
}

// KnowledgeGraph 组件 - 知识图谱可视化
interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
  className?: string;
}

// AgentChat 组件 - Agent 对话界面
interface AgentChatProps {
  agent: Agent;
  messages: Message[];
  onSendMessage: (message: string) => void;
  className?: string;
}

// MarketplaceCard 组件 - 市场卡片
interface MarketplaceCardProps {
  listing: Listing;
  onPurchase?: (listing: Listing) => void;
  onPreview?: (listing: Listing) => void;
  className?: string;
}
```

## 页面布局 (重构版)

### 主布局 (现代化)

```
┌─────────────────────────────────────────────────────────────┐
│ Header (固定高度, 玻璃态效果)                                │
│ Logo | 搜索 | 命令面板 | 通知 | 用户菜单                      │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ Sidebar  │              Main Content                        │
│ (可折叠) │          (自适应宽度)                            │
│          │                                                  │
│ - Dashboard│                                                 │
│ - Knowledge│    [动态内容区域]                               │
│ - Skills   │                                                 │
│ - Workflows│    根据路由显示不同页面                         │
│ - Agents   │                                                 │
│ - Tools    │                                                 │
│ - Market   │                                                 │
│ - Projects │                                                 │
│ - Settings │                                                 │
│          │                                                 │
└──────────┴──────────────────────────────────────────────────┘
```

### Dashboard 页面 (能力仪表盘)

```
┌─────────────────────────────────────────────────────────────┐
│ 能力概览仪表盘                                               │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ 今日状态    │ │ 执行统计    │ │ 市场趋势    │             │
│ │ 活跃度: 85% │ │ 今日: 156   │ │ 销售额: $2.3K│             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
├─────────────────────────────────────────────────────────────┤
│ 最近活动时间线                                               │
│ - 执行了 Code Review Skill (2分钟前)                         │
│ - 更新了 JD Analysis Workflow (1小时前)                      │
│ - 购买了 Data Analysis Skill Pack (3小时前)                   │
├─────────────────────────────────────────────────────────────┤
│ 快捷操作                                                     │
│ [创建 Skill] [创建 Workflow] [打开市场] [启动 Agent]         │
└─────────────────────────────────────────────────────────────┘
```

### Knowledge 页面 (知识基础设施)

```
┌─────────────────────────────────────────────────────────────┐
│ 搜索栏 | 过滤器 | 视图切换 [列表] [图谱] [时间线]            │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ 知识树   │              知识内容                            │
│          │                                                  │
│ □ 文章   │  ┌────────────────────────────────────────┐    │
│ □ 笔记   │  │ 文章标题                                 │    │
│ □ 教程   │  │                                         │    │
│ □ 案例   │  │ 内容预览...                             │    │
│          │  │                                         │    │
│ □ 经验   │  │ 相关: [Skill引用] [执行结果]             │    │
│ □ 方法论 │  └────────────────────────────────────────┘    │
│          │                                                  │
│          │  [块级引用] [自动抽取] [AI 辅助]                │
└──────────┴──────────────────────────────────────────────────┘
```

### Skills 页面 (能力核心)

```
┌─────────────────────────────────────────────────────────────┐
│ [我的 Skills] [市场 Skills] [创建 Skill]                   │
├─────────────────────────────────────────────────────────────┤
│ Skill 分类标签                                               │
│ [全部] [编程] [分析] [写作] [研究] [设计]                   │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │
│ │ Code Review     │ │ Data Analysis   │ │ Content      │ │
│ │ ⭐ 4.7          │ │ ⭐ 4.5          │ │ Writing      │ │
│ │ 执行: 1.2s      │ │ 执行: 2.3s      │ │ ⭐ 4.8       │ │
│ │ [执行] [编辑]   │ │ [执行] [编辑]   │ │ [执行] [编辑]│ │
│ └──────────────────┘ └──────────────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Skill 详情面板 (选中时显示)                                  │
│ 能力描述 | 执行统计 | 市场信息 | 版本历史                   │
└─────────────────────────────────────────────────────────────┘
```

### Workflows 页面 (工作流编排)

```
┌─────────────────────────────────────────────────────────────┐
│ [我的 Workflows] [模板库] [创建 Workflow]                   │
├─────────────────────────────────────────────────────────────┤
│ 可视化工作流编辑器                                           │
│                                                              │
│  ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐             │
│  │Skill │───→│Agent │───→│ Skill│───→│Result│             │
│  └──────┘    └──────┘    └──────┘    └──────┘             │
│                                                              │
│  [拖拽节点] [连接] [配置] [执行] [保存]                     │
├─────────────────────────────────────────────────────────────┤
│ 执行历史和结果分析                                           │
└─────────────────────────────────────────────────────────────┘
```

### Marketplace 页面 (能力市场)

```
┌─────────────────────────────────────────────────────────────┐
│ 搜索 Skills | Workflows | Templates | Plugins               │
├─────────────────────────────────────────────────────────────┤
│ 分类筛选 | 价格筛选 | 评分筛选 | 作者筛选                    │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │
│ │ ⭐ Code Review   │ │ ⭐ JD Analysis  │ │ ⭐ PRD       │ │
│ │ $9.99/月        │ │ $4.99           │ │ Template     │ │
│ │ 150 销售量       │ │ 320 下载量      │ │ Free         │ │
│ │ [预览] [购买]    │ │ [预览] [下载]   │ │ [预览] [使用]│ │
│ └──────────────────┘ └──────────────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ 我的购买 | 我的发布 | 收藏夹                               │
└─────────────────────────────────────────────────────────────┘
```

## 交互设计 (增强版)

### 导航模式
- **侧边栏导航**: 主要导航方式，可折叠
- **面包屑**: 层级导航，显示当前位置
- **命令面板**: Cmd+K 快速访问所有功能
- **全局搜索**: 实时搜索知识、Skills、Workflows
- **快捷键**: 常用操作快捷键支持

### 操作模式
- **右键菜单**: 上下文相关操作
- **拖拽**: 文件、节点、项目拖拽
- **批量操作**: 多选和批量处理
- **键盘操作**: 全键盘导航支持
- **手势操作**: 触摸板手势支持

### 反馈机制
- **加载状态**: 骨架屏、进度条
- **操作确认**: 重要操作二次确认
- **错误提示**: Toast 通知、错误边界
- **成功提示**: 动画反馈、成功通知
- **实时预览**: 编辑时实时预览

### AI 交互
- **智能建议**: AI 驱动的智能推荐
- **自动完成**: 基于上下文的自动完成
- **智能搜索**: 语义搜索和智能匹配
- **AI 辅助**: AI 协助编辑和生成
- **执行反馈**: Agent 执行的实时反馈

## 响应式设计 (优化版)

### 断点系统
```css
/* 移动优先的断点系统 */
--breakpoint-0: 0px;
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### 响应式策略
- **移动优先**: 从小屏幕开始设计
- **渐进增强**: 大屏幕增加功能
- **内容优先**: 重要内容优先显示
- **功能适配**: 不同设备功能适配
- **性能优化**: 移动端性能优化

## 性能优化 (增强版)

### 渲染优化
- **虚拟滚动**: 大列表虚拟滚动
- **懒加载**: 图片、组件懒加载
- **代码分割**: 路由级别代码分割
- **缓存策略**: React Query 缓存
- **服务端渲染**: 关键页面 SSR

### 动画优化
- **GPU 加速**: 使用 transform 和 opacity
- **动画简化**: 减少复杂动画
- **动画取消**: 页面切换时取消动画
- **性能监控**: 监控动画性能
- **降低动画**: 减弱动画效果选项

### 加载优化
- **预加载**: 关键资源预加载
- **压缩**: 资源压缩和优化
- **CDN**: 静态资源 CDN
- **HTTP/2**: HTTP/2 多路复用
- **Service Worker**: 离线支持

## 可访问性 (增强版)

### 键盘导航
- **Tab 顺序**: 合理的 Tab 顺序
- **快捷键**: 常用操作快捷键
- **焦点管理**: 清晰的焦点指示
- **焦点陷阱**: 模态框焦点陷阱
- **跳过链接**: 跳过导航链接

### 屏幕阅读器
- **语义化 HTML**: 使用语义化标签
- **ARIA 标签**: 完整的 ARIA 标签
- **文字描述**: 图标和图片描述
- **状态通知**: 状态变化通知
- **实时区域**: 动态内容实时区域

### 视觉辅助
- **对比度**: WCAG AA 对比度标准
- **字体大小**: 可调节的字体大小
- **颜色辅助**: 不仅依赖颜色
- **动画控制**: 可关闭动画
- **高对比度**: 高对比度模式

## Dark Mode (完美支持)

### 颜色适配
- 完美的深色配色方案
- 不是简单的颜色反转
- 考虑对比度和可读性
- 自适应主题切换

### 自动切换
- **系统跟随**: 跟随系统设置
- **手动切换**: 用户手动切换
- **时间切换**: 根据时间自动切换
- **位置切换**: 根据日出日落切换

### 记忆设置
- **本地存储**: 记住用户选择
- **云端同步**: 跨设备同步
- **默认设置**: 可设置默认主题

## 国际化 (优化版)

### 多语言支持
- **中文**: 主要语言，完美支持
- **英文**: 国际化支持
- **扩展性**: 易于添加新语言
- **RTL 支持**: 从右到左语言支持

### 日期和数字
- **日期格式**: 本地化日期格式
- **数字格式**: 本地化数字格式
- **货币格式**: 本地化货币格式
- **时区处理**: 正确的时区处理

## 插件 UI 支持 (新增)

### 插件组件注册
```typescript
// 插件可以注册自定义组件
interface PluginUIRegistry {
  registerComponent(name: string, component: React.ComponentType): void;
  registerPage(route: string, component: React.ComponentType): void;
  registerPanel(id: string, component: React.ComponentType): void;
  registerMenuItem(item: MenuItem): void;
}
```

### 插件主题
- 插件可以自定义主题
- 支持插件主题继承
- 主题冲突解决机制
- 主题预览功能

### 插件权限 UI
- 权限请求界面
- 权限管理界面
- 权限使用说明
- 隐私保护提示

这个优化后的 UI 架构参考了 Affine 等现代设计系统，建立了完整的设计语言，支持插件生态，为 BeU Workbench 的差异化提供了优秀的用户体验基础。