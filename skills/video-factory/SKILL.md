---
name: video-factory
description: 通用视频工厂编排层。当用户要为某个产品批量产出短视频（口播/产品演示）并发布到多平台时使用。聚合 koubo-video（口播）、product-demo-video（演示录屏）、video-publisher（四平台草稿）三件套，并用 remotion-template 提供品牌无关的口播渲染模板，以 brand-kit（每产品一份品牌包）为唯一入参，让同一套渲染管线服务多个产品、各换各的品牌皮肤。触发：「给 XX 产品做条视频」「批量产出短视频」「视频规模化」「视频工厂」「多产品共用一套视频生产线」。
agent_created: true
license: MIT
---

# 视频工厂（通用编排层）

一套**产品无关**的短视频生产线。核心思想：**渲染代码只写一份，每个产品用一份 brand-kit 换皮肤。**

```
产品工程 (app-promo-video / promo-video-buildhub / …)
├── brand-kit.json          ← 视频自己的品牌皮肤（唯一需要为新产品写的东西）
├── sources.json            ← 从产品仓库拉什么（拉取型内容的声明）
├── koubo-lines.json        ← 文案（内容资产）
└── src/
    ├── koubo/              ← Koubo.tsx 由本 skill 的 remotion-template 同步而来（勿手改）
    │                          brand.generated.ts 由 brand-kit.json 编译而来
    └── generated/          ← product.ts 由 sources.json 拉取而来（勿手改）
```

## 五个部件

| 部件 | 角色 | 位置 |
|---|---|---|
| `remotion-template/` | **口播渲染模板**（品牌无关的 Remotion 代码） | 本 skill 内 |
| `scripts/init-video-project.mjs` | 一分钟起一个新的品牌视频工程 | 本 skill 内 |
| `scripts/sync-template.mjs` | 把模板代码同步到工程 + 按 brand-kit 重编主题 | 本 skill 内 |
| `scripts/gen-brand-theme.mjs` | `brand-kit.json` → `src/koubo/brand.generated.ts` | 本 skill 内 |
| `scripts/pull-product.mjs` | 按 `sources.json` 从产品仓拉令牌 → `src/generated/product.ts` | 本 skill 内 |

### 三件套（子 skill，各自自包含，禁止互相引用）

| 子 skill | 产出 | 触发 |
|---|---|---|
| `koubo-video` | 9:16 竖屏口播的**配音 + 时间轴**（`gen-koubo-audio.mjs`） | 「做条口播」「文案变视频」 |
| `product-demo-video` | 产品演示录屏（Puppeteer + edge-tts + PIL 字幕） | 「演示视频」「录屏」 |
| `video-publisher` | 小红书/抖音/B站/视频号 草稿（停在发布按钮前） | 「发到小红书」「准备发布」 |

> 分工边界：**koubo-video 管音频与时间轴，remotion-template 管画面**。两者在视频工程里通过 `koubo-timing.json` 对接，互不引用。

## brand-kit（入参）

每个产品一份 JSON，结构见 `brand-kit.schema.json`，示例见 `examples/`。

| brand-kit 字段 | 喂给 | 怎么用 |
|---|---|---|
| `name` / `slogan` / `outroCta` | 口播模板 | 顶部品牌条、落版大字、落版 CTA |
| `badge` / `barRight` | 口播模板 | 品牌条左侧符号、右上角小字（如「21 天 · 小行动」） |
| `colors.primary` / `accent` | 口播模板 | 主色 / 进度条渐变亮色；背景色阶自动从 primary 推导 |
| `video.palette` | 口播模板 | **可选**：需要像素级复刻已有片子时精确覆盖背景/光晕/方格色 |
| `video.decor` | 口播模板 | 底部装饰：`none`（默认，只留进度条）或 `cells × N`（如 21 天方格） |
| `aiLabel` | 口播模板 | 落版合规标注（2026 各平台强执行 AI 溯源） |
| `colors.ink` / `bg` | product-demo-video | 演示视频的字幕条底色与文字色 |
| `logoPath` / `domain` | 两路 | demo 的面板落版、outro CTA 域名 |

> ⚠️ `product-demo-video` 一侧的品牌参数**仍半写死**（`record-demo.mjs` 里的 `GREEN`）。口播一侧已完成真正参数化。

