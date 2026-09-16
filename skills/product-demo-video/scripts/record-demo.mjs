#!/usr/bin/env node
/**
 * Product Demo Video Recorder — portable build (macOS + Linux)
 *
 * 基于 ClawHub `product-demo-video` v1.0.0 (MIT-0, by xiazai77) 改造：
 *  1. 浏览器 / 字体 / Python / edge-tts 全部自动探测，可用环境变量覆盖（原版 Linux 路径写死）
 *  2. 场景从外部 JSON 读取（支持中文字幕），新增声明式步骤 DSL（原版把 JS 函数内联在脚本里）
 *  3. **边执行步骤边截图** —— 原版是等动作跑完再截图，录出来只是静态终态，录不到操作过程
 *  4. 去掉 shell 字符串拼接，一律 spawnSync 传参数组（消除 narration/文案的注入面）
 *  5. 移除原版硬编码的 "100% Client-Side" 徽标（未经核实不得当宣传口径），改为按场景可配
 *
 * 用法：
 *   SCENES_FILE=./scenes.json OUT=./demo.mp4 node record-demo.mjs
 *   node record-demo.mjs            # 无 SCENES_FILE 时用内置示例场景
 *
 * 环境变量：
 *   SCENES_FILE  场景 JSON 路径（默认 ./scenes.json，不存在则用内置示例）
 *   OUT          输出 mp4 路径（默认 ./demo-video.mp4）
 *   WORK_DIR     中间产物目录（默认 <tmp>/demo-video-work）
 *   CHROME_PATH  浏览器可执行文件（默认自动探测 Chrome/Chromium/Edge）
 *   FONT_BOLD / FONT_REG  字幕字体（默认自动探测，优先支持中文的字体）
 *   PYTHON / EDGE_TTS     解释器与 TTS 命令（默认自动探测）
 *   VOICE        音色（默认 zh-CN-XiaoxiaoNeural）
 *   VOICE_RATE   语速（默认 +0%）
 */

import { createRequire } from 'module'
import { spawnSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'
import net from 'net'

const require = createRequire(import.meta.url)

// ==================== 依赖探测 ====================

const exists = (p) => {
  try {
    return !!p && fs.existsSync(p)
  } catch {
    return false
  }
}
const firstExisting = (list) => list.filter(Boolean).find(exists)

function loadPuppeteer() {
  const tries = [process.env.PUPPETEER_MODULE, 'puppeteer', 'puppeteer-core'].filter(Boolean)
  for (const name of tries) {
    try {
      return require(name)
    } catch {}
  }
  console.error('❌ 找不到 puppeteer / puppeteer-core。')
  console.error('   安装：npm i puppeteer-core    （或用 PUPPETEER_MODULE 指定绝对路径）')
  console.error('   若装在非默认位置，请设 NODE_PATH 指向其 node_modules。')
  process.exit(1)
}

// 系统浏览器候选（仅当 puppeteer 自带浏览器不可用时的兜底）
const SYSTEM_CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
]

// 优先用 puppeteer 配套下载的浏览器：系统 Chrome 会自动升级，
// 一旦大版本跑在 puppeteer 前面就会出现 "Requesting main frame too early!"（已踩）
// 注意：puppeteer 25 起 executablePath() 是异步的，必须 await。
async function resolveChromePath(puppeteer) {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  try {
    const p = await puppeteer.executablePath()
    if (exists(p)) return p
  } catch {}
  return firstExisting(SYSTEM_CHROME_CANDIDATES)
}

// 优先选支持中文的字体：macOS 的 Arial Unicode / 黑体，Linux 的 Noto CJK
const FONT_BOLD = firstExisting([
  process.env.FONT_BOLD,
  '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  '/System/Library/Fonts/STHeiti Medium.ttc',
  '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',
  '/usr/share/fonts/google-noto/NotoSans-Bold.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
])
const FONT_REG = firstExisting([
  process.env.FONT_REG,
  '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  '/System/Library/Fonts/STHeiti Light.ttc',
  '/System/Library/Fonts/Supplemental/Arial.ttf',
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
  '/usr/share/fonts/google-noto/NotoSans-Regular.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
])

const PYTHON =
  firstExisting([
    process.env.PYTHON,
    path.join(os.homedir(), '.workbuddy/binaries/python/envs/default/bin/python'),
    '/usr/local/bin/python3',
    '/usr/bin/python3',
  ]) || 'python3'

