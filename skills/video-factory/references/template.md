# 模板同步协议

本文件讲**通用渲染代码与产品实例之间怎么划界**，以及为什么不用 submodule / npm 包。

## 一、三类文件

任何视频工程（实例）只有三类文件：

| 层 | 文件 | 谁写 | 同步行为 |
|---|---|---|---|
| **模板代码** | `src/koubo/Koubo.tsx`、`src/koubo/index.ts` | video-factory | 每次 `sync:template` **覆盖** |
| **生成产物** | `src/koubo/brand.generated.ts` | `gen-brand-theme.mjs` | 每次 `sync:template` **重编** |
| | `src/generated/product.ts` | `pull-product.mjs` | 每次 `pull` **重拉** |
| **实例数据** | `brand-kit.json`、`sources.json`、`koubo-lines.json`、`src/koubo/koubo-timing.json` | 人 / koubo-video | **永不触碰** |

两个生成产物来自**两个不同的真相源**，别混：

| 产物 | 真相源 | 命令 | 回答的问题 |
|---|---|---|---|
| `brand.generated.ts` | `brand-kit.json`（视频自己的） | `sync:template` | 这条片子**要**长什么样 |
| `product.ts` | 产品仓库的 `theme.css` | `pull` | 产品**实际**长什么样 |

推论：

- 在实例里改渲染代码 = 白改，下次 sync 就没了 → 要改去改模板
- 在实例里改 `product.ts` = 白改，下次 pull 就没了 → 要改去改**产品仓库**
- 换品牌 = 改 `brand-kit.json` + sync，不碰任何代码
- 换产品数据源 = 改 `sources.json` 的 `product.root`，不碰任何代码
- 两个生成产物都建议**入库**：确定性产物，保证 clone 下来不装 skill 也能渲染

## 二、为什么不用 submodule 或 npm 包

考虑过的三种方式：

| 方式 | 为什么不用 |
|---|---|
| git submodule | 各实例本就分散在不同仓库（示例产品、BuildHub…），submodule 把耦合引进了版本管理；而且 Remotion 打包器对 `src/` 之外的入口支持差 |
| 发一个 npm 包 | 改一行 CSS 要发包 + 升版本 + 全实例升级；私有包还要配 registry。原型阶段的迭代速度代价太高 |
| **文件同步（采用）** | Remotion 需要工程内真实存在的 `src/`；一条命令同步，契约清晰，零构建复杂度。代价是「实例里的模板代码是复制的」——用「勿手改」注释 + 自检（sync 输出应全是 `·` 无变化）兜住 |

等模板稳定、实例超过 5 个、需要语义化版本控制时，再考虑抽成 npm 包。现在不划算。

## 三、加一个新产品的完整流程

```bash
# 1. 起工程（模板代码 + 品牌注入一次到位）
node ~/workspace/code/one-person-hub/uni-workbench/skills/video-factory/scripts/init-video-project.mjs \
     promo-video-<product> --dir ~/workspace/code/one-person-hub
cd ~/workspace/code/one-person-hub/promo-video-<product> && npm install

# 2. 写文案
vim koubo-lines.json          # 逐句一行，6–18 字/句

# 3. 生成配音 + 时间轴（koubo-video skill 的脚本，已复制到 scripts/）
npm run gen:audio:koubo

# 4. 渲染
npm run render:koubo
```

`init-video-project.mjs` 会顺带写好 `package.json`（含 `sync:template` / `gen:brand` / `pull` / `render:koubo`）、`remotion.config.ts`、`Root.tsx`、`sources.json` 骨架、`.gitignore`。

> `VIDEO_FACTORY` 环境变量可覆盖工厂位置，默认按同级相对路径 `../uni-workbench/skills/video-factory` 找。

## 四、模板的边界

模板**只做口播画面**。以下刻意留空，因为产品间差异太大或不该由渲染层决定：

- 多幕宣传片（如示例产品的 8 幕 Promo）——结构因产品而异，留在各实例的 `src/video/`、`src/scenes/`
- 音频合成与时间轴（配乐、音效）——归 `koubo-video` skill 与各实例的 `scripts/gen-audio.mjs`
- 真实界面截图管线（`scripts/app-capture/`）——归各实例
- **产品令牌拉取**——机制归 `scripts/pull-product.mjs`（通用），声明归各实例的 `sources.json`。见 `pull-product.md`
- 发布（上传、草稿、四平台字段）——归 `video-publisher` skill

`remotion-template` 的唯一职责：**给定 timing + brand，渲染出一条合规的竖屏口播**。
