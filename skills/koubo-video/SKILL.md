---
name: koubo-video
description: 把一段口播文案做成 9:16 竖屏短视频（配音 + 逐句字幕 + 品牌落版），产出可直接发布的 MP4。当用户说「做一条口播视频」「把这段文案做成视频」「生成短视频」「配音成片」，或需要为抖音/小红书/视频号批量产出短视频时使用。基于 macOS 系统语音合成 + Remotion 渲染，无需第三方 TTS 或素材。
agent_created: true
license: MIT
---

# 口播视频生成

**目标**：给一段口播文案，产出一条带配音、带逐句字幕、时长精确对齐的 9:16 竖屏 MP4。

## 基础 Remotion 知识：用官方 skill

**通用层（工程搭建 / markup / render / studio / captions）不再自己维护** —— 直接装官方 Remotion Agent Skills：

```bash
npx skills add remotion-dev/skills
```

它提供 `/remotion-create`、`/remotion-markup`、`/remotion-render`、`/remotion-studio`、`/remotion-captions` 等子技能，覆盖通用 Remotion 最佳实践（Remotion 官方维护，12 万+ 安装）。本 skill 只保留**口播特有的**部分：提词器三行模式、字号分档、品牌进度化（21 格渐次点亮）、落版，以及 macOS 配音合成（`assets/gen-koubo-audio.mjs`）。

> **授权边界**：官方 skills 仓库 `private: true`、无显式 OSS 许可字段，我们**只引用、不 vendoring** 其内容。本 skill 与 `video-factory` 的原创代码（brand-kit / pull / remotion-template）均为 MIT，可自行开源。

## 核心思路

**逐句合成，而不是整段合成。**

这是整条链路唯一的关键决定。把文案切成「一句 = 一屏字幕」，每句单独做一次 TTS，然后用 `ffprobe` 量出它**真实的音频长度**——字幕时间轴就是这个长度，不估、不算、不猜。

代价是多跑几十次 TTS（每次几十毫秒，可忽略）；换来的是**字幕和配音永远不会错位**，哪怕文案改了一个字也自动重新对齐。

## 前置条件

| 依赖 | 检查方式 | 说明 |
|---|---|---|
| macOS | — | `say` 是系统命令，无需安装 |
| 中文语音 | `say -v '?' \| grep zh_CN` | 通常有 `Tingting`（经典）。另有 Sandy / Flo / Eddy 等新语音可试 |
| ffmpeg / ffprobe | `which ffmpeg ffprobe` | 用于拼接与量时长 |
| Remotion 工程 | `ls node_modules/.bin/remotion` | 需要已有（或新建）一个 Remotion 项目 |

**没有 Remotion 工程时**：用官方 `/remotion-create` 起工程（通用搭建见官方 skill）。口播特有的提词器模式见 `references/remotion-recipe.md`。也可以降级用 ffmpeg `drawtext` 硬烧字幕——但排版控制差很多，只适合极简需求。

## 四步流程

### 第 1 步：写逐句文案

**一句一行**，一行就是一屏字幕。经验规则：

- **每句 6–18 字**。短于 6 字信息量不够（一闪而过），长于 18 字一屏放不下会换行、破坏节奏
- **一句一个意思**。不要把两个从句塞进一屏
- **口播不是朗读文案**。写成说话的样子：用「你」「我们」，用短句，允许「其实不是」「就是这样」这类口语衔接
- 全片 20–30 句 ≈ 45–60 秒，是短视频的舒适区

写到 `koubo-lines.json`：

```json
{
  "voice": "Tingting",
  "rate": 180,
  "gap": 0.34,
  "lead": 0.55,
  "tail": 0.9,
  "lines": ["第一句", "第二句", "…"]
}
```

参数含义：`rate` 语速（180 自然，200 偏快，160 偏慢）；`gap` 句间留白秒数；`lead` 开头静音；`tail` 结尾留白。**留白是节奏的一部分**——`gap` 太小会让整片透不过气，0.28–0.40 之间调。

### 第 2 步：生成配音与时间轴

复制 `assets/gen-koubo-audio.mjs` 到工程的 `scripts/`，跑：

```bash
node scripts/gen-koubo-audio.mjs
```