const EDGE_TTS =
  firstExisting([
    process.env.EDGE_TTS,
    PYTHON !== 'python3' ? path.join(path.dirname(PYTHON), 'edge-tts') : null,
  ]) || 'edge-tts'

// ==================== 配置 ====================

const CONFIG = {
  // 1080p 起步：1280×720 对「侧边栏 + 主内容」型后台太挤，会被裁掉侧栏底部和表格
  width: Number(process.env.WIDTH || 1920),
  height: Number(process.env.HEIGHT || 1080),
  captureFps: Number(process.env.CAPTURE_FPS || 6),
  outputFps: Number(process.env.OUTPUT_FPS || 24),
  crf: Number(process.env.CRF || 20),
  voice: process.env.VOICE || 'zh-CN-XiaoxiaoNeural',
  // edge-tts 中文默认语速偏慢，+10% 接近自然讲述；需要更快可再加
  voiceRate: process.env.VOICE_RATE || '+10%',
  // 场景末尾留白秒数。原来写死 +2s，5 段就是 10 秒静音，是「停顿太长」的主因
  tailPad: Number(process.env.TAIL_PAD || 0.5),
  // 场景最短秒数。原来 max(8, ...) 会把 4 秒台词硬拉到 8 秒
  minScene: Number(process.env.MIN_SCENE || 3),
  // 鼠标光标：CURSOR=0 关闭。开启时会记录轨迹并在叠加阶段绘制
  cursor: process.env.CURSOR !== '0',
  cursorSpeed: Number(process.env.CURSOR_SPEED || 0.55), // 光标走完全程的秒数
  chromePath: process.env.CHROME_PATH || null,
  workDir: process.env.WORK_DIR || path.join(os.tmpdir(), 'demo-video-work'),
  output: process.env.OUT || './demo-video.mp4',
  fontBold: FONT_BOLD,
  fontReg: FONT_REG,
}

// ==================== 场景加载 ====================

const DEFAULT_SCENES = [
  {
    id: 'intro',
    title: 'YourApp',
    subtitle: '一句话说清它是什么',
    narration: '这是开场。用一句话说清你的产品是什么、解决谁的问题。',
    url: 'https://example.com/',
    type: 'intro',
    steps: [{ do: 'wait', ms: 1500 }],
  },
  {
    id: 'feature1',
    title: '核心功能',
    subtitle: '一句话说清它干什么',
    narration: '这里演示你最想让用户看到的那一步操作。',
    url: 'https://example.com/',
    type: 'tool',
    steps: [
      { do: 'wait', ms: 800 },
      { do: 'scroll', y: 300, times: 2, hold: 500 },
    ],
  },
  {
    id: 'outro',
    title: '现在就来试试',
    subtitle: 'example.com ｜ 免费',
    narration: '结尾给出网址和一句行动号召。',
    url: 'https://example.com/',
    type: 'outro',
    steps: [{ do: 'wait', ms: 1500 }],
  },
]

function loadScenes() {
  const file = process.env.SCENES_FILE || './scenes.json'
  if (exists(file)) {
    const scenes = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (!Array.isArray(scenes) || !scenes.length) throw new Error(`场景文件为空或格式不对：${file}`)
    console.log(`📄 场景来自 ${file}（${scenes.length} 个）`)
    return scenes
  }
  console.log('📄 未找到 SCENES_FILE，使用内置示例场景')
  return DEFAULT_SCENES
}

// ==================== 步骤 DSL ====================

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// React 受控组件：直接赋 .value 不触发 onChange，必须走原生 setter
async function reactSetValue(page, selector, value) {
  await page.evaluate(
    (sel, val) => {
      const el = document.querySelector(sel)
      if (!el) return
      const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
      if (setter) setter.call(el, val)
      else el.value = val
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    },
    selector,
    value,
  )
}

async function clickByText(page, texts) {
  const buttons = await page.$$('button, a, [role="button"], input[type="submit"]')
  for (const btn of buttons) {
    const text = await btn.evaluate((el) => (el.textContent || el.value || '').trim())
    if (text && texts.some((t) => text.includes(t))) {
      await btn.click()
      return true
    }
  }
  return false
}

