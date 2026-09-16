# 口播渲染模板（remotion-template）

**产品无关的 Remotion 口播画面。** 这一份代码服务所有产品，靠 `brand.generated.ts` 换皮肤。

## 文件

```
src/koubo/
├── Koubo.tsx            # 模板代码（由实例的 sync:template 同步过去，勿在实例里改）
├── index.ts             # 出口
└── koubo-timing.json    # 只是占位示例；实例里由 koubo-video 的 gen-koubo-audio.mjs 生成
```

`brand.generated.ts` **不在这里**——它由 `scripts/gen-brand-theme.mjs` 按各实例的 `brand-kit.json` 现编译。

## 画面结构

```
顶层容器（品牌深色渐变背景 + 首尾渐隐）
├── 底部地平线暖光（品牌主色的柔光，可关）
├── 顶部品牌条：徽标 + 品牌名 ……………… 右上角小字（如「21 天 · 小行动」）
├── 主体字幕区：前句（压暗） / 当前句（放大、模糊入场） / 后句（压暗）
├── 底部：装饰刻度（可选，cells×N） + 总进度条（主色 → 亮色渐变）
└── <Audio src={staticFile(brand.audioFile)} />
```

落版（最后两句）切换成：品牌名大字 + 分隔线 + CTA + AI 溯源标注。

## 依赖

- Remotion 4.x + React 19
- `koubo-timing.json` 字段：`{fps, totalFrames, lines: [{text, from, dur}]}`（帧为单位）
- `staticFile()` 能取到的配音文件（默认 `public/koubo/narration.wav`）

字体不显式指定 PingFang：macOS Chrome 下 `"PingFang SC"` 解析不到，交给 `-apple-system` 回退链反而与真机一致（见 `app-promo-video/src/video/theme.ts` 的实测结论）。

## 新工程

别手抄。用 `scripts/init-video-project.mjs`：

```bash
node <skill>/scripts/init-video-project.mjs promo-video-<product> --dir <父目录> [--from <brand-kit.json>]
```

## 改模板

1. 改这里的 `Koubo.tsx`
2. 到每个实例跑 `npm run sync:template`
3. 抽帧核对（首帧 / 中段 / 落版帧）

---

## 同步契约（为什么这么做）

| 类型 | 文件 | 同步行为 |
|---|---|---|
| 模板代码 | `src/koubo/Koubo.tsx`、`index.ts` | **覆盖** |
| 生成产物 | `src/koubo/brand.generated.ts` | **每次重编** |
| 实例数据 | `src/koubo/koubo-timing.json`、`brand-kit.json`、`koubo-lines.json` | **永不触碰** |

不用 git submodule / npm 包，是因为 Remotion 需要工程内真实存在的 `src/`，`remotion render` 不认外部包的打包入口。文件同步 + 明确契约比引入构建复杂度更划算。
