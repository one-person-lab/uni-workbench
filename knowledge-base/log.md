# 变更日志

只追加，不回改。格式见 `AGENTS.md` 第 7 节。

## [2026-09-16] refactor | 知识库结构重置为五层

- Source: 用户决策（空库重启：新建五层 → 老目录归档 → 不做大规模搬迁 → 新信息按规则进入）
- Pages created: `00-Inbox/_说明.md`、`10-Knowledge/_说明.md`、`20-Projects/_说明.md`、`30-Resources/_说明.md`、`40-Archive/_说明.md`
- Pages updated: `README.md`、`AGENTS.md`（改为五层 Schema）
- 结构变更: 新建 `00-Inbox` / `10-Knowledge` / `20-Projects` / `30-Resources` / `40-Archive`；旧 `10_raw/` 与 `wiki/` 整体移出
- 归档去向: 移出本仓库的本地归档目录（不作为知识来源）
- 删除: `wiki/concepts/合成演示数据.md`、`wiki/frameworks/演示数据生成原则.md`（无价值的 demo 元文件）
- Key conclusions: 旧 wiki 的 34 篇概念与框架是 AI 合成内容（全标 `demo: true`、来源为空），不是确认过的知识，因此**不做大规模搬迁**；`10-Knowledge/` 从零开始，只装真正消化过的内容
- Conflicts: 无
- Open questions: `20-Projects/` 的项目索引卡待项目清单稳定后逐个补齐

## [2026-09-16] refactor | 目录改名 kb → knowledge-base，并确立 Workbench 姊妹树

- Source: 用户决策（uni-workbench = Knowledge Base + Workbench 两棵树）
- 结构变更:
  - `kb/` 改名为 `knowledge-base/`（五层结构与内容原样保留）
  - 新增姊妹树 `../workbench/`：`Now` / `Next` / `Later` / `Done` / `Cancelled` 五个状态目录，各带 `_说明.md`
- Pages created: `../workbench/README.md`、`../workbench/_模板.md`、`../workbench/{Now,Next,Later,Done,Cancelled}/_说明.md`
- Pages updated: `README.md`（Obsidian vault 根改为 `uni-workbench/`，两棵树同库互链）、`AGENTS.md`（补姊妹树分工、engine 状态说明）
- Key conclusions: `00-Inbox/` 成为知识库与任务流的**共同入口** —— 判明是「事」进 `workbench/Next/`，是「知识」留在本库；同一件事只写一处，避免两棵树互相复制。任务卡粒度为单位任务，不装项目、不装知识。
- Conflicts: 无
- Open questions: `engine/` 与双树结构尚未对齐（旧命名硬编码 + 领域页面重复），待通用工作台重新设计