// ==================== 鼠标光标 ====================
// page.screenshot 拍不到系统光标，所以光标要我们自己「演」：
// 边操作边记录每帧坐标，交给 PIL 在叠加阶段画出来。
// 没有它，观众只看到界面凭空变化，看不出「有人在操作」。

const cursorState = { x: 0, y: 0, pressing: false }
let sceneCursor = {}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

// 按可见文本定位元素，返回视口坐标中心。不在视口内才滚动（避免无谓的页面跳动）
async function locateByText(page, texts) {
  return page.evaluate((list) => {
    const els = [...document.querySelectorAll('button, a, [role="button"], input[type="submit"]')]
    const el = els.find((e) => {
      const t = (e.textContent || e.value || '').trim()
      return t && list.some((x) => t.includes(x))
    })
    if (!el) return null
    let r = el.getBoundingClientRect()
    const inView = r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth
    if (!inView) {
      el.scrollIntoView({ block: 'center', inline: 'center' })
      r = el.getBoundingClientRect()
    }
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }
  }, texts)
}

// 用原生 el.click() 而不是 ElementHandle.click()：
// 后者会 scrollIntoView，点侧边栏靠下的项时会把整页滚下去（已踩）
async function nativeClickByText(page, texts) {
  return page.evaluate((list) => {
    const els = [...document.querySelectorAll('button, a, [role="button"], input[type="submit"]')]
    const el = els.find((e) => {
      const t = (e.textContent || e.value || '').trim()
      return t && list.some((x) => t.includes(x))
    })
    if (!el) return false
    el.click()
    return true
  }, texts)
}

// 光标缓动到目标点，途中逐帧抓图 —— 播放时就是一段连续的移动
async function moveCursorTo(target, shot) {
  if (!CONFIG.cursor || !target) return
  const frames = Math.max(2, Math.round(CONFIG.cursorSpeed * CONFIG.captureFps))
  const from = { x: cursorState.x, y: cursorState.y }
  for (let i = 1; i <= frames; i++) {
    const e = easeOutCubic(i / frames)
    cursorState.x = Math.round(from.x + (target.x - from.x) * e)
    cursorState.y = Math.round(from.y + (target.y - from.y) * e)
    await shot()
  }
}

async function pressAndShoot(shot) {
  if (!CONFIG.cursor) return
  cursorState.pressing = true
  await shot()
  await shot()
}

async function releaseAndShoot(shot) {
  if (!CONFIG.cursor) return
  cursorState.pressing = false
  await shot()
}

// 每类步骤默认在画面里停留多久（毫秒），可被 step.hold 覆盖
function defaultHold(step) {
  switch (step.do) {
    case 'wait':
      return step.ms || 800
    case 'fill':
      return 900
    case 'click':
      return 2200
    case 'scroll':
      return 400
    case 'goto':
      return 900
    case 'eval':
      return 600
    default:
      return 600
  }
}

async function runStep(page, step, ctx) {
  const { shot } = ctx
  const capture = async (ms, soft = 1) => {
    // soft: 操作期间也抓几帧，让动作本身在画面里"发生"
    const n = Math.max(soft, Math.max(1, Math.round((ms / 1000) * CONFIG.captureFps)))
    for (let i = 0; i < n; i++) await shot()
  }

  switch (step.do) {
    case 'goto':
      await page.goto(step.url, { waitUntil: 'networkidle2', timeout: 30000 })
      await capture(defaultHold(step))
      break
    case 'wait':
      await capture(step.ms || 800, 2)
      break
    case 'cursor':
      // 单纯把光标移过去，用来让静止画面有生气
      await moveCursorTo({ x: step.x, y: step.y }, shot)
      await capture(step.hold ?? 200, 1)
      break
    case 'fill': {
      if (step.texts) await moveCursorTo(await locateByText(page, step.texts), shot)
      await pressAndShoot(shot)
      await reactSetValue(page, step.selector, step.value ?? '')
      await releaseAndShoot(shot)
      await capture(step.hold ?? defaultHold(step), 3)
      break
    }
    case 'click': {
      const texts = step.texts || [step.text || 'Submit']
      await moveCursorTo(await locateByText(page, texts), shot)
      await pressAndShoot(shot)
      await nativeClickByText(page, texts)
      await releaseAndShoot(shot)
      await capture(step.hold ?? defaultHold(step), 3)
      break
    }
    case 'scroll': {
      const times = step.times || 1
      const per = step.hold ?? defaultHold(step)
      for (let i = 0; i < times; i++) {
        await page.evaluate((y) => window.scrollBy(0, y), step.y || 300)
        await wait(120)
        await capture(per / times, 2)
      }
      break
    }
    case 'eval': {
      // cursorText / cursorAt / cursorEval 让自定义 JS 步骤也能有光标走过去
      if (step.cursorText) await moveCursorTo(await locateByText(page, step.cursorText), shot)
      else if (step.cursorAt) await moveCursorTo(step.cursorAt, shot)
      else if (step.cursorEval) await moveCursorTo(await page.evaluate(step.cursorEval), shot)
      await pressAndShoot(shot)
      await page.evaluate(step.js)
      await releaseAndShoot(shot)
      await capture(step.hold ?? defaultHold(step), 2)
      break
    }
    default:
      console.warn(`  ⚠️ 未知步骤类型：${step.do}（已跳过）`)
  }
}

