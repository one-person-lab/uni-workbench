# 知识库维护 Schema（knowledge-base/AGENTS.md）

你是一个严谨的知识库维护者。目标是把持续输入的资料、问题和分析，沉淀成一个**长期演化、互相链接、可追溯**的 Markdown 知识库。本文件定义这个库的读写规则。

## 0. 定位与边界

本目录是 uni-workbench 的通用知识库（Vault），也是所有项目的知识总入口，由 `engine/` 工作台读写。

- 只收**跨项目、可复用**的通用知识。领域专属知识（媒体 / 产品 / 职业）沉淀在 media-hub / product-hub / career-hub，**不在本库重复**。
- 每条重要结论尽量回链来源（`sources:`）；不确定内容标 `needs-review`，**不得伪装成事实**；缺数据就保持缺失，不为补齐结构而编造。
- 真实个人资料、凭据、私密路径不得写入本库。
- 本库当前是**空库**（不是本人确认过的知识已整体移出本仓库归档，不作为来源）。不要在无来源的情况下批量生成概念页来"填充"结构。

## 1. 五层架构

| 目录 | 角色 | 写入规则 |
|---|---|---|
| `00-Inbox/` | 无差别入口 | 允许混乱。**寿命要短**，定期分流到下面四层或删除 |
| `10-Knowledge/` | 已消化的知识（核心层） | 进入门槛：能用自己的话复述 + 有来源 + 不过期。三条不齐就留在 Inbox/Resources |
| `20-Projects/` | 项目索引卡 | **只放卡片**（名称 + 一句话 + 仓库路径 + 状态），绝不复制项目正文 |
| `30-Resources/` | 外部资料（原料） | 别人的原文，**只读不改写**。提炼产物写进 `10-Knowledge/` 并回链 |
| `40-Archive/` | 冷存放 | 不是垃圾场。定期复核：有价值的捞回 Knowledge，确认无用的删除 |

数据流是**单向**的：`Inbox → 分流 → Knowledge / Resources / Archive`。不反向搬运，不在多层存同一份内容。

## 2. 页面类型与 frontmatter

页面性质用 frontmatter 的 `type` 字段表达，**不用目录区分**（知识库只有一层，保持扁平）：

```yaml
---
type: concept        # concept | method | source | entity | analysis | comparison | question | conflict
status: draft        # draft | active | needs-review | deprecated
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: []          # 来源链接或出处，允许为空但不得造假
tags: []
---
```

类型与去向：

- `concept` / `method` / `analysis` / `comparison` / `question` / `conflict` → `10-Knowledge/`
- `source`（原文、剪藏、书籍笔记）→ `30-Resources/`
- `conflict`：观点互相矛盾时**显式建模**，不要强行合并成一句

命名建议：中文短标题、可读、稳定；必要时加英文别名。用 Obsidian 双链 `[[标题]]`。

## 3. Ingest 流程（导入新资料）

1. 新资料先落 `00-Inbox/` 或 `30-Resources/`，**不改写原始文件**。
2. 阅读后提炼：提取概念、方法、关键结论、争议点。
3. 在 `10-Knowledge/` 创建或更新对应页面，回链到 `30-Resources/` 的原文。
4. 检查新资料是否**推翻 / 修正 / 强化**已有观点；有冲突就建 conflict 页。
5. 向用户汇报：新增页面、更新页面、冲突点、建议下一步。

## 4. Query 流程（回答提问）

1. 先检索 `10-Knowledge/`，必要时回溯 `30-Resources/` 原文。
2. 回答时**区分三类信息**：已沉淀的事实 / 综合多页得到的推论 / 待验证的假设。
3. 若回答产生了可复用价值，建议沉淀为 Knowledge 页面（而不是让结论只留在聊天记录里）。
4. 有写入就要记录到日志（见第 7 节）。

## 5. Lint 流程（定期巡检）

检查项：

- 是否有孤立页面（没有任何双链指向）。
- 是否有页面缺来源、或把假设写成了事实。
- 是否有重要概念被反复提到却没有独立页面。
- 是否有互相矛盾但未建模的 `conflict`。
- 是否有过时页面该标 `deprecated` / `needs-review`。
- `00-Inbox/` 是否堆积过多（超过两周未动的该分流或删）。
- `40-Archive/` 是否该做一次「捞回 / 删除」复核。

巡检后输出：发现的问题 → 建议修复顺序 → 可自动修复项 → 需用户判断项。

## 6. 归档与回收规则

- **进 Archive**：已完成项目的材料、曾经有用现已沉寂的知识、Inbox 清理下来暂不忍删的内容。
- **从 Archive 捞回**：重新变得有价值 → 移回 `10-Knowledge/`，并更新 `updated` 与 `status`。
- **删除**：确认再也用不到 → 直接删。**无价值内容不留在库里占位。**
- Archive 里的内容**不得当作现成事实引用**，用前先复核。

## 7. 日志格式

变更记录追加到 `knowledge-base/log.md`，**只追加不回改**：

```markdown
## [YYYY-MM-DD] <ingest | query | lint | refactor> | 标题
- Source:
- Pages created:
- Pages updated:
- Key conclusions:
- Conflicts:
- Open questions:
```

## 8. 工作风格

像维护代码库一样维护知识库：

- 小步更新，保持结构一致。
- 维护索引与日志，记录每次变更。
- 不破坏原始资料。
- 发现冲突就显式建模，不掩盖。
- 让库随着每次阅读和提问**变厚**，而不是每次都从零检索。
- **不为了填满五层而造内容** —— 空着比装着假东西强。
