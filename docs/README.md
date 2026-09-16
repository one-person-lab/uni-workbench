# 文档索引

这里只有**设计与分析**文档。仓库分层与边界看根目录 [`STRUCTURE.md`](../STRUCTURE.md)。

## engine/ —— 本地 AI 工作台

| 分类 | 文件 | 主题 |
| --- | --- | --- |
| product | [product-design.md](engine/product/product-design.md) | 产品设计：目标用户、模块边界、迭代优先级 |
| product | [product-architecture.md](engine/product/product-architecture.md) | 产品架构：能力闭环 Knowledge→Skill→Workflow→Agent |
| product | [asset-workbench-vision.md](engine/product/asset-workbench-vision.md) | 产品愿景 |
| architecture | [architecture-analysis.md](engine/architecture/architecture-analysis.md) | 原项目（person_dashboard）架构分析 |
| architecture | [asset-workbench.md](engine/architecture/asset-workbench.md) | 核心架构：能力资产模型与执行引擎 |
| architecture | [data-architecture.md](engine/architecture/data-architecture.md) | 数据架构：Markdown + YAML/JSON + Git |
| architecture | [ui-architecture.md](engine/architecture/ui-architecture.md) | UI 架构与页面骨架 |
| architecture | [skill-architecture.md](engine/architecture/skill-architecture.md) | Skill 架构 |
| plugins | [plugin-architecture.md](engine/plugins/plugin-architecture.md) | 插件系统架构 |
| plugins | [plugin-ecosystem-commercialization.md](engine/plugins/plugin-ecosystem-commercialization.md) | 插件生态与商业化策略 |
| ai | [architecture.md](engine/ai/architecture.md) | AI 总体架构 |
| ai | [ai-integration-analysis.md](engine/ai/ai-integration-analysis.md) | AI 集成方式分析 |
| ai | [agent.md](engine/ai/agent.md) · [rag.md](engine/ai/rag.md) · [skill.md](engine/ai/skill.md) · [tool.md](engine/ai/tool.md) · [demo.md](engine/ai/demo.md) | 各子模块详细设计 |
| （根） | [public-release-boundaries.md](engine/public-release-boundaries.md) | 工作台开源时的边界清单 |

> 这批文档写于 engine 成型期，其中的项目名、目录命名与当前双树结构**尚未对齐**——
> 它们是设计史料，不是现状描述。现状以根 `README.md` / `STRUCTURE.md` 为准。

## _drafts/

`_drafts/2026-08-21/` 存的是同一批文档的早期草稿，只为追溯写法变化，不参与任何构建。

## images/

`images/readme/` 是 README 配图。截图属于**可能泄露本地路径或个人数据**的资产，
若要更换，必须先逐张目视检查再决定是否留用。
