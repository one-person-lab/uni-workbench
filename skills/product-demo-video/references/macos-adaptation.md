# macOS 适配记录

本版相对上游 ClawHub `product-demo-video` v1.0.0（MIT-0, by xiazai77）的改动与原因。
上游原文可从 `https://clawhub.ai/xiazai77/product-demo-video` 取回。

## 改了什么

| # | 改动 | 原因 |
|---|------|------|
| 1 | 浏览器 / 字体 / Python / edge-tts 全部自动探测，可用环境变量覆盖 | 原版把 `/usr/bin/chromium-browser`、`/usr/share/fonts/google-noto/*` 写死，macOS 上直接跑不了 |
| 2 | 场景改为外部 JSON + 声明式 `steps` DSL | 原版把 JS 函数内联在脚本里，换一个产品就要改代码 |
| 3 | **边执行步骤边抓帧** | 原版 `await actions(page)` 跑完才开始截图，录不到操作过程，成片只是终态定格 |
| 4 | 改用 `spawnSync` 传参数组 | 原版把 narration 拼进 shell 命令串，只转义了 `"`，文案里出现反引号 / `$()` 就是注入面 |
| 5 | 移除硬编码 `100% Client-Side` 徽标，改 `badge` / `rightBadge` 可选 | 未核实的隐私声明不能当宣传口径 |
| 6 | 合成命令补 `-af apad` | 只有 `-shortest` 会按音频长度截断画面 |
| 7 | 自己拉起 Chrome + `connect`，不用 `puppeteer.launch()` | 见下 |

## 踩过的坑（按发生顺序）

### 1. `Requesting main frame too early!`

环境：macOS + 系统 Chrome 152 + puppeteer-core 25.11。

`puppeteer.launch()` 能返回、`browser.version()` 正常，但一执行 `page.goto` 就抛这个错。
排查结论：

- 与 Chrome 版本无关（换 puppeteer 配套的 Chrome 153、换 `chrome-headless-shell` 一样报）
- 与 `pipe: true/false` 无关（两种都报）
- **Chrome 本体没问题**——直接命令行 `--screenshot` 能正常出图
- **手动拉起 Chrome 开 `--remote-debugging-port`，再用 `puppeteer.connect()` 接管，完全正常**

所以本版改成「自起 + connect」。这是最省事且已验证的路径，不必去 bisect puppeteer 那几十个默认启动参数。

### 2. `Protocol error (Emulation.setTouchEmulationEnabled): Session closed`

第一版自起 Chrome 时没带 `--no-sandbox`，渲染进程起不来，page 秒关，
表现就是 `page.setViewport()` 触发的那串 `Emulation.*` 命令报 Session closed。
补 `--no-sandbox --disable-setuid-sandbox` 后正常。

⚠️ 这意味着无头浏览器不再受 Chrome 自带沙箱保护。用于渲染你自己指定的页面是合理的，
但**别拿它去开不可信的站点**。

### 3. 成片时长只有一半

两个 8s 场景，成片 16s 预期却只出 9.3s。
原因：`ffmpeg -i video -i audio -c:v copy -c:a aac -shortest` 中，
`-shortest` 以较短的流为准，配音（5.2s / 4.1s）短于画面（8s），画面被截断。
正解是给音频补静音：`-af apad -shortest`。

### 4. 中文字幕

PIL 的 `ImageFont.truetype` 需要真正含中文字形的字体。
macOS 上 `Arial Unicode.ttf`（`/System/Library/Fonts/Supplemental/`）覆盖 CJK，是稳妥的兜底；
`STHeiti Medium/Light.ttc` 亦可（.ttc 走 index 0）。

### 5. `puppeteer.executablePath()` 是异步的

puppeteer **25 起** `executablePath()` 返回 `Promise<string>`，不再是字符串。
写成 `const p = puppeteer.executablePath(); fs.existsSync(p)` 会抛
`TypeError: path must be of type string`，而这个错被 `try/catch` 吞掉后**静默回落到系统 Chrome**——
表面看「能跑」，实际用的是版本不匹配的那个浏览器，迟早再炸。

正解：`const p = await puppeteer.executablePath()`。已经踩过一次，别再写成同步。

## 安装方式（本机）

依赖装进隔离环境，**不要跑上游的 `scripts/install-deps.sh`**（它会 `npm i -g`、`pip3 install` 到全局、
还可能往 `/usr/local/bin` 塞 ffmpeg）：

```bash
# 浏览器 + 控制层
npm i puppeteer                      # 自带匹配版本 Chrome，比系统 Chrome 稳

# 语音 + 字幕
pip install edge-tts Pillow
```

本机实际落位（2026-09-15）：

- puppeteer / puppeteer-core → `~/.workbuddy/binaries/node/workspace/node_modules`
  （跑脚本时要 `NODE_PATH` 指过去）
- edge-tts 7.2.8 / Pillow → `~/.workbuddy/binaries/python/envs/default`
- 浏览器 → `~/.cache/puppeteer/chrome*/`
- ffmpeg → `/opt/homebrew/bin/ffmpeg`（系统已有）

跑法：

```bash
NODE_PATH=~/.workbuddy/binaries/node/workspace/node_modules \
SCENES_FILE=./scenes.json OUT=./demo.mp4 \
node scripts/record-demo.mjs
```

需要拉起浏览器的任务在沙箱里跑不了，要走非沙箱模式。

## 已知未做

- **只覆盖浏览器**。真桌面录屏（`screencapture`）、桌面级拟人点击（`cliclick`）不在此范围。
- **手机 App 录不了**。要录 App 得走模拟器方案（如 `software-mansion/argent` 的 screen-recording）。
- 操作过程只是「逐步抓帧」，不是真实鼠标轨迹动画。要更像人手，需要额外做光标合成。
