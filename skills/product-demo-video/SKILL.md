---
name: product-demo-video
description: >
  Create product demo videos with voiceover, text overlays, and real browser interactions.
  Fully automated, zero cost. Uses Puppeteer (headless Chrome), edge-tts (Microsoft Neural TTS),
  PIL (text overlays), and FFmpeg (video encoding).
  Adapted for macOS + Linux (auto-detects browser / fonts / python / edge-tts).
  Use when: user wants a demo video, product walkthrough, launch video, Product Hunt video,
  app showcase, or a screen recording of a web application.
  Triggers: "demo video", "product video", "record demo", "launch video", "walkthrough video",
  "showcase video", "screen recording", "产品演示视频", "演示视频", "录屏演示".
---

# Product Demo Video Creator

Create polished demo videos with voiceover and text overlays — fully automated, zero cost.

> **改造版说明**：原版（ClawHub `product-demo-video` v1.0.0, MIT-0, by xiazai77）是 Linux 路径
> 写死的，且**等动作跑完才开始截图**——录出来只有静态终态，录不到操作过程。本仓库版本已修：
> 自动探测依赖、场景外置为 JSON、边操作边录、去掉 shell 拼接、移除硬编码的隐私徽标。
> 详见 `references/macos-adaptation.md`。

## Stack

| Tool | Purpose | Install |
|------|---------|---------|
| Puppeteer | Headless browser recording | `npm i puppeteer`（含配套浏览器）或 `npm i puppeteer-core` |
| edge-tts | Microsoft Neural TTS (free) | `pip install edge-tts` |
| PIL/Pillow | Text overlays on frames | `pip install Pillow` |
| FFmpeg | Video encoding | 包管理器安装即可（系统自带优先） |
| Chrome / Chromium | Browser engine | 优先用 puppeteer 配套版本，见下 |

## Quick Start

```bash
# 1. 依赖（装进隔离环境，别用原版的全局安装脚本）
npm i puppeteer                       # 自带匹配版本 Chrome
pip install edge-tts Pillow

# 2. 准备场景文件
cp scripts/scenes.example.json ./scenes.json
#    改标题 / 文案 / 网址 / 操作步骤

# 3. 跑
SCENES_FILE=./scenes.json OUT=./demo.mp4 node scripts/record-demo.mjs
```

输出：带动画字幕 + 中文配音的 MP4。

## Workflow

```
场景 JSON → 配音（edge-tts）→ 录浏览器（边操作边抓帧）→ 字幕叠加（PIL）→ 合成（FFmpeg）
```

## Step 1: 场景 JSON

每个场景是一个对象。`steps` 是**声明式操作序列**，替代原版内联的 JS 函数：

```json
[
  {
    "id": "feature1",
    "title": "挑一个副本",
    "subtitle": "选中长期目标，押注，然后开始",
    "narration": "先挑一个你想推进的副本，押上一笔挑战金，让拖延变得有代价。",
    "url": "https://example.com/app",
    "type": "tool",
    "rightBadge": "",
    "steps": [
      { "do": "wait",  "ms": 900 },
      { "do": "fill",  "selector": "textarea", "value": "要填的内容" },
      { "do": "click", "texts": ["提交", "运行", "生成"] },
      { "do": "scroll","y": 320, "times": 2, "hold": 600 },
      { "do": "eval",  "js": "window.scrollTo({top:0,behavior:'smooth'})" },
      { "do": "goto",  "url": "https://example.com/other" }
    ]
  }
]
```

| 字段 | 说明 |
|------|------|
| `type` | `intro` / `tool` / `outro` — 决定字幕条样式与位置 |
| `narration` | 配音文案。**同时决定场景时长** = max(MIN_SCENE(默认3s), 音频秒数 + TAIL_PAD(默认0.5s))。⚠️ 所有 steps 的耗时必须装得进这个时长，装不下会被截断（日志有 ⚠️ 提示）——改短 hold 或删步骤 |
| `steps[].do` | `wait` / `fill` / `click` / `scroll` / `eval` / `goto` / `cursor` |
| `steps[].hold` | 该步在画面里停留多久（ms），不填按类型取默认值 |
| `steps[].cursorText` / `cursorAt` / `cursorEval` | 光标移动目标（eval/cursor 步骤用）：按可见文本找按钮 / 直接给坐标 / 给一段返回 `{x,y}` 的 JS（可命中任意元素，包括列表项） |
| `badge` | intro 场景字幕条下方的绿色小字（**只写能核实的**，见下） |
| `rightBadge` | tool 场景字幕条右侧的小标（同上，默认留空） |

