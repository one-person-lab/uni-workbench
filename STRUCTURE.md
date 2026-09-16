# uni-workbench 结构与边界

两棵树：**Knowledge Base**（`knowledge-base/`，我"知道"什么）+ **Workbench**（`workbench/`，我"要做"什么），
也是所有项目的知识 / 任务总入口。领域专属内容不在此重复，各自成库。

```
uni-workbench/
├── knowledge-base/        ★ 通用知识库（Obsidian Vault），五层
│   ├── 00-Inbox/          无差别入口（一切先扔这里，寿命要短）
│   ├── 10-Knowledge/      已消化的知识（核心层）
│   ├── 20-Projects/       项目索引卡（只指向仓库，不复制内容）
│   ├── 30-Resources/      外部资料（待加工原料）
│   └── 40-Archive/        冷存放（定期捞回或删除）
├── workbench/             ★ 任务流（五状态任务卡）
│   ├── Now/               正在做（WIP 上限 1–3）
│   ├── Next/              排队待做
│   ├── Later/             以后再说（每月复核）
│   ├── Done/              已完成（每周清理）
│   └── Cancelled/         已放弃（每季度清理）
├── engine/                本地通用工作台应用（React + Vite，仅回环地址）
├── docs/engine/           工作台设计文档（product / architecture / plugins / ai）
├── scripts/               数据管道脚本（输出写到消费方目录，不留产物于此）
├── skills/                跨项目共享 Skill 真身（各工作台 symlink 加载，setup-links.sh 恢复）
├── .agents/skills/        第三方 Skill 安装目录（gitignored，仅提交锁文件）
├── .obsidian/             Obsidian 配置（vault 根 = 本仓库，非知识目录已在 app.json 排除）
├── README.md              本仓库定位
├── STRUCTURE.md           本文件
└── AGENTS.md              给 AI 协作者的边界与规则
```

## 两棵树的分工

| 问题 | 树 | 规则 |
| --- | --- | --- |
| 我**知道**什么 | `knowledge-base/` | 只收跨项目、可复用的通用知识；领域知识进各自仓库 |
| 我**要做**什么 | `workbench/` | 只放任务卡；不复制项目正文、不存知识 |

**闭环**：`knowledge-base/00-Inbox/` 是唯一入口 → 分流，「事」进 `workbench/Next/`，「知识」进 `10-Knowledge/` 或 `30-Resources/` → 任务走到 `Done/` → 复盘出的可复用结论回到 `10-Knowledge/`。

## 与领域仓库的分工

| 内容 | 归属 | 原因 |
| --- | --- | --- |
| 自媒体运营 / 文案 / 排期 | `media-hub` | 领域专属，不在此重复 |
| 产品需求 / 迭代记录 | `product-hub` | 领域专属 |
| 简历 / 面试 / 投递 / 作品集 | `career-hub` | 领域专属 |
| 个人网站（对外） | `personal-site` | 领域专属 |
| 跨项目可复用知识 | **本仓库 `knowledge-base/`** | 通用层 |
| 跨项目任务流 | **本仓库 `workbench/`** | 通用层 |

## 复用原则（不要重复造轮子）

- 任何「只服务某一领域」的内容，放进对应的领域仓库，不在 uni-workbench 再存一份。
- `knowledge-base/` 只收**跨项目、可复用**的通用知识（概念 / 方法论 / 框架）。
- `workbench/` 只放任务卡，**不复制**项目正文、不复制知识条目——同一件事只写一处。
- `skills/` 是跨项目共享资产的真身来源，其他工作台用 symlink 引用而非复制。

## 仓库边界

- `knowledge-base/`、`workbench/`、`engine/`、`docs/`、`scripts/` 仅本地运行，不部署；`engine/` 只监听回环地址。
- 公开面只包含**结构与工具**：个人内容、真实运营数据、凭据、本机路径不进入可提交文件。
- 第三方参考仓库整份克隆，仅作外部输入，不作为本仓库作品（出处见 `ATTRIBUTION.md`）。

## engine/ 的当前状态

`engine/` 成型于双树结构之前，与当前目录命名**尚未对齐**：

- 数据层按当时的 vault 路径与目录白名单硬编码，指的是旧命名；
- 页面中混有一批领域功能页，与各领域仓库职责重叠；
- 双树目前由 Obsidian 直接读写，**不经过 engine**。

因此重新设计通用工作台时再一并处理；在此之前改动 engine 需先明确范围（会牵连它的测试文件）。
