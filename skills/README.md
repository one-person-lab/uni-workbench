# skills/ — 个人 skill 单一事实源

> 跟人走的 skill 都住这里，真身进 git，加载位放 symlink。换电脑 = clone 本仓库 + `bash skills/setup-links.sh`。

## 自包含军规（给未来开源留的路）

1. **一个目录 = 一个 skill**：`<name>/SKILL.md` + 该 skill 的全部资产，仅此而已
2. **禁止引用仓库外路径**：skill 内不依赖本仓库其他目录、不依赖 `~/` 下的固定文件（用户的密钥/配置一律走环境变量或在 setup 时由用户自备）
3. **禁止 skill 之间互相引用**：需要共享的内容提出来放公共文档，或各自复制
4. 满足以上三条，任何一个目录将来都能 `git subtree split` 独立成公开仓库，零改造成本

## 作用域规则（放哪一层）

- **通用方法论 / 跟人走** → 本仓库 + symlink 到 `~/.workbuddy/skills/`（或 CLI 的 `~/.claude/skills/`）
- **写死某项目路径 / 领域约定** → 留在该项目的 `<workspace>/.workbuddy/skills/`，**不进本仓库**
- **为共享而复制 = 分叉**，禁止；要么上移作用域，要么 symlink
- 开源毕业：某个 skill 长出自己的文档 / issue / 社区时，split 成独立仓库，消费方用 `skills-lock.json` 引用

## 目录清单

| 目录 | 加载位 | 说明 |
|---|---|---|
| `neo-brutalism/` | `~/.workbuddy/skills/` | 设计规范（token/组件/强度分级） |
| `md-vault-workbench/` | `~/.workbuddy/skills/` | markdown vault → 可视化工作台方法论 |
| `koubo-video/` | `~/.workbuddy/skills/` | 口播文案 → 9:16 短视频（say + Remotion） |
| `authed-site-harvest/` | `~/.workbuddy/skills/` | 登录态后台数据采集（ego-browser） |
| `app-store-research/` | `~/.workbuddy/skills/` | App Store 竞品实测（评分/定价/评论 → 产品决策），零依赖脚本 |
| `product-demo-video/` | `~/.workbuddy/skills/` | **第三方**（ClawHub xiazai77, MIT-0）改造版：浏览器产品演示视频（录操作 + edge-tts 配音 + PIL 中文字幕 + FFmpeg 合成）。已做 macOS 适配（自起 Chrome + connect、边操作边录、场景外置 JSON、去全局安装脚本），踩坑记录见其 `references/macos-adaptation.md` |
| `video-publisher/` | `~/.claude/skills/` | 多平台视频发布（只做到草稿 READY）；账号配置在 `~/.config/video-publisher/`，**不入库** |
| `video-factory/` | `~/.workbuddy/skills/` | 通用视频工厂编排层：聚合 koubo-video / product-demo-video / video-publisher 三件套，以 brand-kit 注入多产品皮肤 |

`ego-browser/` 不在仓库：由 ego 工具自装于 `~/.local/share/ego/ego-skills`，两侧加载位本就是 symlink。

## 新机器恢复

```bash
git clone git@github.com:one-person-lab/uni-workbench.git
cd uni-workbench/skills && bash setup-links.sh
# 另需自装：ego-browser（ego 工具）、ffmpeg（koubo-video / video-publisher 依赖）
```

## identity/

`../identity/` 存身份三件套（IDENTITY / SOUL / USER）与用户级 `MEMORY.md`，同样 symlink 回 `~/.workbuddy/`。