### 场景类型与字幕位置

| Type | 位置 | 用途 |
|------|------|------|
| `intro` | 底部大字 + 副标题 + 可选 badge | 开场，产品名 + 定位一句话 |
| `tool` | 底部左对齐标题 + 副标题（+ 右侧小标） | 逐个功能演示 |
| `outro` | 底部居中 CTA | 收尾，网址 + 行动号召 |

**字幕一律放底部**——顶部会跟网站导航打架。

## Step 2: 边操作边录（本版关键改动）

原版是 `await actions(page)` 之后再 `for(...) screenshot()`，**操作过程完全录不到**，成片只是终态定格。
本版在每一步执行时同步抓帧：

```
goto → 抓帧 → fill → 抓帧 → click → 抓帧 → scroll×N → 每段抓帧 → 不足时长用定格补满
```

所以 `steps` 里每一步都要给足 `hold`，否则那一步在画面里一闪而过。

## Step 2.5: 鼠标光标（默认开启）

观众要看「有人在操作」。`page.screenshot` 拍不到系统光标，本版自己演：
录制时逐帧记录光标坐标（点击前用 easeOutCubic 缓动过去，点击帧带涟漪），叠加阶段用 PIL 画 macOS 风格箭头。

- `click` / `fill` 步骤自动先移光标再点，无需配置
- `eval` 步骤想有光标，配 `cursorText`（按按钮文本）/ `cursorAt`（坐标）/ `cursorEval`（返回 `{x,y}` 的 JS，可命中列表项等非按钮元素）
- `{"do":"cursor","x":960,"y":540}` 纯移动，用来让静止画面有生气

## Step 3: 配音

```bash
edge-tts --voice zh-CN-XiaoxiaoNeural --rate=+0% --text "文案" --write-media out.mp3
```

**中文推荐音色**：`zh-CN-XiaoxiaoNeural`（女，亲和，默认）· `zh-CN-YunxiNeural`（男，年轻）·
`zh-CN-YunjianNeural`（男，沉稳）· `zh-CN-XiaoyiNeural`（女，元气）

**英文推荐**：`en-US-AndrewNeural` · `en-US-AriaNeural` · `en-US-BrianNeural`

用 `VOICE=` / `VOICE_RATE=` 环境变量覆盖，不必改代码。

## Step 4: 字幕叠加

PIL 逐帧画字幕条，设计规则：
- **深色实底**（alpha ≥ 230）——半透明显得廉价
- **一条绿色分隔线**（2px）压在字幕条上沿
- 字体：标题用粗体，副标题用常规体。**中文必须用 CJK 字体**（macOS 默认取 Arial Unicode / 黑体）

⚠️ **不要写未经核实的宣传口径**。原版在每帧硬编码 `100% Client-Side`，本版已移除。
要写 badge 就写能当场验证的事实（如「本地运行」需真的本地运行）。

## Step 5: 合成

```bash
ffmpeg -framerate 6 -i overlay/frame_%05d.png -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -r 24 scene.mp4
ffmpeg -i scene.mp4 -i narration.mp3 -c:v copy -c:a aac -b:a 128k -af apad -shortest scene_final.mp4
ffmpeg -i scene_final.mp4 -c:v libx264 -preset slow -crf 20 -r 24 -c:a aac -b:a 128k -ar 44100 -ac 2 scene_norm.mp4
ffmpeg -f concat -safe 0 -i concat.txt -c copy output.mp4
```

⚠️ 第二行必须有 `-af apad`。只有 `-shortest` 会把画面**按音频长度截断**——
配音比场景短，画面就被砍掉（已踩：两个 8s 场景只出 9.3s）。

## 可调参数（环境变量）

