# brand-kit 注入指南

怎么把 `brand-kit.json` 喂进视频生产线。

**当前状态**：口播（Remotion）一侧**已完全参数化**——零改代码，只换 brand-kit；演示视频（`product-demo-video`）一侧仍半写死，需要手动映射。

## 一、口播（Remotion · 已参数化）

品牌不再写死在组件里。链路是：

```
brand-kit.json  --gen-brand-theme.mjs-->  src/koubo/brand.generated.ts  -->  Koubo.tsx 读 brand.xxx
```

`Koubo.tsx` 里出现的品牌元素全部来自 brand-kit：

| 画面位置 | 取自 |
|---|---|
| 顶部圆形徽标字符 | `badge`（默认 ✦） |
| 顶部品牌名 | `name` |
| 右上角小字 | `barRight`（为空则隐藏） |
| 背景渐变色阶 / 地平线暖光 | `colors.primary` 推导（或用 `video.palette` 精确覆盖） |
| 当前句字幕颜色 / 落版大字 / 进度条渐变 | `colors.primary` → `colors.bright \| accent` |
| 底部装饰刻度数量 | `video.decor`（`none` 或 `cells × N`） |
| 落版大字 / CTA / 合规标注 | `name` / `outroCta` / `aiLabel` |
| 配音文件 | `video.audioFile`（默认 `koubo/narration.wav`） |

操作：

```bash
vim brand-kit.json      # 改品牌
npm run sync:template   # 重编主题（同时把模板代码同步到最新）
npm run render:koubo
```

### 深底与浅底的分工

模板画面是深底（"夜 → 晨"渐变），`colors.bg` 是给 **demo 浅色场景**用的，两者不冲突：
`bg0/bg1/bg2/horizon` 未在 `video.palette` 里指定时，会由 `colors.primary` 混入深底基色（`#0b1421`）推导——
换一个蓝色品牌，背景自然变成冷蓝夜，换金色品牌就变成暖夜。

要**像素级复刻**已有片子（比如把一个已定稿的片子参数化），就把原主题的色值填进 `video.palette`
（参考 `examples/acme.brand-kit.json`，它是从 `app-promo-video/src/video/theme.ts` 反推的）。

## 二、演示视频（product-demo-video · 仍半写死）

品牌出现在 `scenes.json` 的 `title`/`subtitle`（intro/outro 场景）和 `record-demo.mjs` 写死的字幕条
（`GREEN = (74,222,128)` 分隔线 + 白字）。映射做法：

1. `scenes.json` 的 `intro.title` = `name`、`intro.subtitle` = `slogan`；`outro.title` = `outroCta`（默认『现在就来试试 {name} {domain}』）、`outro.subtitle` = `domain`
2. `record-demo.mjs` 里的 `GREEN` 改为 brand-kit 的 `colors.accent`（或 `primary`）RGB；字幕条底色、文字色按 `colors.ink` / `bg` 调
3. 角标（demo 的 `rightBadge`）填 `name` 或留空
4. 给 outro 场景加一行 `aiLabel` 字幕（合规）

> 把这套也真正参数化是下一步（`record-demo.mjs` 顶部读 `BRAND_KIT`，`GREEN` 等改为 `BRAND.colors.accent`，`scenes.json` 支持 `{{brand.name}}` 占位符）。做完后两个子 skill 就都是零改代码换品牌了。

## 三、各产品 brand-kit 放在哪

| 产品 | 路径 |
|---|---|
| 示例产品 | `one-person-hub/media-hub/videos/app-promo-video/brand-kit.json` |
| BuildHub | `build-hub/.workbuddy/brand-kit.json`（还没起视频工程，先寄存在产品仓） |
| uni-workbench | `promo-video-uni/brand-kit.json` |

**产品还没有视频工程时**：先把 brand-kit 寄存在产品仓 `<product>/.workbuddy/brand-kit.json`，
起工程时用 `init-video-project.mjs --from <该文件>` 拷过去（`build-hub/.workbuddy/brand-kit.json` 就是这个用法）。

**放各产品域内，不进 `video-factory` skill 仓库**（那是产品专属资产，违反 skills/README 的自包含军规）。`video-factory/examples/` 只放模板示例。

## 四、模板本身的迁移路线

见 `template.md`。当前用「文件同步 + 明确契约」，等模板稳定、实例超 5 个再考虑抽 npm 包。