产出两个文件：

- `public/koubo/narration.wav` —— 拼好的完整配音
- `src/koubo/koubo-timing.json` —— 每句的 `{text, from(帧), dur(帧)}`

脚本里两个值得注意的实现：

- **拼接用 `adelay` + `amix`，不用 concat**。`concat` 要求每段编码参数完全一致，容易在采样率/声道上翻车；`adelay` 把每段延迟到它该出现的位置再混合，容错高得多
- **末尾 `apad` + `alimiter`**：`apad` 补齐到全片长度（否则音频比视频短，播放器可能提前结束），`alimiter` 防止 `volume` 提升后削波

### 第 3 步：Remotion 合成

建一个独立合成（不要改已有的片子）。结构：

```
顶层容器（品牌背景 + 渐隐）
├─ 顶部品牌条（logo + 品牌名 + 副标）
├─ 主体字幕区（前句 / 当前句 / 后句 三行）
├─ 底部进度区（品牌元素的进度化呈现 + 总进度条）
└─ <Audio src={staticFile("koubo/narration.wav")} />
```

完整配方、字号分档规则、动效参数见 `references/remotion-recipe.md`（口播提词器 opinionated 模式，建立在官方 `remotion-markup` 之上）。

> **装了 `video-factory` 的话，第 3 步别手写。** 那边有 `remotion-template/src/koubo/Koubo.tsx`（品牌已全参数化，靠 brand-kit 换皮肤）和 `scripts/init-video-project.mjs`（一键起工程）。本 skill 就只管第 1、2 步的文案与配音，二者通过 `koubo-timing.json` 对接。下面的手写配方是**没装工厂时的兜底**——注意别让工厂的模板与它长期分叉。

注册到 `Root.tsx` 后渲染：

```bash
remotion render Koubo "out/口播-<标题>-9x16.mp4"
```

### 第 4 步：交付

产出 MP4 后，发布交给 **`video-publisher`** skill（它负责上传到抖音/小红书/B站/视频号并停在最终发布按钮前）。

内容包 JSON 的字段规则见那个 skill 的 `references/content-package.md`。

## 硬性规则

1. **字幕时间轴必须来自真实音频时长**，不许用「字数 ÷ 语速」估算
2. **一句一屏**，不合并。合并了就没法做逐句对齐
3. **不要改已有合成**，新建一个。口播片和宣传片的时间轴逻辑完全不同
4. **改文案只改 `koubo-lines.json`**，然后重跑第 2、3 步。不要手改 timing json——它会被覆盖
5. **交付前必须抽帧核对**。至少看首帧、中段一帧、落版帧。字幕溢出、字号跳变、文字压边都只有看了才知道

## 常见坑

| 现象 | 原因 | 处理 |
|---|---|---|
| `tsc` 报 JSON import 失败 | tsconfig 缺 `resolveJsonModule` | 加上 `"resolveJsonModule": true` |
| 渲染报 `EEXIST: mkdir .../remotion-webpack-bundle-*` | 沙箱的 FS 代理与 Remotion 打包器冲突 | 脱离沙箱运行；且**后台任务不继承豁免**，要前台跑 |
| 音频比视频短、提前结束 | 忘了 `apad` | 补 `-af apad=whole_dur=<总时长>` |
| 长句字幕溢出屏幕 | 字号写死 | 按字数分档，见 recipe |
| TTS 读数字/英文怪 | `say` 的读法规则 | 改写文案：`2026` → `二零二六`，`AI` → `A I`（分开读）或直接写中文 |
| 音质发闷或发炸 | `volume` 过头 | 用 `volumedetect` 看峰值，落在 -3 ~ -1 dB 之间；配 `alimiter=limit=0.92` |

## 自检清单

- [ ] 每句 6–18 字，一句一屏
- [ ] `narration.wav` 时长与视频帧数一致（`totalFrames / fps ≈ 音频秒数`）
- [ ] 峰值在 -3 dB 上下，不削波
- [ ] 抽帧看过：首帧、中段、落版帧
- [ ] 视频参数为 9:16 竖屏（1080×1920）、h264 + aac
- [ ] 发布前用 `check-package.mjs` 校验四平台内容包