## 两个入参，别搞混

| | `brand-kit.json` | `sources.json` |
|---|---|---|
| 管什么 | 视频**自己的**品牌皮肤 | 从**产品仓库**拉什么 |
| 谁写 | 视频作者 | 视频作者 |
| 来源 | 无（原创） | 产品仓（拉取） |
| 产物 | `src/koubo/brand.generated.ts` | `src/generated/product.ts` |
| 命令 | `npm run sync:template` | `npm run pull` |

一句话：**brand-kit 是「我要长什么样」，sources 是「产品长什么样」。**
产品界面色（卡片底 / 标签 / 状态色）走 pull，绝不手抄。详见 `references/pull-product.md`。

## 标准工作流

### A. 新产品从零起一条视频线

```bash
node <skill>/scripts/init-video-project.mjs promo-video-<product> \
     --dir ~/workspace/code/one-person-hub \
     --from <product>/brand-kit.json      # 可省，省了用空白模板
cd promo-video-<product> && npm install
```

### B. 已有工程改品牌

```bash
vim brand-kit.json            # 改名称/主色/落版文案
npm run sync:template         # 重编 brand.generated.ts（模板代码一并同步到最新）
npm run gen:audio:koubo       # 改过文案才需要：重生成配音 + 时间轴
npm run render:koubo
```

### B'. 产品改版后同步界面色

```bash
npm run pull:check            # 先看有没有漂移（退出码非 0 = 有）
npm run pull                  # 拉取产品令牌 → src/generated/product.ts
npm run dev                   # 抽帧看品牌色/卡片/标签是否跟着变了
```

`pull` 是幂等的：令牌没变时产物字节不变，可安全入库。

### C. 改渲染逻辑（影响所有产品）

1. 改 `remotion-template/src/koubo/Koubo.tsx`
2. 到每个实例跑 `npm run sync:template`
3. **抽帧核对**：至少看首帧、中段、落版帧（koubo-video 的铁律）

### D. 演示视频 / 发布

演示走 `product-demo-video`（brand-kit 映射见 `references/brand-kit.md`）；发布走 `video-publisher`，草稿停在发布按钮前，人工点发布。

## 硬性规则

1. **brand-kit 是产品专属资产**，放各产品工程根目录，不进本 skill 仓库（本 skill 只放 `examples/` 模板）
2. **实例里不许手改模板代码**（`src/koubo/Koubo.tsx`、`index.ts`）——改了下次 sync 就没了。要改就改模板再同步
3. **实例数据文件永不覆盖**：`koubo-timing.json`（配音产出）、`brand-kit.json`、`sources.json`（人工维护）
4. **产品界面令牌一律 pull，禁止手抄**——`src/generated/product.ts` 由 `sources.json` 生成、**禁止手改**、**入库**
   （理由：克隆即可渲染 / 可 diff / 可回滚。要改值就改产品仓再 `npm run pull`）
5. `brand.generated.ts` **入库**（确定性产物，保证克隆即可渲染、不用先装 skill）
6. **渲染前先 `pull:check`**：有未拉取的漂移就渲染，等于用旧界面冒充产品现状
7. 发布必须停在发布按钮前，原创依据需用户确认（video-publisher 铁律）
8. 2026 合规：各平台强执行 AI 溯源标注，漏标限流——`aiLabel` 默认「AI 生成」，落版必须显示
9. 品牌主色是**深底视频**的锚点：模板背景是「夜→晨」的深色渐变，`colors.bg` 是给 demo 的浅色场景用的，两者不冲突

## 自检

- [ ] 这份视频用的是正确产品的 brand-kit（名称/落版文案/主色/装饰数无一错）
- [ ] `npm run pull:check` 通过（产品令牌无未拉取的漂移）
- [ ] 实例的 `src/koubo/Koubo.tsx` 与模板一致（`sync:template` 输出全是 `·` 无变化）
- [ ] 落版带品牌署名 + AI 标识
- [ ] 抽帧看过：首帧、中段、落版帧
- [ ] 换产品只换了 brand-kit + sources，没改渲染管线
- [ ] 发布草稿 READY，停在按钮前