| 变量 | 默认 | 说明 |
|------|------|------|
| `SCENES_FILE` | `./scenes.json` | 场景 JSON；不存在则用内置示例 |
| `OUT` | `./demo-video.mp4` | 输出路径 |
| `WORK_DIR` | `<tmp>/demo-video-work` | 中间产物（帧、音频） |
| `CHROME_PATH` | 自动探测 | 指定浏览器可执行文件 |
| `VOICE` / `VOICE_RATE` | `zh-CN-XiaoxiaoNeural` / `+10%` | 音色与语速。**+10% 是刻意默认**：edge-tts 中文原速明显偏慢、机器腔重（用户反馈过），宁可快一点 |
| `TAIL_PAD` / `MIN_SCENE` | `0.5` / `3` | 段尾留白秒数 / 场景最短秒数。旧版写死「+2s 且最短 8s」，段间停顿太长（用户反馈过），已改为贴着音频走 |
| `WIDTH` / `HEIGHT` | `1920` / `1080` | 视口尺寸。**1080p 是刻意默认**：720p 对「侧边栏+主内容」型后台会把侧栏底部和表格裁掉/被字幕条遮住（用户反馈过） |
| `CURSOR` / `CURSOR_SPEED` | `开` / `0.55` | 虚拟鼠标光标（`page.screenshot` 拍不到系统光标，须自己画）。开启后点击前光标会缓动过去、点击带涟漪。`CURSOR=0` 关闭 |
| `CAPTURE_FPS` / `OUTPUT_FPS` / `CRF` | `6` / `24` / `20` | 抓帧率 / 输出帧率 / 画质 |

## Troubleshooting

- **`Requesting main frame too early!`** — puppeteer 的 `launch()` 在较新 Chrome 上会挂。
  本版已改为「自己拉起 Chrome 开调试端口 + `connect` 接管」，绕开该问题。别改回 `launch()`。
- **`Emulation.* : Session closed`** — 无头 Chrome 渲染进程没起来。确认启动参数带
  `--no-sandbox`（本版默认已带）。受限环境里这是必需的。
- **成片比预期短** — 漏了 `-af apad`，画面被 `-shortest` 按音频截断。
- **叠加阶段报 `NameError: name 'false' is not defined`** — 光标轨迹 JSON 内联进 Python 时没转
  `True/False/None`（本版已在生成时 replace，别把那三行 replace 删掉）。
- **步骤没播完就被切** — steps 总耗时超过场景时长（音频 + TAIL_PAD）。看日志里的
  `⚠️ ... 被时长截断`，删步骤或调小 hold。
- **成片比预期长、尾部画面重复** — `overlay_<scene>/` 里的旧帧没清掉，
  与本次新帧一起被编码（已踩：90 帧的场景变成 126 帧 = 21s，多出的全是上一轮画面）。
  本版已在叠加阶段先删 `overlay_*/frame_*.png` 再写；若手改过那段 Python，别把清理逻辑删掉。
  **改完场景文案后重跑，尤其要核对 ffprobe 的时长与「帧数 ÷ CAPTURE_FPS」是否一致。**
- **中文字幕变方块** — 字体没选中 CJK。设 `FONT_BOLD` / `FONT_REG` 指向中文字体
  （macOS：`/System/Library/Fonts/Supplemental/Arial Unicode.ttf`）。
- **表单填了没反应** — React 受控组件不吃 `.value =`，走 `reactSetValue()`（本版 `fill` 步骤已内置）。
- **edge-tts 失败** — 它要连微软服务器，断网/被墙就报错。
- **画面停在终态不动** — 场景里没给足够 `hold`，或步骤被跳过。
- **不想用系统 Chrome** — 装完整 `puppeteer`（自带配套浏览器，版本匹配、更稳），
  本版会优先用它；系统 Chrome 会自动升级，容易跑在 puppeteer 前面导致协议错配。

## References

- `references/demo-planning.md` — 演示结构、节奏、什么让演示好看
- `references/macos-adaptation.md` — 本版相对原版改了什么、为什么
- `scripts/record-demo.mjs` — 可运行的入口
- `scripts/scenes.example.json` — 场景文件样例