// 边操作边录：先按步骤推进并抓帧，不足目标帧数就定格补满
async function recordScene(page, scene, framesDir, totalFrames, lastUrl) {
  let f = 0
  let truncated = false
  sceneCursor = {}
  const shot = async () => {
    if (f >= totalFrames) { truncated = true; return }
    const idx = f
    await page.screenshot({ path: path.join(framesDir, `frame_${String(idx).padStart(5, '0')}.png`) })
    sceneCursor[idx] = { x: cursorState.x, y: cursorState.y, p: cursorState.pressing }
    f++
  }
  const ctx = { shot }

  // 同一 url 不重复 goto：换场景时重新加载会闪一下，还多出加载空窗
  if (lastUrl !== scene.url) {
    await page.goto(scene.url, { waitUntil: 'networkidle2', timeout: 30000 })
    await wait(500)
  }
  for (let i = 0; i < Math.max(1, Math.round(0.3 * CONFIG.captureFps)); i++) await shot()

  for (const step of scene.steps || []) {
    await runStep(page, step, ctx)
  }

  // 定格补满到目标时长
  while (f < totalFrames) await shot()
  const cursor = Object.keys(sceneCursor)
    .map(Number)
    .sort((a, b) => a - b)
    .map((k) => sceneCursor[k])
  return { frames: f, truncated, cursor }
}

// ==================== 字幕叠加脚本（生成 Python，交给 PIL 执行） ====================

