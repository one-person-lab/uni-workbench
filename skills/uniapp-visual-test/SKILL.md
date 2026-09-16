---
name: uniapp-visual-test
description: UniApp（HBuilderX 结构）工程的视觉回归三轨管线：H5 轨（Vite dev server + ego-browser，快，带完整 DOM 语义）、微信小程序轨（DevTools automator，权威渲染层）、App 轨（uni-app x 蒸汽模式 + HBuilderX CLI + iOS 模拟器，全命令行，含 CSS 能力边界实测清单）。当用户要求"跑小程序自测""H5 调试看看""视觉回归""双主题截图对比""编译 mp-weixin""跑 iOS 模拟器""uni-app x 能写什么 CSS"时使用。
---

# UniApp 视觉回归三轨管线

绕开 HBuilderX GUI，全程命令行。三条轨各有各的用处，**不是三选一**：

> ⚠️ 下面两条（H5 / 小程序）针对**传统 uni-app**；**App 轨专用于 uni-app x**（蒸汽模式），见本文后半「App 轨」。

| | H5 轨（默认，90% 场景） | 小程序轨（验收，10% 场景） |
|---|---|---|
| 工具 | Vite dev server + ego-browser | DevTools auto + miniprogram-automator |
| 速度 | HMR 秒级，改完立刻看 | 需 dev watch 重编 + automator 连接 |
| 能力 | 完整 DOM：snapshot / 选择器点击 / evaluate 断言 / 控制台报错 / 多视口 | 只能截图 + $vm 调方法，无 DOM 语义 |
| 前置 | 无（CORS 已配） | **服务端口需人工在 GUI 开启** |
| 能验 | 令牌/颜色/图层/组件配方/双主题/文案/交互逻辑 | 以上全部 **+ 小程序真实渲染层** |
| 验不了 | 胶囊/状态栏留白、小程序 CSS 子集限制、真机字体 | — |

**铁律**：H5 轨看到的布局不等于小程序。已实测差异：H5 下自定义导航栏顶部留白塌陷（无胶囊）、字体度量不同导致大字换行（首页「身份」二字 H5 折行、小程序不折）。所以 **H5 通过 ≠ 可发布**，交付前必须跑小程序轨。

## 环境（一次性）

壳工程 `~/.workbuddy/binaries/node/workspace/uni-vue3-shell/`，关键 setup：

1. `@dcloudio/*` 版本与工程 `manifest.json` 的 uni 编译器版本对齐（查：HBuilderX 产物 `unpackage/dist/dev/mp-weixin/app-service.js` 头部版本注释 → npm `3.0.0-<hash>`）
2. **确认 Vue2/Vue3**（`manifest.json` 的 `vueVersion`）：Vue3 用本壳（vite），Vue2 换 `uni-preset-vue` master（webpack）
3. **`src` 必须是软链到工程根目录**（关键，别用 UNI_INPUT_DIR 代替）：
   ```bash
   ln -sfn /path/to/工程根 ~/.workbuddy/binaries/node/workspace/uni-vue3-shell/src
   ```
   HBuilderX 工程把 main.js/App.vue/pages.json/pages 都放根目录，软链后正好等于 uni CLI 标准结构（`src/main.js`、`src/pages.json`）。
   ⚠️ 只设 `UNI_INPUT_DIR` 对 mp 构建有效，**H5 的 vite root 仍指向壳目录**，会加载壳自带的桩 App.vue → 页面全白、`#app` 为空、且不报错。踩过。
4. 依赖安装：`NODE_OPTIONS='' npm install` + 沙箱豁免

## H5 轨

```bash
cd ~/.workbuddy/binaries/node/workspace/uni-vue3-shell
UNI_OUTPUT_DIR=$PWD/dist/dev/h5 NODE_OPTIONS='' \
  node node_modules/@dcloudio/vite-plugin-uni/bin/uni.js -p h5 > /tmp/h5dev.log 2>&1
# ⚠️ 必须用工具的后台模式启动（run_in_background），不要用 shell 的 `&`：
#    `&` 起的进程活不过一轮，轮次结束即被杀，下轮回来端口已空
PORT=$(grep -oE 'localhost:[0-9]+' /tmp/h5dev.log | head -1 | cut -d: -f2)
echo "dev server on $PORT"
```

**端口不固定**：从 5173 起找空闲（三个工作台常占 5173-5175，实测漂过 5176 与 5173），**每次都要从 `/tmp/h5dev.log` 现读**，不要把端口写死进脚本。每次开跑前先探活，死了就重启：

```bash
curl -s --noproxy '*' -o /dev/null -w "%{http_code}\n" "http://[::1]:$PORT/"   # 非 200 就重启
```

浏览器操作（ego-browser，绝对路径 `~/.local/bin/ego-browser`，不在 PATH）：

