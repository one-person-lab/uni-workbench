# Attribution & Third-party notices

## engine/ 的来源

`engine/` 基于 [oyorf/person_dashboard](https://github.com/oyorf/person_dashboard)（MIT License），
在其之上重做了产品架构、Skills / Workflows 模块、设计系统与 Agent 集成。

- 原仓库：<https://github.com/oyorf/person_dashboard>
- 原许可：MIT License
- 原作者：Personal AI Knowledge Workspace contributors

本仓库继续沿用 MIT License。

## 未随本仓库分发的内容

- **ai-interview-guide** — <https://github.com/guocong-bincai/ai-interview-guide>（作者 guocong）。
  曾作为本机数据管道的外部输入存在，整目录已被根 `.gitignore` 排除，不随本仓库分发，
  也不得作为本人作品呈现。由它派生的知识条目在 `engine/public/data/interview-knowledge.json`
  中以 `sourceRepository` 标注来源。

## 安装的第三方 Skill（不分发）

- **finesse-ui** — `mouse-lin/finesse-skill`（GitHub），安装在 `.agents/skills/finesse-ui/`。
  该目录已被 `.gitignore` 排除；来源与内容哈希记录在 `skills-lock.json`（该文件入库）。