function generateOverlayScript(scenes, workDir, captureFps, fontBold, fontReg, cursorTracks, width, height) {
  const scenesJson = JSON.stringify(
    scenes.map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      badge: s.badge || '',
      rightBadge: s.rightBadge || '',
      type: s.type,
      duration: s.duration,
    })),
  )
  // 光标轨迹要内联进 Python 源码：JSON 的 true/false/null 必须转成 Python 字面量
  const cursorsJson = JSON.stringify(
    Object.fromEntries(scenes.map((s) => [s.id, cursorTracks[s.id] || []])),
  )
    .replace(/\btrue\b/g, 'True')
    .replace(/\bfalse\b/g, 'False')
    .replace(/\bnull\b/g, 'None')

  return `
import os, glob
from PIL import Image, ImageDraw, ImageFont

FONT_BOLD = ${JSON.stringify(fontBold)}
FONT_REG  = ${JSON.stringify(fontReg)}
WORK      = ${JSON.stringify(workDir)}
FPS       = ${captureFps}
W         = ${width}
H         = ${height}
GREEN     = (74, 222, 128)

# 字幕条与字号按成片高度等比缩放：叠加层的设计基准是 720p
S = H / 720.0

scenes  = ${scenesJson}
cursors = ${cursorsJson}
SHOW_CURSOR = ${CONFIG.cursor ? 'True' : 'False'}

def font(path, size):
    size = max(8, int(round(size)))
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        try:
            return ImageFont.load_default(size)
        except Exception:
            return ImageFont.load_default()

def sc(v):
    return int(round(v * S))

def draw_cursor(draw, x, y, pressing):
    # macOS 风格箭头指针，按分辨率放大；白描边保证在任何底色上都看得见
    k = 1.25 * S
    pts = [(0, 0), (0, 17), (4.5, 13), (7.5, 19.5), (10, 18), (7, 12), (12, 12)]
    poly = [(x + px * k, y + py * k) for px, py in pts]
    if pressing:
        r = 20 * k
        draw.ellipse([x - r, y - r, x + r, y + r], outline=(255, 255, 255, 190), width=max(2, sc(2)))
    draw.polygon(poly, fill=(17, 17, 17, 255))
    draw.line(poly + [poly[0]], fill=(255, 255, 255, 255), width=max(1, sc(1.6)), joint='curve')

def add_overlay(img, scene, frame_idx):
    draw = ImageDraw.Draw(img, 'RGBA')
    t = scene['type']

    ft_title = font(FONT_BOLD, (44 if t == 'intro' else 36) * S)
    fs_sub   = font(FONT_REG,  (20 if t == 'intro' else 18) * S)
    fb       = font(FONT_REG,  16 * S)

    if frame_idx < int(0.3 * FPS):
        return img

    def centered(text, fnt, y, fill):
        box = draw.textbbox((0, 0), text, font=fnt)
        draw.text(((W - (box[2] - box[0])) // 2, y), text, fill=fill, font=fnt)

    if t == 'intro':
        bar_h = sc(170)
        draw.rectangle([(0, H - bar_h), (W, H)], fill=(10, 10, 10, 235))
        draw.rectangle([(0, H - bar_h - sc(2)), (W, H - bar_h)], fill=(*GREEN, 200))
        centered(scene['title'], ft_title, H - bar_h + sc(18), 'white')
        centered(scene['subtitle'], fs_sub, H - bar_h + sc(72), (255, 255, 255, 220))
        badge = scene.get('badge', '')
        if badge and frame_idx > int(1.0 * FPS):
            centered(badge, fb, H - bar_h + sc(108), (*GREEN, 255))

    elif t == 'outro':
        bar_h = sc(150)
        draw.rectangle([(0, H - bar_h), (W, H)], fill=(10, 10, 10, 240))
        draw.rectangle([(0, H - bar_h - sc(2)), (W, H - bar_h)], fill=(*GREEN, 200))
        centered(scene['title'], ft_title, H - bar_h + sc(20), 'white')
        centered(scene['subtitle'], fs_sub, H - bar_h + sc(72), (*GREEN, 255))

    else:
        bar_h = sc(75)
        draw.rectangle([(0, H - bar_h), (W, H)], fill=(10, 10, 10, 235))
        draw.rectangle([(0, H - bar_h - sc(2)), (W, H - bar_h)], fill=(*GREEN, 180))
        draw.text((sc(18), H - bar_h + sc(10)), scene['title'], fill='white', font=ft_title)
        draw.text((sc(18), H - bar_h + sc(46)), scene['subtitle'], fill=(255, 255, 255, 210), font=fs_sub)
        right = scene.get('rightBadge', '')
        if right:
            box = draw.textbbox((0, 0), right, font=fb)
            draw.text((W - (box[2] - box[0]) - sc(18), H - bar_h + sc(14)), right, fill=(*GREEN, 230), font=fb)

    return img

for scene in scenes:
    sid = scene['id']
    frame_dir = os.path.join(WORK, 'frames_' + sid)
    out_dir = os.path.join(WORK, 'overlay_' + sid)
    # 必须先把上一轮的帧清掉再写。
    # 不清空的话，新场景帧数比上一轮少时，尾部会残留旧帧，成片被悄悄拉长
    # （已踩：90 帧的场景被拼成 126 帧 = 21s，多出来的全是上一轮的画面）。
    if os.path.isdir(out_dir):
        for _stale in glob.glob(os.path.join(out_dir, 'frame_*.png')):
            os.remove(_stale)
    os.makedirs(out_dir, exist_ok=True)
    frames = sorted(glob.glob(os.path.join(frame_dir, 'frame_*.png')))
    track = cursors.get(sid) or []
    for i, fp in enumerate(frames):
        img = Image.open(fp).convert('RGBA')
        img = add_overlay(img, scene, i)
        if SHOW_CURSOR and i < len(track) and track[i]:
            c = track[i]
            draw_cursor(ImageDraw.Draw(img, 'RGBA'), c['x'], c['y'], bool(c.get('p')))
        img.convert('RGB').save(os.path.join(out_dir, 'frame_%05d.png' % i))
    print('  %s: %d frames overlaid' % (sid, len(frames)))
print('Done')
`
}