```js
const task = await taskSpace("视觉回归")
const page = task.page("p1")
await page.goto(`http://localhost:${PORT}/`)
await page.cdp("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 2, mobile: true })
await page.reload(); await page.waitForTimeout(3000)
await page.screenshot({ path: "/tmp/h5shots/xxx.png" })
```

要点：
- **切主题 = 写 localStorage + 整页 reload**（H5 的 App onLaunch 会重读，不像小程序是内存态需走页面方法）：
  ```js
  await page.evaluate(() => localStorage.setItem("themeMode", "light"))
  await page.reload()
  ```
  验证生效：查根节点 class 是否 `theme-light` / `theme-dark`
- **多页巡检**：`page.goto(`http://localhost:${PORT}/#/pages/challenge/index`)`（H5 默认 hash 路由）
- **比 automator 强的地方**：`page.snapshot()` 拿语义树、`page.click("text=...")`、`page.evaluate()` 批量断言、可见 `document.body.innerText`
- 前端 API 走线上 `https://doc.example.com.com`，**CORS 已开**（回显 localhost origin），无需代理；游客态可直接浏览，登录页除外

## 小程序轨

```bash
# dev watch（必须 dev，不能 build：生产构建压缩方法名，automator 全瞎）
cd ~/.workbuddy/binaries/node/workspace/uni-vue3-shell
UNI_OUTPUT_DIR=$PWD/dist/dev/mp-weixin NODE_OPTIONS='' \
  node node_modules/@dcloudio/vite-plugin-uni/bin/uni.js -p mp-weixin
# 同样用工具后台模式启动；dev watch 是长驻进程，掉线就重跑（产物留在 dist/dev/mp-weixin）

# 服务端口须人工在 DevTools GUI 打开：设置 → 安全设置 → 服务端口
/Applications/wechatwebdevtools.app/Contents/MacOS/cli auto --project $PWD/dist/dev/mp-weixin --auto-port 9420
node shot.mjs            # 已就绪：双主题 4 页截图 → /tmp/shots/
```

automator 三个坑（shot.mjs 已处理）：
- 端口被 cli auto 占用 → 用 `automator.connect({wsEndpoint})`，收尾 `disconnect` 不 `close`
- connect 崩 `Cannot read properties of undefined (reading 'split')` → monkey-patch `MiniProgram.prototype.checkVersion`
- 调页面方法：uni-app Vue3 方法在组件实例上，`page.callMethod` 报 not a function → `mp.evaluate` 里 `getCurrentPages().at(-1).$vm.xxx()`

### ✅ 免壳工程：直接用 HBuilderX 内置编译器（传统 uni-app，2026-09-16 实测）

上面那条走「壳工程 + 自己 npm install 的 @dcloudio」。**机器上装了 HBuilderX 的话可以整条跳过**——直接用 HBuilderX 插件自带的编译器编原工程（HBuilderX 工程本身没有 `node_modules` 也能编），省掉软链 `src` 和 `npm install`。

```bash
P=/abs/path/<工程>
HBX=/Applications/HBuilderX.app/Contents/HBuilderX     # ⚠️ 必须正式版
export HX_APP_ROOT=$HBX
export UNI_HBUILDERX_PLUGINS=$HBX/plugins
export RUN_BY_HBUILDERX=true
export UNI_CLI_CONTEXT=$HBX/plugins/uniapp-cli-vite
export UNI_INPUT_DIR=$P
export UNI_OUTPUT_DIR=$P/unpackage/dist/dev/mp-weixin
export UNI_PLATFORM=mp-weixin
cd $P
node "$UNI_CLI_CONTEXT/node_modules/@dcloudio/vite-plugin-uni/bin/uni.js" -p mp-weixin
```

三条硬约束（都实测踩过）：

1. **必须正式版 HBuilderX**。`HBuilderX-Alpha.app` **不带 `compile-dart-sass`**，工程只要用了 `uni.scss` 或 `<style lang="scss">` 就停在「预编译器错误：代码使用了sass语言，但未安装相应的编译器插件」，且它提示的插件市场链接在 CLI 下装不了。查法：`ls <HBuilderX>/plugins/ | grep sass`
2. **绝对不要加 `build` 关键字**。`uni build -p mp-weixin` 会**先清空 `UNI_OUTPUT_DIR`，然后什么都不写**（exit 0，日志照样打 `DONE Build complete.`）——产物目录直接变空。正确形式是裸的 `uni -p mp-weixin`（＝ HBuilderX「运行到微信小程序」的等价命令，dev watch 常驻，首轮约 13s）
3. **输出不要接 `| head` / `| tail`**。管道读端提前退出 → 编译进程吃 SIGPIPE；若死在 `emptyOutDir` 之后、写盘之前，产物同样为空。要看输出就重定向到文件

⚠️ 后台 / 无 TTY 启动时补 `tail -f /dev/null |` 保住 stdin，否则 compile 完进程就退出、watch 不常驻：

```bash
tail -f /dev/null | node "$UNI_CLI_CONTEXT/.../uni.js" -p mp-weixin > /tmp/mp.log 2>&1
```

编译完 `cli open --project $UNI_OUTPUT_DIR` 即可在开发者工具里跑。acme 工程已固化为 `acme/scripts/ui-app/run-mp-weixin.sh`。

### uni-app x 编译 mp-weixin（HBuilderX CLI，非 vite 链）

传统 uni-app 的小程序用 vite-plugin-uni dev watch（见上）。**uni-app x 必须走 HBuilderX 内部编译器**，命令是 `launch mp-weixin`（不是 `publish`，不是 vite 链）：

```bash
export PATH=/tmp/fakebin:$PATH   # 仍需假 ps（见 App 轨前置 1）
/Applications/HBuilderX-Alpha.app/Contents/MacOS/cli launch mp-weixin \
  --project /abs/path/to/app-clientx --compile true
# --compile true = 仅编译不拉起 DevTools，产物落在 unpackage/dist/dev/mp-weixin
```

### ⚠️ 微信开发者工具自动化环境坑（2026-09-14 实测）

**核心阻塞：41812 僵尸 IDE 无法清除**

微信开发者工具有一个**看门狗进程**（非主进程、非 launchd），在 41812 端口持续维持一个僵尸 Electron 实例：
- `cli quit` 能临时清空 41812，但 **1-3 秒内自动重生**
- `kill -9 <PID>` 杀掉后立即 respawn（新 PID）
- 该僵尸的 HTTP server 对所有路径返回 `Cannot GET /`（无 CDP/automator 端点）

**连锁影响：**

| 操作 | 结果 | 原因 |
|------|------|------|
| `cli auto`（默认端口） | ❌ "wait IDE port timeout" | 检测到 41812 被占 → 尝试连接僵尸 → 握手失败 |
| `cli auto --port 9333` | ❌ "must be restarted on port 9333 first" | 要求先退出 41812 的 IDE → 退不掉（僵尸） |
| miniprogram-automator `launch()` | ❌ "http port is open" | 内部调 `cli auto --auto-port` → 同上 |
| miniprogram-automator `connect(9420)` | ❌ 连接拒绝 | automator WS 端口从未开启（auto 失败导致） |

**可用的操作：**

| 操作 | 结果 | 备注 |
|------|------|------|
| `cli open --project <path>` | ✅ 能打开项目 | 项目出现在侧栏 MP-WEIXIN |
| `screencapture -x` | ✅ 全屏截图可用 | 有屏幕录制权限；但无法指定窗口 ID（osascript 被禁） |
| `osascript` System Events | ❌ 权限违例 (-10004) | 沙箱禁了 GUI 自动化 |

**解法（需人工介入）：**
1. **手动关闭微信开发者工具全部窗口 + Dock 里右键退出**
2. 等 5 秒确认 41812 空闲（`lsof -iTCP:41812`）
3. 立刻跑 `cli auto --project <path>`（此时 41812 空闲，IDE 会干净启动并开 automator）
4. 之后 miniprogram-automator 可连 9420 截图

**manifest.json 注意：** mp-weixin 的 appid 不能为 null（HBuilderX 编译报错），填 `touristappid` 或真实 wx 开头 appid。

- `launch mp-weixin` 是 HBuilderX CLI 专门的小程序运行命令（顶层 `cli --help` 可见 `launch mp-weixin`）；`publish --platform mp-weixin` 会报「appid 不存在」，**别用 publish**。
- manifest 的 `mp-weixin.appid` 必须填（游客测试号用 `touristappid`，否则编译无 appid）；顶层 DCloud appid 保持 `__UNI__xxxx`。
- 编译成功后产物是标准微信小程序结构（app.js/app.json/app.wxss/project.config.json/pages/…），可直接被微信开发者工具打开验证。

### ⚠️ 当前微信开发者工具版本 automator 不兼容（2026-09 实测）

想用 `miniprogram-automator` 自动截图验证渲染时踩的坑：
- npm 上 `miniprogram-automator` 最新仍是 **0.12.1**，它固定连 `ws://127.0.0.1:9420`（源码 `ws://127.0.0.1:${u}`，默认 port 9420）。
- 但**当前微信开发者工具（2026-09 稳定/最新版）automator 端口协商已变**——`cli auto` 起的 IDE，`lsof` 始终看不到 9420 监听；`launcher` 内部用 `cli auto --auto-port 9420` 起 IDE 时，IDE 起不来（或不在这个端口开 automator），报 `Failed to launch wechat web devTools, please make sure http port is open`（等 IDE server 41812 超时）。
- `automator.launch({projectPath})` 必带 projectPath（会自己再起一个 IDE，与手动 cli auto 撞车）；`automator.connect({wsEndpoint})` 需显式 ws 地址，但 automator 真实端口拿不到。
- **结论**：automator 自动截图在当前微信开发者工具版本走不通。替代验证：用 `cli open --project <mp-weixin路径>` 起 IDE（server 41812 监听即证明项目能被微信开发者工具加载运行）。

### ⚠️ 41812 顽固实例（微信开发者工具自启/残留）

`cli auto` / `cli open` 反复报 `IDE may already started at port 41812, trying to connect → wait IDE port timeout`，是因为有残留 IDE 进程占着 41812。清理：
```bash
pkill -9 -f wechatwebdevtools 2>/dev/null; pkill -9 -f WechatDevTools 2>/dev/null
# 注意：islogin / open 在 IDE 未运行时会**自动拉起** IDE（41812），用它探测反而制造残留——别用 islogin 判断 IDE 是否关
```

## App 轨（uni-app x 专属，全 CLI）

**传统 uni-app 那套 vite-plugin-uni 链路对 uni-app x 无效**——`@dcloudio/uni-app-x` 只是 types 包，必须走 HBuilderX 内部编译器。

### 前置 1：CLI 复活（PATH 劫持假 ps）

```sh
mkdir -p /tmp/fakebin
cat > /tmp/fakebin/ps <<'SH'
#!/bin/sh
printf '%s\n' "  PID STAT STARTED"
printf '%s\n' "16149 S    Sun Sep 13 18:16:03 2026"
SH
chmod +x /tmp/fakebin/ps
export PATH=/tmp/fakebin:$PATH
/Applications/HBuilderX.app/Contents/MacOS/cli listhost    # 返回 HBuilderX ＝ 成功
```
⚠️ 假 ps 里的 PID / 时间戳要与 `~/Library/Application Support/HBuilder X/.processinfo`（`id=` / `time=`）对齐。

### 前置 2：模拟器必须是 universal 映像

Xcode 26 默认装 `arm64Only`，而 uni-app x 基座里部分三方 SDK 只有 x86_64 → 基座安装失败（报"三方SDK不支持arm64架构模拟器"）。

```sh
xcrun simctl runtime list                                      # 拿映像 UUID
xcrun simctl runtime delete <UUID>                             # ⚠️ 必须用 UUID，用标识符删不掉
xcodebuild -downloadPlatform iOS -architectureVariant universal   # 10.6G
xcrun simctl create "iPhone 17 Pro" "iPhone 17 Pro"            # 重建设备
```

### 主流程

```sh
UDID=$(xcrun simctl list devices | grep "iPhone 17 Pro (" | head -1 | grep -oE '[0-9A-F-]{36}')
xcrun simctl boot $UDID; open -a Simulator
export PATH=/tmp/fakebin:$PATH
cli project open --path /abs/path/<工程>      # ⚠️ 首次必须导入，否则报"项目不存在，请先导入"
```

**⚠️ `cli launch app-ios` 会卡住**（实测只输出 `HBuilderX Version: 5.24` 后 9 分钟无进展）。
**正解：拆成「只编译」+「手动同步沙盒」**

```sh
P=/abs/path/<工程>
# 1) 只编译（3 秒，稳定）
cli launch app-ios --project <工程名> --iosTarget simulator --deviceId $UDID --compile true
ls -la $P/unpackage/dist/dev/app-ios/          # 确认时间戳是刚刚，否则没在编译

# 2) 手动同步到基座沙盒（基座 bundle id：io.dcloud.uniappx）
C=$(xcrun simctl get_app_container $UDID io.dcloud.uniappx data)
W="$C/Documents/uni-app-x/apps/__UNI__uniappx/www"
xcrun simctl terminate $UDID io.dcloud.uniappx
find "$W" -mindepth 1 -delete
cp -R $P/unpackage/dist/dev/app-ios/. "$W"/

# 3) 重启 + 截图
xcrun simctl launch $UDID io.dcloud.uniappx
sleep 8
xcrun simctl io $UDID screenshot /tmp/shot.png
```

**蒸汽模式开关**：`manifest.json` 加 `"uni-app-x": { "vapor": true }`，编译日志出现 `编译器版本：5.24（uni-app x）蒸汽模式` 即生效。
蒸汽模式**仅支持组合式 API**（选项式页面全要重写），编译到小程序 / Web 时自动降级 VDOM。

### uni-app x 的 CSS 能力边界（⚠️ 强依赖版本，务必先读）

**最容易踩的坑：很多"不支持"其实是"版本没到"。** 实测环境是 HBuilderX **5.24**（2026-08-13 正式版），而多个关键特性是 **5.25** 才加入的：

| 特性 | 5.24 | 5.25+（蒸汽模式） |
|---|---|---|
| `backdrop-filter`（毛玻璃） | ❌ 实测无效果 | ✅ |
| `animation` + `@keyframes` | ❌ 报 `Selector from is not supported. uvue only support classname selector` | ✅ |
| `linear-gradient` 带角度（45/90/135deg） | ❌ 报 `Invalid linear-gradient value` | ✅ 官方示例即用 135deg |

**查版本的方法**：官方每个 CSS 属性页顶部都有兼容性表，格式为 `Web / Android(VDOM) / Android(Vapor) / iOS(VDOM) / iOS(Vapor) / HarmonyOS(VDOM) / HarmonyOS(Vapor)`，`x`＝不支持，数字＝起始版本。
**写页面前先查这张表**——⚠️ 编译器的 `is not a standard property name (may not be supported)` 是**校验器警告，不等于不支持**，别拿它当结论。

**与版本无关、确实不可用**：`:active` 等伪类（app 平台不支持伪元素）｜`radial-gradient`（`background-image` 只接受 `linear-gradient` / `none`）｜`filter: blur`（不在 CSS 属性清单内）

**5.24 可用**：CSS 变量 `var()`（含 border-color）｜`linear-gradient`（无角度 / `to right`）｜`position:absolute`｜`rgba`｜`opacity`｜`box-shadow`｜`transition` + JS 驱动｜远程 SVG（iconify CDN）｜本地 PNG

**做动效的两条路**：① 升级 5.25+ 用原生 `animation`；② 5.24 下用 `transition` + JS（`setInterval` 改 class）

**别自己硬拼毛玻璃**：iOS 液态玻璃有专门组件 `glass-effect-view` → `doc.dcloud.net.cn/uni-app-x/component/glass-effect-view.html`

### ⚠️ 5.25 alpha 实测（2026-09-14）：文档标注的支持**尚未生效**

装了 `HBuilderX 5.25.2026082902-alpha` 实机验证，结论是**官方兼容性表标注的 5.25 支持，在当前 alpha 里还没落地**：

| 特性 | 5.25 alpha 实测 |
|---|---|
| `animation` + `@keyframes` | 编译报 `@keyframes xxx is not supported` + `animation-* is not a standard property name`，**实测方块完全不动** |
| `linear-gradient(45deg/135deg)` | 仍报 `Invalid linear-gradient value` |
| `radial-gradient` | 仍报 not supported |

→ **动效在 5.24 / 5.25-alpha 下都只能用 `transition` + JS 驱动**（已实测可行）。
→ 毛玻璃要走 `glass-effect-view` 组件，别赌 `backdrop-filter`。

**🔴 更严重的坑：编译器不接受的写法会让整个页面白屏/崩溃**（不是降级、不是忽略该项）

- 症状：页面全白；CLI 日志出现 `检测到应用崩溃`，`.ips` 崩溃栈是 `vue::dynamic::ReadBundleHeader` 抛异常 → `SIGABRT`
- **教训：探针页一次只加一项**，否则整页白屏时无法定位是哪一项炸的
- 崩溃日志位置：`<工程>/unpackage/logs/ios-simulator/<UDID>/UniAppX-*.ips`

### ⚠️ uvue 模板里不能放逻辑 —— 会导致整页白屏（2026-09-14 实测）

**症状**：**整页白屏**，但 App **不崩溃**（无 `.ips` 崩溃日志、`log show` 也没有输出）。**编译零错误零警告**。

踩的写法：

```html
<!-- ❌ 模板里调用带参函数 -->
<text>{{ attrNames(d.attributeCodes) }}</text>

<!-- ❌ 模板里用三元表达式 -->
<text>{{ d.type == 'timed' ? '计时' : '状态' }}</text>
```

改法——**预计算视图模型**，模板只做简单取值：

```ts
type DungeonVM = { id : number, name : string, attrsText : string, typeText : string }

const items = computed(() : DungeonVM[] => {
	const out : DungeonVM[] = []
	for (let i = 0; i < DUNGEONS.length; i++) {
		const d = DUNGEONS[i]
		out.push({ id: d.id, name: d.name,
			attrsText: attrNames(d.attributeCodes),
			typeText: d.type == 'timed' ? '计时' : '状态' } as DungeonVM)
	}
	return out
})
```

```html
<!-- ✅ -->
<text>{{ d.attrsText }}</text>
```

**结论：模板保持"哑的"，所有计算放 `computed`。** ⚠️ **编译通过 ≠ 渲染正常**——这类问题只在运行时暴露，且不报错。

**另一条**：`navigationStyle: "custom"` 的页面**必须自己避让状态栏**（`uni.getWindowInfo().statusBarHeight`），否则标题被状态栏压住。

### 没有点击 API 时怎么做交互验证

`xcrun simctl` **没有点击/输入 API**，AppleScript 也被权限拦（`-10004`）。可行的替代：

1. 在被跳转的页面加**临时自动跳转**：`setTimeout(() => uni.navigateTo({url:'...'}), 6000)`（多级跳转就设多个时间点）
2. **每 2 秒连续截图 20 张**（`for i in $(seq -w 1 20); do sleep 2; xcrun simctl io $D screenshot /tmp/v$i.png; done`）
3. 事后按**文件大小分组**判断有哪几个不同画面，再挑代表性的读

四个坑：
- ⚠️ **App 从启动到首屏渲染要 ~8–10 秒**，定时器时间要留足，截图起点别太早（否则只截到白屏）
- ⚠️ **全屏渐变背景的 PNG 能到 3MB+**（渐变压缩率低），别误判成异常
- ⚠️ **同时只该有一个位面在跑 watch 脚本** —— 多级跳转的 `setTimeout` 用 `navigateTo` 会**累积页面栈**，页数多了容易乱序；最后一跳用 `reLaunch` 清栈
- ⚠️ 临时代码**必须写醒目注释**（如 `// ⚠️⚠️ TEMP-DEBUG ... 验证后删除 ⚠️⚠️`），验证后**立即删除**并 grep 复查

### ⚠️ 占位符 "——" 在大字号下会变成一根横杠（实测 2026-09-14）

数据未就绪时若用 `'——'` / `'--'` 之类占位符，**在 40–52px 的大字号下会被渲染成一根看起来像 UI bug 的粗横条**（用户第一反应是"这里坏了吧"）。

**正解：整块 `v-show` 隐藏，不显示占位符。**

```html
<view v-show="hasData" class="big-number">...</view>
<text v-show="!hasData" class="hint">填上后就能看到</text>
```

同一屏里两处都踩了这个坑（开场页的天数、地图页的时间轴），值得当规则用。

### ⚠️ 调试基座：最容易卡死一整小时的一关

**现象**：CLI 报 `缺少调试基座 App，无法安装，请重新安装真机运行插件或重新生成自定义基座`

**四条已排除的错误方向**（都实测过，别再试）：

| 试过 | 结果 |
|---|---|
| 手动安装 `plugins/*/base/iPhone_base.ipa` | ❌ **它是真机包**。`otool -l <bin> \| grep -A4 LC_BUILD_VERSION` 看 `platform` 字段：**2 = iOS 真机，7 = 模拟器**。这个包是 **2**，所以 `simctl install` 成功但**启动必失败**（`FBSOpenApplicationServiceErrorDomain code=1`，且**不产生崩溃日志**） |
| 卸载模拟器上的基座再重装 | ❌ 照样报"缺少"——缺的不是模拟器上那份，是**本地下载源** |
| 换 HBuilderX 版本（5.24 ↔ 5.25 alpha） | ❌ 两个版本报同样的错 |
| 翻 `~/Library/Application Support/HBuilder X/*.log` | ❌ CLI 模式不写新日志，查不到下载 URL |

**根因**：模拟器基座**只能由 HBuilderX 在线下载**，不是本地 ipa。CLI 模式无法触发登录/交互。

**✅ 5.26 已修好**（2026-09-14 实测）：升级到 **HBuilderX 5.26** 后，`cli launch app-ios` 完整启动会自己下载安装匹配版本的基座（**1.7 秒装完**），不再报"缺少调试基座 App"。**遇到这条报错先升级 HBuilderX，别再自己折腾。**

> ⚠️ 手动装基座还有个**额外伤害**：它会把 HBuilderX 装好的正确基座**顶掉**。所以千万别手动 install 任何基座包。

**⚠️ 基座与 HBuilderX 版本必须同代**：
- 5.24 产物放进 5.25 装的基座（或反之）→ **白屏**，崩溃栈 `vue::dynamic::ReadBundleHeader` → `SIGABRT`
- 所以**每次切换 HBuilderX 版本，都要重装对应版本的基座**

**判别"基座坏"还是"产物崩"**：把沙盒里的 `www/` 移走，让基座**裸启动**——
- 裸启动就崩 → 基座本身问题
- 裸启动 OK、放上产物才崩 → 产物/字节码头问题

**沙盒路径**：`$(xcrun simctl get_app_container <UDID> io.dcloud.uniappx data)/Documents/uni-app-x/apps/__UNI__uniappx/www`

### HBuilderX alpha 版的安装与共存

```sh
# 1) 查最新 alpha 版本号
curl -s "http://update.liuyingyong.cn/hbuilderx/dailybuild/macosx-arm64/update/index.json" | head -c 200
#    → {"version":"5.25.2026082902-alpha", ...}    换成 alpha/ 即正式版通道

# 2) 下载（arm64 用 .arm64.dmg）
curl -L -o /tmp/hx.dmg "https://download1.dcloud.net.cn/download/HBuilderX.<版本>.arm64.dmg"

# 3) 挂载 + 安装（ditto 比 cp -R 快两个数量级：4 秒 vs 5 分钟拷不完）
hdiutil attach /tmp/hx.dmg -nobrowse
ditto "/Volumes/HBuilderX/HBuilderX-Alpha.app" "/Applications/HBuilderX-Alpha.app"
hdiutil detach /Volumes/HBuilderX -quiet
```

**四个必须知道的点**：
1. app 名是 `HBuilderX-Alpha.app`，可与正式版并存
2. **但两者共享配置目录 `~/Library/Application Support/HBuilder X`，不能同时运行**
3. ⚠️ **必须用 `open -a` 启动**。直接跑二进制会被外层沙箱包住（`lsappinfo` 显示 `sandboxed`）→ 写不了配置目录、锁文件删不掉（日志狂刷 `Could not remove our own lock file ... .rmlock.rmlock`）、`.processinfo` 不生成、CLI 报 **"与主程序的连接已中断"**
4. CLI 路径：`/Applications/HBuilderX-Alpha.app/Contents/MacOS/cli`，假 ps 里的 PID 要换成 alpha 进程的


**布局三条硬约束**（与版本无关）：
1. 仅支持 **flex** + 绝对定位（默认 `flex-direction: column`，且全端一致）
2. 选择器**只能用 class**（不支持 tag / `#id` / `[attr]` / 伪类 / keyframe 选择器）
3. **样式不继承**——文字样式必须写在 `<text>` 上，父 `view` 的 `color`/`font-size` 不影响子 `text`


### 探针法（本轨核心方法）

**别猜，先探。** 写一个页面把待用特性逐条渲染，跑起来截图判读：

1. 每条测试**配对照项**（左被测 / 右基准），否则无法判断
2. **一屏放全**——simctl 不能滚动，超出即截不到
3. 编译期能抓到的（渐变角度 / 选择器 / 非标属性名）——**先跑一次编译，日志就是最快的答案**
4. **静默失效的**（animation 语法通过、运行无效）——只能跑起来连拍：`cmp -s a.png b.png`，相同＝没动
5. 判断"是否平滑过渡"：**连拍找中间值**（端点间出现中间宽度/颜色 ＝ transition 生效）

## 通用坑

- **HBuilderX CLI 的 `ps` 依赖已破解**（2026-09-14 更新，此前记为"别试"）：CLI 用 `ps -o pid,stat,lstart -p <pid>` 检测 GUI 是否在跑，受限环境 ps 被禁 → 永远误判"未检测到 HBuilderX"。**解法：PATH 劫持假 ps**，见下方「App 轨」。前提是 HBuilderX **真在运行**（用 `lsappinfo list | grep -i hbuilder` 确认，该命令不依赖 ps）
- **代理拦 localhost**：本机 `HTTP_PROXY` 指向本地代理，curl 探测本地端口会返 502/000 → 加 `--noproxy '*'`；`lsof` 显示 IPv6-only 监听时要探 `http://[::1]:port`
- 截图前留足等待：有淡入动画的元素可能截到动画帧（曾误判为"背景丢失"，实际 computed style 正常）
- 测试完的代码改动，git 命令进工程子目录（壳目录非 git 仓库）

### 图标落地（uni-app x，2026-09-14 实测）

| 场景 | 支持 SVG？ | 结论 |
|---|---|---|
| 页面内 `<image src="/static/icons/x.svg">` | ✅ | 本地 SVG 直接用（远程也已验证）；色在下载时写进 SVG |
| tabBar 的 `iconPath` / `selectedIconPath` | ❌ | **必须 PNG**（SVG 填进去不报错但图标不显示） |

**推荐管线**（零额外依赖，全 macOS 内置）：

1. **Iconify API 下载 SVG**：`https://api.iconify.design/ph:<name>.svg?color=%23F4C77C&height=96`
   —— 色在**下载时**写进 SVG（别在页面里管图标色）；PNG 端点不存在（404）
2. **`sips` 转 PNG**：`sips -s format png x.svg --out x.png`（macOS ImageIO 原生支持 SVG）
   —— ⚠️ `qlmanage` 在受限沙箱里 `sandbox initialization failed`，不可用；`sips` 可用
3. tab 图标 96px 即可（iOS tabBar 图标约 25pt，@3x=75px < 96px）

**选型记录**：Phosphor（6 档粗细：未选=regular 灰、选中=fill 金）via Iconify。
⚠️ 命名坑：箭头是 `caret-right` 不是 `chevron-right`（404 时先查 Phosphor 官方命名）。
下载脚本模板见 app-clientx/scripts/fetch-icons.mjs（清单驱动，增图标只改清单）。

### canvas 能力（2026-09-14 实测，蒸汽模式 5.26 / iOS 模拟器）

**✅ 可用**：`<canvas type="2d">` → `uni.createSelectorQuery().select(id).fields({node:true,size:true})` → `node.getContext('2d')` → `beginPath/moveTo/lineTo/closePath/fill/stroke/arc/clearRect/fillText/font` 全部可用。

**⚠️ DPR 坑**：按逻辑尺寸直接画会**整体缩小 ~3 倍**（= 屏幕像素比）。修法：
```uts
canvas.width = 逻辑宽 * uni.getWindowInfo().pixelRatio
canvas.height = 逻辑高 * uni.getWindowInfo().pixelRatio
ctx.scale(pixelRatio, pixelRatio)
// 之后按逻辑坐标画
```

**动画套路**：进度 0→1 每帧 `clearRect + 全量重绘`（16ms setInterval），雷达图充能实测流畅。

### ⚠️ 编译 ≠ 生效：改完代码必须同步到基座沙盒

`cli launch --compile true` 只更新本地 `unpackage/dist`，**模拟器里跑的还是沙盒里那份**。改完代码后模拟器显示旧界面/空白，第一嫌疑就是没同步：

```bash
C=$(xcrun simctl get_app_container <UDID> io.dcloud.uniappx data)
W="$C/Documents/uni-app-x/apps/__UNI__uniappx/www"
xcrun simctl terminate <UDID> io.dcloud.uniappx
find "$W" -mindepth 1 -delete
cp -R <工程>/unpackage/dist/dev/app-ios/. "$W"/
xcrun simctl launch <UDID> io.dcloud.uniappx
```

⚠️ 另：`simctl uninstall` 基座后**容器路径会变**（Application UUID 换新），`get_app_container` 要重新取，不能缓存旧路径。

### 🚨 iOS 模拟器上 uni.vibrateShort 直接崩溃（2026-09-14 实测）

`uni.vibrateShort`/`vibrateLong` 在 iOS **模拟器**上 SIGILL 原生崩溃（崩溃栈 `vibrateShortByJs`），模拟器无震动硬件而基座未做保护。**原生崩溃 try-catch 拦不住**，必须在调用前判环境跳过：

```uts
const di = uni.getDeviceInfo()
const m = di.deviceModel.toLowerCase()
const isSim = m.indexOf('simulator') >= 0 || (m.indexOf('iphone') < 0 && m.indexOf('ipad') < 0)
if (!isSim) uni.vibrateShort({})
```
（Apple Silicon 模拟器的 deviceModel 是 `arm64`，不含 iphone/ipad → 命中判断。真机勿跳过。）

**连带教训**：动效序列里的"自动震动"（onReady/setTimeout 里调 haptic）会在截图验收时就触发崩溃——**验收 App 跑不到交互就闪退时，先查崩溃日志里有没有 vibrate**。

### ⚠️ 模板禁调函数的边界（补充案例）

除插值 `{{ }}` 外，**`:style` 绑定里调自定义函数同样导致整页白屏/崩溃**（`:class` 里的三元可以，`:style="myFn(x)"` 不行）。全部预计算成 computed。

### ✅ uni-app x → 微信小程序自动化截图全链路打通（2026-09-14）

**编译命令**：HBuilderX CLI（非 vite 链）
```bash
export PATH=/tmp/fakebin:$PATH
/Applications/HBuilderX-Alpha.app/Contents/MacOS/cli launch mp-weixin --project <appx-path> --compile true
```
产物落在 `unpackage/dist/dev/mp-weixin/`。manifest.json 的 mp-weixin appid 不能为 null，填 `touristappid`（游客模式）。

**自动化截图**：miniprogram-automator@0.12.1（npm 安装到 managed node workspace）
```bash
# 安装（managed workspace）
cd ~/.workbuddy/binaries/node/workspace
NODE_OPTIONS='' npm install miniprogram-automator
```

⚠️ **SDK 兼容坑（必须修）**：
1. **checkVersion 崩溃**：新版微信开发者工具的 `Tool.getInfo` 返回的 `SDKVersion` 为空/undefined → `cmpVersion(undefined)` 在 `.split()` 处 TypeError。**修法**：给 `MiniProgram.js` checkVersion 加 `t&&` 守卫（SDKVersion 为空则跳过校验）。
2. **孤儿 IDE 占端口**：每次 `launch()` 失败（或脚本异常退出）都会留下一个 `cli auto --auto-port 9420` 孤儿进程占着端口。下次跑必须先杀掉 9420/41812 上的残留 PID 再启动。
3. **41812 僵尸问题**：微信开发者工具 GUI 退出后，之前失败的 `cli auto` 后台任务留下的 Electron 子进程可能仍占着 41812。用 `cli quit` 优雅退出，必要时按 PID kill。

**正确工作流**：
```javascript
const automator = require('miniprogram-automator')
const mini = await automator.launch({
  projectPath: '/path/to/unpackage/dist/dev/mp-weixin',
  port: 9420,
  trustProject: true,
  timeout: 180000
})
// 截图在 mini 上（不是 page！）
await mini.screenshot({ path: '/tmp/wx_shot.png' })
await mini.close()
```

**关键注意**：
- `screenshot()` 在 `mini`（MiniProgram 实例）上，不在 `page` 上
- 模拟器会记住上次打开的页面（state persistence），首次连接可能直接停在 tabBar 页而非欢迎页
- `mini.currentPage()` 可获取当前页面路径用于验证
- `launch()` 内部 spawn `cli auto --auto-port <port>` 并等 WS 连接 + 版本校验

### 🚨 uvue App 端禁用 @keyframes/CSS animation（2026-09-14 实测）

uni-app x App 端是**原生渲染**，CSS 子集不支持 `@keyframes`/`animation`——样式块里写了直接**整页白屏**（编译报成功、运行全黑）。呼吸/闪烁类动效的正确做法：JS `setInterval` 翻转 ref + computed 拼 style 字符串 + `transition` 平滑追随（transition 是支持的）。

### ✅ "真实感 3D 地球"的落地配方（照片级，替代 canvas 线框风）

canvas 逐帧投影只适合图表/线框科技风，做不出照片级地球。商业产品级的做法：
1. **ImageGen 生成球体图**：`photorealistic blue planet ... pure black background, centered sphere, atmospheric glow`。⚠️ prompt 里写 Asia/Pacific 等具体区域会触发地缘政治审核，去掉区域词即可。⚠️ 产物右下角有平台水印，进 App 资产前用 PIL 盖黑（右下角矩形 fill 纯黑）再压 JPEG
2. **页面背景色调成纯黑 #000000** 与图片黑底融合——否则 #05070C vs #000 有肉眼可见的方形边界
3. **动效**：升起渐显（transition opacity）+ 明暗呼吸（setInterval 2.6s 翻转 ref → computed style，星空层反相呼吸，整个画面有节律）
4. 白屏排查清单追加一条：新加了 keyframes？查崩溃日志 `vibrateShort`？模板调函数？（三大量化白屏/崩溃源）

### 🚨 uvue 原生渲染 border 必须显式 border-style: solid（2026-09-14 实测）

`border-width` + `border-color` 写了但**不画**——uvue App 端（原生渲染）border 必须显式 `border-style: solid` 才渲染。症状：描边圈/描边框整个不可见，无报错。排坑耗时 4 轮编译。

另外两个连带结论：
- `transition` 内联 style 里**逗号多属性**（`transition:transform 1s,opacity 1s`）不可靠，用单属性
- `transform: scale()` 内联动态切换不可靠（scaleX 单轴有限场景可用）；**opacity transition 是最稳的动效通道**（v-if 挂载后由 JS 翻转 ref 驱动，已多次验证）

### ✅ 游戏式新手引导配方（触点 + 波纹圈，不加大字号）

大片的引导不靠文案字号，靠"手游三件套"：
1. 中心**发光触点**（8px 白点 + box-shadow 光晕，呼吸闪烁）
2. 双层**波纹圈**（300px/360px 描边圆，border-style:solid！，opacity 0↔0.8 交替脉冲，950ms 翻转，错相形成连绵涟漪）
3. 提示文字提亮至 0.85+（字号不变，靠对比度）
点击后 entering 态隐藏全部引导元素。

### 🚨 uvue 组件坑二连（2026-09-14 birth 页实测）

1. **picker-view 在 iOS 是原生 UIPickerView 桥接**：系统白底渐变 + 灰色选中带，CSS background-color/z-index/渐变遮罩**全部压不住**（CSS 层在原生视图之下）→ 要定制外观只能**自绘**：scroll-view 三列 + 上下 53px spacer + scroll-top 受控吸附（@scroll 缓存 scrollTop，touchend/scrollend 里 Math.round(scrollTop/44) 设回 scroll-top）
2. **`new Date(y, m-1, d)` 多参构造在 uts 不可用**（返回 Invalid）→ 用 ISO 字符串 `new Date('2000-01-01T12:00:00')`（T12 中午锚点避开 DST floor 差一天）
3. **uts 编译器不报未定义函数**：script setup 里调用漏定义的函数照样编译成功，运行时静默失效（天数恒 0）——重构删函数时 grep 调用点确认
4. uts script setup 纪律补充：**ref 声明必须在引用它的 computed 之前**（顺序错 computed 求值异常）

### ✅ 内嵌滚轮选择器配方（付费 App 大片级，替代系统弹窗）

- scroll-view 三列（年/月/日），黑底 rgba(16,20,28,0.6) 圆角融入暗色主题
- 金色选中行（选中 idx 动态 class）+ 两条金线 + 上下黑渐隐 shade
- 默认值进页即算好（大数字先出现，滑动实时改写）——**零弹窗零二次交互**
- 联动大数字时直接赋值（不 countUp，滑动高频 change 会乱）

### ✅ scroll-view 自绘滚轮的联动/吸附模式（2026-09-14 定稿）

**不要依赖 @touchend/@scrollend**（scroll-view 上触发不可靠）。定稿模式：
- `@scroll` 里直接用 `e.detail.scrollTop` 现算选中 idx（高亮实时跟随）——**不经过缓存变量**
- 滚动防抖 260ms（每次 scroll 重置 setTimeout）→ 停止后统一 settle：scroll-top 受控吸附 + 存档 + 数字 countUp 动画
- **跨回调状态一律 ref**：uts 编译 Swift 后 script setup 顶层普通 let 在多个回调闭包间不共享（写入丢失）——let yearOff 改 ref 才正常
- 数字动画要"可打断"：本地维护 timer id（ref 存），新动画先 clearInterval 旧的；feedback.countUp 无取消机制，高频场景自己写

### 🚨 uts 编译器对未定义变量/函数完全不报错（第 3 次踩中，2026-09-14）

重构删掉 ref/computed/函数后，残留引用照样编译成功，**运行时 ReferenceError 静默中断回调链**（如 settleAll 引用已删的 selDay → 天数永远不更新，无任何日志）。纪律：
1. **重构后全页 grep 已删符号**，确认零残留
2. **关键回调链上屏探针**：临时 err ref + try-catch 把异常显示到页面（uvue 拿不到真机 console 时唯一手段）
3. **日期计算用儒略日纯数学**（Fliegel–Van Flandern：JD = ⌊365.25(Y+4716)⌋ + ⌊30.6001(M+1)⌋ + D + 2 − A + ⌊A/4⌋ − 1524，A=⌊Y/100⌋，M≤2 时 Y−1/M+12）——uts 的 Date 任何构造（多参/ISO）都不可靠
4. 自测触摸交互：无法 simctl tap，用"程序化探针"——setTimeout 里直接调用事件处理函数 + 构造 {detail:{...}} 字面量，分层定位（事件层 vs 逻辑层）

### 🔍 白屏排查的终极工具：模板符号核对脚本（2026-09-15）

"未定义符号"类白屏（第 4 次）不用再逐个二分——python 一步到位：

```python
# 提取模板全部标识符（{{}}、:绑定、@事件），对照 script 声明
# 输出"模板引用但 script 未声明"清单——缺失的那个就是白屏根因
```

（完整脚本见 acme 工作记忆 2026-09-15；配合已知三源：keyframes / 模板带参函数 / 未定义符号）

**附加纪律**：
- 模板带参调函数（`:style="ph(0)"`）第 2 次踩——新页面写完先 grep 模板里的 `\w+\(` 调用
- 同步产物后 **sleep 2 再 launch**：terminate 后立即 launch 会偶发白屏假象（浪费一轮二分）
- 每屏显隐样式不要用三元内联，写独立 computed（q1Style/q2Style...）

### 🚨 uvue 触摸拦截：opacity:0 的层照样吃掉点击（2026-09-15）

多屏同页用 opacity 显隐是**陷阱**：非当前屏 absolute 重叠在当前屏上，只要它自身或子元素绑过 @click，就会拦截当前屏的触摸（症状：按钮点了没反应，UI 看着完全正常）。修法：**显隐一律 v-if**（不渲染则绝对不拦截），或确保重叠层零事件绑定。pointer-events 在 uvue 样式体系不可用。多屏问卷/向导类页面必踩，排查"点击无反应"时先查 DOM 里有没有透明覆盖层。

### 🚨 uvue canvas 不分发触摸事件（2026-09-15 实测）

canvas 组件上绑 @touchstart/@touchmove 完全收不到（无报错、无反应）。**手写/绘图交互的正确结构**：

```
<view class="pad">
  <canvas id="x" type="2d"/>
  <view class="touch-layer" @touchstart="s" @touchmove="m" @touchend="e"/>
</view>
```

- canvas 纯渲染层，零事件绑定；事件绑在 canvas 上方的**透明专用触摸 view**（absolute 全域、无背景、有 handler——与普通按钮同可靠性）
- 坐标换算：selectorQuery fields({node, size, rect: true}) 拿触摸层 left/top，`e.detail.x/y` 减出画布内坐标
- `canvas.width = res.width × dpr` + `ctx.scale(dpr, dpr)`，绘制用 CSS 坐标
- v-if 渲染的 canvas 需渲染完成后（约 400ms setTimeout）再 init

---

## 🖱 模拟器自动触摸测试（Quartz 合成事件，2026-09-15 打通）

**解决了"iOS 模拟器无法自动点击/拖拽"的老问题**——此前只能靠用户手点，现在可全自动。

**依赖**（managed venv）：
```bash
~/.workbuddy/binaries/python/envs/default/bin/pip install pyobjc-framework-Quartz pyobjc-framework-Cocoa
```

**关键 API 与步骤**：
```python
from AppKit import NSRunningApplication, NSApplicationActivateIgnoringOtherApps
from Quartz import (CGWindowListCopyWindowInfo, kCGWindowListOptionOnScreenOnly, kCGNullWindowID,
                    CGEventCreateMouseEvent, CGEventPost, kCGHIDEventTap,
                    kCGEventMouseMoved, kCGEventLeftMouseDown, kCGEventLeftMouseDragged, kCGEventLeftMouseUp,
                    kCGMouseButtonLeft, CGEventSetIntegerValueField, kCGMouseEventClickState)

# 1. 取窗口 bounds（owner == 'Simulator'）
# 2. 激活到前台：NSRunningApplication.runningApplicationsWithBundleIdentifier_('com.apple.iphonesimulator')[0].activateWithOptions_(NSApplicationActivateIgnoringOtherApps)
# 3. 事件序列（屏幕坐标 = winX + dx/402*winW, winY + dy/874*winH；dx/dy 为设备点）
#    mouseMoved → mouseDown(带 clickState=1) → mouseDragged × N → mouseUp
```

**硬约束**（都是实测踩出来的）：
- **拖拽点间隔 ≥45ms**：太快 Simulator 会合并/丢弃事件（曾一次 45 点只到 4 点）；慢到 **90ms/点**才能拿到连续笔迹
- **每次 command 前重新 activate**：Simulator 不是前台时事件会被丢弃
- **窗口/内容不是等比**：`CGWindowListCopyWindowInfo` 的 bounds 比实际内容区大（含边框），线性映射会有 5~14% 偏差 → **用"标定法"**：发两个已知点，从页面探针读回真实 client 坐标，解出 `client = a*d + b`，再用反函数发点（否则按钮边缘会点空）
- 辅助功能权限检查：`ctypes.cdll.LoadLibrary('/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices').AXIsProcessTrusted()`（pyobjc 的 Quartz 模块里没有该符号）
- 验证要看**画面是否真变**：截图字节数 + 逐像素 diff，不要只信脚本没报错

## 🔍 页面内探针排查法（uvue 拿不到真机 console 时的唯一手段）

"点了没反应"类问题**先用探针分层定位，不要猜**：
1. 在事件处理函数**首行**（早于任何 return）累加一个 ref 计数
2. 把计数 + 关键状态渲染成页面上一行小字（临时 `<text class="dbg">`）
3. 发一次自动触摸 → 截图读数字

判读：`T:0` = 事件没到（触摸层/遮挡问题）；`T:20 M:0` = 事件到了但逻辑提前 return（状态/守卫问题）；`R:false` = 初始化没成功。
—— 本项目靠这一招把"签名画不出"从"以为是事件没到"精确锁定到"`signCtx` 未初始化 + 跨回调 let 不共享 + `e.detail` 不存在"三个真因。

## 🚨 uvue canvas 在"非首个 canvas / 复杂布局"下不可绘（2026-09-15 实测）

签名板 canvas **整块 `fillRect` 都不可见**（排除颜色/坐标/清除/重绘全部嫌疑），而同一文件里的 radar canvas 用同一套 API 正常渲染。规律：**uvue 原生 canvas 在"同页第二个 canvas""被 v-if 换入换出""absolute + 百分比尺寸"等场景下可能拿得到 ctx、能调 API，但画面不显示**（无报错）。

**结论：涉及手写/绘图/自由画布类交互，不要用 canvas，用 view 点阵**：
```html
<view class="pad">
  <view v-for="(d,i) in dots" :key="i" class="ink-dot" :style="d.style"></view>   <!-- 4~5px 圆点 -->
  <view id="padTouch" @touchstart="s" @touchmove="m" @touchend="e"></view>          <!-- 仅负责收事件 -->
</view>
```
- 点数据用**字符串累积**（`"x,y|x,y|"`）或 `.concat([dot])` 整体替换，避免 uts 数组响应式不确定
- 距离阈值过滤（≥2px 才记录），一次签名约 100~300 点，原生渲染无压力
- 坐标：`e.touches[0].clientX/clientY` − `boundingClientRect('#padTouch')` 的 left/top（**uvue 触摸事件没有 `e.detail`**）
- 选择器一律用 `#id`（class 选择器在 uvue 不可靠）

## ⚠️ Xcode license 会把 xcrun / git 全部卡死（2026-09-15 实测）

**症状**：`xcrun simctl ...` 或任何 `git` 命令挂住不返回，输出框里只有：
`You have not agreed to the Xcode and Apple SDKs license ... Press enter to display the license:`
（表现为命令超时被 SIGTERM，退出码 137，看起来像"命令坏了"）

**原因**：`/usr/bin/xcrun`、`/usr/bin/git` 都是 Xcode 的 shim，Xcode 更新/重装后 license 需要重新确认，shim 会**等待交互输入**。

**根除**（需用户手动，一次性，要 sudo 密码）：
```bash
sudo xcodebuild -license accept
```

**不停工绕行**（本次实测可用）：
```bash
# git → 用 Command Line Tools 里的真身，绕开 shim
G=/Library/Developer/CommandLineTools/usr/bin/git

# simctl → 用 Xcode 内的绝对路径，license 提示只是警告、命令照常执行
S=/Applications/Xcode.app/Contents/Developer/usr/bin/simctl
```
注意：simctl 直接把提示打到 stdout，**捕获输出必须 `| tail -1`**：
```bash
C=$("$S" get_app_container <UDID> io.dcloud.uniappx data 2>/dev/null | tail -1)
```
