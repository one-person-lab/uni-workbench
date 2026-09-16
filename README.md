# uni-workbench —— 通用知识库 + 工作台

把「**我知道什么**」和「**我要做什么**」分装成两棵树，并与各领域仓库通过明确边界协作。

| 树 | 回答的问题 | 目录 |
| --- | --- | --- |
| **Knowledge Base** | 我**知道**什么 | `knowledge-base/` |
| **Workbench** | 我**要做**什么 | `workbench/` |

> **本仓库开放的是结构与工具** —— 双树的目录规范、Obsidian 配置、跨项目共享的 Skill，以及内置的本地工作台应用。
> `knowledge-base/` 与 `workbench/` 交付时是**空库**：结构是通用的，内容是个人的。

```
uni-workbench/
├── knowledge-base/      持久知识
│   ├── 00-Inbox/        无差别入口（一切先扔这里）
│   ├── 10-Knowledge/    已消化的知识（核心层）
│   ├── 20-Projects/     项目索引卡（只指向仓库，不复制内容）
│   ├── 30-Resources/    外部资料
│   └── 40-Archive/      冷存放（定期捞回或删除）
└── workbench/           流动任务
    ├── Now/             正在做（WIP 上限 1–3）
    ├── Next/            排队待做
    ├── Later/           以后再说
    ├── Done/            已完成（每周清理）
    └── Cancelled/       已放弃（每季度清理）
```

## 设计取舍

**为什么拆两棵树而不是一个待办清单？**
「知识」与「任务」的生命周期完全不同：知识要长期沉淀、可检索、有来源；任务要快速流动、快速消亡。混在一起，待办会淹没知识，知识会拖累待办。

**为什么给知识库设 5 层而不是无限文件夹？**
层级越少，检索成本越低。`00-Inbox/` 是唯一入口（先收下来再判断），`40-Archive/` 是唯一出口（定期捞回或删除）。中间三层只回答一个问题：这条东西是「已消化」、「待加工」还是「只是索引」。

**为什么 `20-Projects/` 只放索引卡？**
项目正文属于项目仓库。索引卡只写「名称 + 一句话 + 仓库地址 + 状态」，避免同一条信息在两个地方各存一份、然后各自过时。

## 与领域仓库的分工

本仓库只承载**通用层**（跨项目可复用的知识与任务流）。领域专属内容各自成库，不在此重复：

| 领域 | 仓库 |
| --- | --- |
| 自媒体 | `media-hub` |
| 产品 | `product-hub` |
| 职业 / 求职 | `career-hub` |
| 个人网站（对外） | `personal-site` |

## 目录

| 目录 | 角色 |
| --- | --- |
| `knowledge-base/` | 通用知识库（Markdown Vault，五层） |
| `workbench/` | 任务流（五状态任务卡） |
| `engine/` | 内置的本地通用工作台应用（React + Vite，见下） |
| `docs/engine/` | 工作台设计文档 |
| `scripts/` | 数据管道脚本 |
| `skills/` | 跨项目共享 Skill（真身，由各工作台 symlink 加载） |
| `.agents/skills/` | 第三方 Skill 安装目录（gitignored，只提交锁文件） |

### engine/

内置的本地工作台应用，React + Vite，**只监听 `127.0.0.1`**，不部署。

它是双树结构成型之前的历史产物：数据层按当时的目录命名硬编码，页面里也混入了一批领域功能页。双树目前由 Obsidian 直接读写、不经过 engine，所以 engine 与当前结构**尚未对齐** —— 重新设计通用工作台时一并处理。想直接跑起来看是没问题的：

```bash
cd engine && npm install && npm run dev   # http://127.0.0.1:xxxx
```

## 快速开始

两棵树就是纯 Markdown，用任意编辑器读写都行；推荐 Obsidian：

```bash
git clone git@github.com:one-person-lab/uni-workbench.git
# Obsidian → Open folder as vault → 选择 uni-workbench/
```

非知识目录（`engine/`、`docs/`、`scripts/`、`skills/`）已在 `.obsidian/app.json` 的 `userIgnoreFilters` 里排除，不会被索引。

## 许可

MIT，见 [LICENSE](LICENSE)。第三方来源与致谢见 [ATTRIBUTION.md](ATTRIBUTION.md)。