// ==================== 浏览器接管 ====================
// 不用 puppeteer.launch()：在 Chrome 152 + puppeteer 25 上，launch 出来的会话
// 一执行 page.goto 就抛 "Requesting main frame too early!"（与 pipe 无关），
// 而手动拉起 Chrome 后用 connect 接管则完全正常。故走「自起 + 接管」这条路。

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolve(port))
    })
  })
}

async function waitForCdp(baseUrl, timeoutMs = 25000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${baseUrl}/json/version`)
      if (r.ok) return true
    } catch {}
    await wait(300)
  }
  return false
}

async function connectBrowser(puppeteer, chromePath, workDir) {
  const port = await freePort()
  const profile = path.join(workDir, 'chrome-profile')
  fs.rmSync(profile, { recursive: true, force: true })
  fs.mkdirSync(profile, { recursive: true })

  const proc = spawn(
    chromePath,
    [
      '--headless',
      // 无头 Chrome 在受限环境里渲染进程常起不来（表现为 page 秒关、
      // Emulation.* 报 Session closed），故默认关掉 Chrome 自带沙箱。
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-background-networking',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  )
  proc.on('error', () => {})

  const base = `http://127.0.0.1:${port}`
  const ready = await waitForCdp(base)
  if (!ready) {
    try { proc.kill('SIGKILL') } catch {}
    throw new Error(`浏览器调试端口未就绪（${base}）。若被安全软件拦截，可设 CHROME_PATH 换一个浏览器。`)
  }

  const browser = await puppeteer.connect({
    browserURL: base,
    defaultViewport: { width: CONFIG.width, height: CONFIG.height },
  })
  browser.__proc = proc
  return browser
}

async function closeBrowser(browser) {
  const proc = browser.__proc
  try { await browser.close() } catch {}
  try { if (proc && !proc.killed) proc.kill('SIGTERM') } catch {}
}

// ==================== 主流程 ====================

function run(cmd, args, label) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' })
  if (r.error) throw new Error(`${label} 启动失败：${r.error.message}`)
  if (r.status !== 0) throw new Error(`${label} 退出码 ${r.status}\n${(r.stderr || '').slice(-800)}`)
  return (r.stdout || '').trim()
}

