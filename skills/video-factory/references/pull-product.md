# 拉取层：product.ts

> 解决的病：**视频工程里手抄产品设计令牌 = 造了一份注定漂移的第二副本。**
> 产品改一次主色，视频不会知道；等发现时，已投放的素材和产品早就对不上了。

## 为什么要有这一层

`brand-kit.json` 管的是「视频自己的品牌皮肤」，它服务的是口播画面（深底 + 品牌金）。
但一支产品宣传片还要用**产品自己的界面配色**——卡片底色、标签色、状态色、文字层级。
这些值的唯一真相在**产品仓库**里（`common/theme.css` 的 `.theme-dark` 块，注释写着"禁止再出现写死的颜色"）。

视频工程过去把这份令牌手抄成 `src/video/theme.ts`，顶部还写着"与 theme.css 保持一致"。
**那句话本身就是漂移的判决书**——没有任何机制保证它一致。

## 三类内容，只有第一类该 pull

| 类别 | 判据 | 例子 | 策略 |
|---|---|---|---|
| **拉取型** | 产品已有，不该有第二份 | 设计令牌、卖点文案、版本号 | 渲染前 `npm run pull` → `src/generated/*.ts` |
| **快照型** | 要刷新，但需冻结版本 | App 真机截图 | 手动 `capture`，产物按 tag 冻结 |
| **创作型** | 视频自己的创作，产品没有 | 分幕结构、镜头节奏、口播编排、晨光地平线色 | 留在视频工程，人写 |

**反过来的三条边界**（防止过度实时）：

1. 叙事编排是创作资产，不该被产品迭代牵着走
2. 已发布素材必须可复现（需要版本锚点）
3. 已投放素材须对得上当时的界面，否则有「宣传与实际不符」的合规风险

所以 pull 只覆盖第一类，且产物是**快照**（入库、可 diff、可回滚），不是实时 API。

## 用法

```bash
npm run pull          # 拉取并写入 src/generated/product.ts
npm run pull:check    # 只体检；有漂移退出码 1（可挂 CI / pre-commit）
```

输出示例：

```
  ── tokens  (common/theme.css)
    ↻ text4          rgba(244,247,251,0.34)  →  rgba(244,247,251,0.42)
    ↻ brandBorder    rgba(244,199,124,0.28)  →  rgba(244,199,124,0.24)
    · bgDeep         #0b1421   [比 page 更深的落点，视频专属]
    · 0 变更 / 37 未变
```

`↻` 是产品侧真变了的令牌（画面会跟着走，渲染前抽帧看一眼）；`·` 是 fallback（产品侧没有，用视频自有值）。

## sources.json（实例侧唯一人工文件）

**脚本只提供机制，产品知识全在 `sources.json`** —— 换产品 = 换一份 JSON，脚本一行不改。

```json
{
  "product": {
    "name": "示例产品",
    "root": "../../acme/app-client"
  },
  "sources": [
    {
      "id": "tokens",
      "kind": "css-vars",
      "from": "common/theme.css",
      "select": ".theme-dark",
      "out": "src/generated/product.ts",
      "map": {
        "brand": "--brand",
        "brandBorder": "--brand-border",
        "bgDeep": { "var": "--bg-deep", "fallback": "#0b1421", "note": "视频专属" }
      }
    }
  ]
}
```

| 字段 | 说明 |
|---|---|
| `product.root` | 相对 `sources.json` 的产品仓库路径。**产品搬家只改这一行** |
| `sources[].kind` | 目前支持 `css-vars`（读 CSS 变量块） |
| `sources[].select` | 取哪个选择器块，如 `.theme-dark` / `page, .theme-dark` |
| `sources[].map` | `视频令牌名 → CSS 变量名`。三种写法见下 |

`map` 的值支持：

```jsonc
"brand":       "--brand",                                        // 直取
"bgDeep":      {"var": "--bg-deep", "fallback": "#0b1421"},       // 产品没有就用兜底
```

- 给了 `fallback`：产品侧缺失时静默用兜底（并在输出里标 `·`，提示这是视频自有值）
- 没给 `fallback` 且产品侧缺失：报错 + `--check` 退出码非 0（防止产品删了令牌而视频悄悄渲染成 undefined）

## 消费端怎么写

`src/video/theme.ts` 只做**组装**，不再持有产品色：

```ts
import {T} from "../generated/product";

export const c = {
  ...T,                     // 拉取型：产品令牌快照
  // 创作型：产品没有，属于镜头语言（已在 sources.json 声明 fallback）
} as const;
```

字体 / 安全区 / 阴影留在视频侧——它们是**视频介质属性，不是产品属性**。

## 硬性规则

1. **`src/generated/*.ts` 禁止手改**——文件头有标注，脚本每次覆盖
2. **产物入库**。理由：克隆即可渲染、可 diff（能看出产品何时改了色）、可回滚（已发布素材可复现）
3. **要改值？** 改产品仓库的令牌 → `npm run pull`。产品侧本就没有的 → 写 `sources.json` 的 `fallback`
4. **新产品接入**：`init-video-project.mjs` 会生成 `sources.json` 骨架，填 `product.root` 与 `map` 即可
5. `--check` 建议挂 pre-commit 或渲染前置：**渲染前先确认没有未拉取的漂移**
