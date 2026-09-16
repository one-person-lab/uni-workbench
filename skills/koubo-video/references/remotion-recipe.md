# Remotion 合成配方（口播提词器模式）

> **定位**：本文件是**口播特有的 opinionated 模式**，建立在官方 `remotion-dev/skills` 的通用 Remotion 知识之上。
> 基础层（工程搭建 / markup / render / studio / captions）请装官方 skill：`npx skills add remotion-dev/skills`。
> 本文件只保留通用 skill 不覆盖的部分：**提词器三行、字号分档、品牌进度化、落版**。

口播视频的合成层。目标：**字幕永远看得清，节奏永远跟得上配音。**

## 最小工程

```bash
npm create video@latest koubo-video   # 或复用已有 Remotion 工程，新开一个 Composition
```

`tsconfig.json` 必须加：

```json
{ "compilerOptions": { "resolveJsonModule": true } }
```

否则 import `koubo-timing.json` 会报错。

## 组件结构

```tsx
export const Koubo: FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = Math.min(1, frame / durationInFrames);

  // 当前句：扫一遍 timing，取最后一个 from <= frame 的
  let idx = 0;
  for (let i = 0; i < LINES.length; i++) if (frame >= LINES[i].from) idx = i;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden",
                  background: "radial-gradient(120% 78% at 50% 112%, …)" }}>
      {/* 顶部品牌条 */}
      {/* 主体字幕区：前句 / 当前句 / 后句 */}
      {/* 底部：品牌进度元素 + 总进度条 */}
      <Audio src={staticFile("koubo/narration.wav")} />
    </div>
  );
};
```

### 三个层级

**① 主体字幕区 —— 提词器式三行**

| 位置 | 字号 | 颜色 | 作用 |
|---|---|---|---|
| 前句 | 36px / 500 | `text4`（约 34% 不透明度） | 给上下文 |
| **当前句** | **62–104px / 700** | 主文字色 | 主角 |
| 后句 | 36px / 500 | `text4` | 预告 |

三行固定高度槽位（各 60px 给前后句），**槽位不塌陷**——否则只有一行时整块会跳动。

**② 字号分档**

```ts
const sizeFor = (t: string) => {
  const n = t.length;
  if (n <= 7) return 104;
  if (n <= 10) return 88;
  if (n <= 14) return 74;
  return 62;
};
```

配 `maxWidth: 1080 - 84*2`，中文长句会自动折两行且不溢出。**不要用纯 CSS `clamp()` 之类做自适应**——视频是固定画布，能精确算就别让它猜。

**③ 动效（每句入场）**

```ts
const p = interpolate(frame, [line.from, line.from + 11], [0, 1], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
});
// opacity: p
// translateY: (1-p) * 26px        —— 轻微上浮
// filter: blur((1-p) * 8px)       —— 出焦感
```

**11 帧（30fps 下约 0.37 秒）是甜点**。快于 8 帧像闪烁，慢于 16 帧会拖到下一句开始还没到位。

## 品牌元素进度化

底部的进度条和品牌元素不要写成纯装饰。两种有信息量的做法：

- **呼应产品的进度隐喻**：若产品核心是 21 天挑战，就画 21 个方格，随全片进度逐格点亮
- **总进度条**：宽度 = `progress * 100%`，让观众知道还剩多久

逐格点亮的实现要点：不要 `round()` 到整数格，用 `lit = progress * N` 然后对每格算 `clamp(lit - i, 0, 1)` 作为该格自己的动画进度——这样格子是一格格**渐次**亮起来的，不是整列跳变。

## 落版

最后 2 句切「落版模式」：品牌名（大字 + 光晕）+ 分隔线（宽度随进度展开）+ slogan。

判断方式：`idx >= LINES.length - 2`。**不要单独配一段 BGM 时间轴**——落版的时长就是这两句的 TTS 时长，自动对齐。

## 渲染命令

```bash
remotion render Koubo "out/口播-<标题>-9x16.mp4" --concurrency=4
```

`--concurrency=4` 在 M 系 Mac 上比较稳。超过 CPU 性能核数量反而变慢。

## 沙箱/容器环境注意

Remotion 打包器会在系统临时目录建 `remotion-webpack-bundle-*`，且要拉起无头 Chrome。在受限沙箱里会报：

```
EEXIST: file already exists, mkdir '.../remotion-webpack-bundle-XXXX'
```

这是沙箱 FS 代理与打包器的冲突，**换 TMPDIR 解决不了**。必须让进程有完整文件系统权限。

⚠️ **后台任务不继承权限豁免**——如果沙箱豁免只对前台命令生效，就必须前台运行（靠超时自动转后台），而不是显式 `run_in_background`。

## 抽帧核对

```bash
for f in 60 240 660 1170 1500 1700; do
  ffmpeg -hide_banner -loglevel error -y -ss $(echo "scale=2;$f/30"|bc) \
    -i "out/口播-xxx-9x16.mp4" -frames:v 1 /tmp/kb-$f.png
done
```

至少看**首帧、中段、末句、落版帧**。重点核对：字幕有没有溢出安全区、字号跳变是否突兀、前后句压暗够不够、落版是否完整。