async function main() {
  const { workDir, output, voice, voiceRate, captureFps, outputFps, crf, width, height, fontBold, fontReg, tailPad, minScene } = CONFIG

  const puppeteer = loadPuppeteer()
  const chromePath = CONFIG.chromePath = await resolveChromePath(puppeteer)
  if (!chromePath) throw new Error('找不到浏览器可执行文件。装 puppeteer（自带浏览器）或设 CHROME_PATH')
  console.log(`🔧 浏览器：${chromePath}`)
  console.log(`🔧 中文字体：${fontBold}`)
  console.log(`🔧 Python：${PYTHON}  ·  edge-tts：${EDGE_TTS}`)

  const scenes = loadScenes()
  const audioDir = path.join(workDir, 'audio')
  fs.mkdirSync(audioDir, { recursive: true })

  // ---- 1. 配音 ----
  console.log('\n🎙️  生成配音...')
  for (const s of scenes) {
    const audioPath = path.join(audioDir, `${s.id}.mp3`)
    // edge-tts 是 Microsoft 免费端点，偶发 "No audio received" 丢连接；重试扛过抖动
    let lastErr = null
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        run(EDGE_TTS, ['--voice', voice, '--rate=' + voiceRate, '--text', s.narration, '--write-media', audioPath], 'edge-tts')
        if (fs.existsSync(audioPath) && fs.statSync(audioPath).size > 0) { lastErr = null; break }
        lastErr = new Error('edge-tts 未写出有效音频文件')
      } catch (e) {
        lastErr = e
        if (fs.existsSync(audioPath)) { try { fs.unlinkSync(audioPath) } catch {} }
        console.log(`    ⚠️  ${s.id} 第 ${attempt} 次配音失败：${String(lastErr.message).split('\n')[0]}，1.5s 后重试…`)
      }
      await new Promise((r) => setTimeout(r, 1500))
    }
    if (lastErr) throw lastErr
    const dur = parseFloat(
      run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', audioPath], 'ffprobe'),
    )
    s.audioDuration = dur
    // 原来是 max(8, ceil(dur) + 2)：短台词被硬拉到 8 秒，之后每段再压 2 秒静音，
    // 五段就是十几秒纯停顿。现在只留一点呼吸间隔，节奏跟人说话一致。
    s.duration = Math.max(minScene, dur + tailPad)
    console.log(`  ${s.id}: 音频 ${dur.toFixed(1)}s → 场景 ${s.duration.toFixed(1)}s`)
  }

  // ---- 2. 录浏览器（边操作边录） ----
  console.log('\n📹 录制场景（边操作边录）...')
  const browser = await connectBrowser(puppeteer, chromePath, workDir)
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  await page.setDefaultTimeout(30000)

  // 光标从画面中心起步，更像真人在中途接手
  cursorState.x = Math.round(width / 2)
  cursorState.y = Math.round(height / 2)

  const cursorTracks = {}
  let lastUrl = null
  for (const s of scenes) {
    const dir = path.join(workDir, `frames_${s.id}`)
    fs.rmSync(dir, { recursive: true, force: true })
    fs.mkdirSync(dir, { recursive: true })
    const totalFrames = Math.round(s.duration * captureFps)
    console.log(`  录制：${s.id}（目标 ${totalFrames} 帧）`)
    const res = await recordScene(page, s, dir, totalFrames, lastUrl)
    cursorTracks[s.id] = res.cursor
    lastUrl = s.url
    if (res.truncated) {
      console.warn(`    ⚠️ ${s.id} 的步骤没跑完就被时长截断 —— 调小 hold 或加长这一段`)
    }
    console.log(`    ✓ ${res.frames} 帧${CONFIG.cursor ? `，光标轨迹 ${res.cursor.length} 点` : ''}`)
  }
  await closeBrowser(browser)

  // ---- 3. 字幕叠加 ----
  console.log('\n✍️  叠加字幕...')
  const overlayPath = path.join(workDir, 'overlay.py')
  fs.writeFileSync(overlayPath, generateOverlayScript(scenes, workDir, captureFps, fontBold, fontReg, cursorTracks, width, height))
  run(PYTHON, [overlayPath], '字幕叠加')

  // ---- 4. 每场景合成 ----
  console.log('\n🎬 合成场景...')
  for (const s of scenes) {
    const frames = path.join(workDir, `overlay_${s.id}`, 'frame_%05d.png')
    const vid = path.join(workDir, `${s.id}_video.mp4`)
    const fin = path.join(workDir, `${s.id}_final.mp4`)
    const nor = path.join(workDir, `${s.id}_norm.mp4`)
    const V = ['-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-r', String(outputFps)]
    const A = ['-c:a', 'aac', '-b:a', '128k']
    run('ffmpeg', ['-y', '-framerate', String(captureFps), '-i', frames, ...V, vid], `ffmpeg(${s.id})`)
    run('ffmpeg', ['-y', '-i', vid, '-i', path.join(audioDir, `${s.id}.mp3`), '-c:v', 'copy', ...A, '-af', 'apad', '-shortest', fin], `ffmpeg(${s.id})`)
    run('ffmpeg', ['-y', '-i', fin, ...V, ...A, '-ar', '44100', '-ac', '2', nor], `ffmpeg(${s.id})`)
    console.log(`  ${s.id} ✓`)
  }

  // ---- 5. 拼接 ----
  console.log('\n📼 拼接成片...')
  const concatPath = path.join(workDir, 'concat.txt')
  fs.writeFileSync(concatPath, scenes.map((s) => `file '${path.join(workDir, `${s.id}_norm.mp4`)}'`).join('\n'))
  const outputPath = path.resolve(output)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  // faststart 必须加：moov 挪到文件头，流式预览（聊天卡片/网页播放器）才能秒开。
  // 缺了它 mdat 在前，部分播放器在元数据加载完成前显示黑屏（已踩：本地 QuickTime 正常、分享卡片黑屏）。
  run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', concatPath, '-c', 'copy', '-movflags', '+faststart', outputPath], 'ffmpeg(concat)')

  const stat = fs.statSync(outputPath)
  const totalDur = parseFloat(
    run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', outputPath], 'ffprobe'),
  )

  console.log('\n✅ 演示视频完成')
  console.log(`   文件：${outputPath}`)
  console.log(`   大小：${(stat.size / 1024 / 1024).toFixed(1)} MB`)
  console.log(`   时长：${totalDur.toFixed(1)}s`)
  console.log(`   场景：${scenes.length}  ·  音色：${voice}`)
}

main().catch((e) => {
  console.error('\n❌ ' + e.message)
  process.exit(1)
})
