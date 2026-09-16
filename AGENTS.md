# uni-workbench 协作规则

两棵树：**Knowledge Base**（`knowledge-base/`，我"知道"什么）+ **Workbench**（`workbench/`，我"要做"什么），
也是所有项目的知识 / 任务总入口。改动前先读 `STRUCTURE.md`。

## 定位与分工

- 本仓库只承载**通用层**：跨项目可复用的知识（`knowledge-base/`）、跨项目任务流（`workbench/`）、工作台能力（`engine/`）、跨项目共享资产（`skills/`）。
- 领域专属内容（自媒体 / 产品 / 职业 / 个人网站）各有仓库（media-hub / product-hub / career-hub / personal-site），**不在此重复**。任何只服务某一领域的内容请放进对应仓库。

## 知识库边界（`knowledge-base/`）

- 五层结构：`00-Inbox/`（无差别入口，唯一入口）→ 分流到 `10-Knowledge/`（已消化知识）/ `30-Resources/`（外部资料）→ `40-Archive/`（冷存放，定期捞回或删除）；`20-Projects/` **只放项目索引卡**，不复制项目内容。
- 本库默认是**空库**，结构先于内容。不要在无来源的情况下批量生成概念页来"填充"结构。
- 每条重要结论尽量回链来源（`sources:`）；不确定内容标 `needs-review`，不得伪装成事实；缺数据就保持缺失，不为补齐结构而编造。
- 维护规范见 `knowledge-base/AGENTS.md`（LLM Wiki 维护 Schema）。

## 任务流边界（`workbench/`）

- 五状态：`Now/`（正在做，WIP 上限 1–3）→ `Next/`（排队）→ `Later/`（以后再说）→ `Done/` / `Cancelled/`（缓冲区）。
- **这里只放任务卡**，不复制项目正文、不存知识。项目索引在 `knowledge-base/20-Projects/`，知识在 `knowledge-base/10-Knowledge/`。
- `Done/` 每周清理、`Cancelled/` 每季度清理，**默认动作是删除**：产出归仓库、结论归 `10-Knowledge/`，卡片本身不留。
- 详见 `workbench/README.md` 与各状态目录的 `_说明.md`。

## 目录归位

- 新的领域数据 → 对应领域仓库，**不要**顺手复制进本仓库。
- 新的设计文档 → `docs/engine/{product,architecture,plugins,ai}/`，并在 `docs/README.md` 登记一行。
- 第三方克隆与安装的 Skill → 立即加入 `.gitignore`，并在 `ATTRIBUTION.md` 记出处；只提交锁文件，绝不提交载荷。
- 数据管道脚本（`scripts/`）输出写到消费方目录，不留产物在 `scripts/` 内。

## engine/ 的当前状态

- `engine/` 成型于双树结构之前：vault 路径与目录白名单按旧命名硬编码，与新结构**不一致**。
- 它含一批领域页面，与领域仓库职责重叠。
- **改动 engine 前先明确范围** —— 会牵连它的测试文件。等通用工作台重新设计时一并处理。
- `knowledge-base/` 与 `workbench/` 由 Obsidian 直接读写，不依赖 engine。

## 仓库边界

- `knowledge-base/`、`workbench/`、`engine/`、`docs/`、`scripts/` 永不部署，仅本地 / 回环地址（127.0.0.1）。
- 公开面只包含结构与工具；个人内容、真实运营数据、凭据、私密目录名、本机路径不得进入任何可提交文件。
- 第三方参考仓库保持 gitignored，只作外部输入，不作为本仓库作品。

## 共享资产

- `skills/` 是跨项目 Skill 真身，由各工作台 symlink 加载；`skills/setup-links.sh` 用于恢复链接。
