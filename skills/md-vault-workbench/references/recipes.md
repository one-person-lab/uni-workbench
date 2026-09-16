# 可复用代码片段

全部来自 `product-hub`（已跑通验证）。按需取用，不要整段照抄业务字段。

## package.json

```json
{
  "type": "module",
  "scripts": {
    "gen:data": "node scripts/build-data.mjs",
    "predev": "npm run gen:data --silent",
    "dev": "vite",
    "prebuild": "npm run gen:data --silent",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@phosphor-icons/vue": "^2.2.1",
    "vue": "^3.5.41"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.3",
    "@types/node": "^24.13.3",
    "@vitejs/plugin-vue": "^6.0.8",
    "@vue/tsconfig": "^0.9.1",
    "autoprefixer": "^10.5.5",
    "postcss": "^8.5.28",
    "tailwindcss": "^4.3.3",
    "typescript": "~6.0.2",
    "vite": "^8.2.2",
    "vue-tsc": "^3.3.11"
  }
}
```

`postcss.config.js` 只需 `{ plugins: { '@tailwindcss/postcss': {} } }`。
`tsconfig` 三件套直接抄 Vite 官方 Vue-TS 模板，`tsconfig.app.json` 里加 `"resolveJsonModule": true`。

## Vite 插件：内嵌外部 HTML 原型

```ts
import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { type Plugin, type Connect } from 'vite'

const DOCS_ROOT = path.resolve(__dirname, '../<外部目录>')

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
}

function docsStatic(): Plugin {
  const handler = (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    const filePath = path.join(DOCS_ROOT, urlPath)
    if (!filePath.startsWith(DOCS_ROOT)) return next()   // 防目录穿越
    fs.stat(filePath, (err, st) => {
      if (err || !st.isFile()) return next()
      res.setHeader('Content-Type', MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream')
      fs.createReadStream(filePath).pipe(res)
    })
  }
  return {
    name: 'docs-static',
    configureServer(s) { s.middlewares.use('/prototypes', handler) },
    configurePreviewServer(s) { s.middlewares.use('/prototypes', handler) },
  }
}
```

**注意**：`middlewares.use('/prototypes', handler)` 里 connect 会剥掉前缀，所以 `req.url` 是 `/子目录/文件.html`，直接 `path.join(DOCS_ROOT, urlPath)` 即可。

写这个插件时记得给 `req/res/next` 显式类型，否则 `tsconfig.node.json` 的 `noImplicitAny` 会报错，`npm run build` 直接挂。

## 解析工具函数（`scripts/build-data.mjs`）

```js
/** 按 ## 标题切分，返回 name → body */
function sections(md) {
  const map = {}
  const parts = md.split(/^## (.+)$/m)
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i].replace(/[（(].*$/, '').trim()
    map[name] = (parts[i + 1] || '').trim()
  }
  return map
}

/** frontmatter（--- 包裹的 键: 值，中英文冒号都认） */
function frontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return {}
  const o = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([^：:]+)[：:]\s*(.*)$/)
    if (kv) o[kv[1].trim()] = kv[2].trim()
  }
  return o
}

/** markdown 表格 → 对象数组；一个 body 里可含多张表 */
function tables(body) {
  const groups = []
  let cur = []
  for (const line of (body || '').split('\n')) {
    if (/^\s*\|/.test(line)) cur.push(line)
    else { if (cur.length) groups.push(cur); cur = [] }
  }
  if (cur.length) groups.push(cur)
  return groups.map((rows) => {
    const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((s) => s.trim())
    const head = cells(rows[0])
    return rows.slice(1)
      .filter((r) => !/^[\s|:-]+$/.test(r))        // 滤掉 | --- | --- | 分隔行
      .map((r) => {
        const c = cells(r)
        const o = {}
        head.forEach((h, i) => (o[h] = c[i] ?? ''))
        return o
      })
  })
}

/** "- item" 列表 */
function bullets(body) {
  return (body || '').split('\n')
    .map((l) => l.match(/^\s*[-*]\s+(.+)$/))
    .filter(Boolean).map((m) => m[1].trim())
}

/** 递归找文件；跳过隐藏目录与噪声目录 */
function walk(dir, filter, skipDirs = new Set(['.git', 'node_modules', '.obsidian'])) {
  const out = []
  if (!existsSync(dir)) return out
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (skipDirs.has(e.name) || e.name.startsWith('.')) continue
      out.push(...walk(join(dir, e.name), filter, skipDirs))
    } else if (filter(join(dir, e.name), e.name)) out.push(join(dir, e.name))
  }
  return out
}
```

## 双格式字段解析（应对"同一目录里文档格式不统一"）

```js
// 同时匹配 `- **键**：值` 与裸 `键：值`
const field = (md, k) => {
  const re = new RegExp(`^[-*]?\\s*\\*{0,2}${k}\\*{0,2}[：:]\\s*(.+)$`, 'm')
  const m = md.match(re)
  return m ? m[1].replace(/\*\*/g, '').trim() : ''
}

// 判定是新格式还是老格式：看有没有约定的段落标记
const legacy = !/^##\s*挑战概览/m.test(md)

// 清理 H1 里残留的后缀标记，如「成为有张力的人（21天任务链路）」
const name = h1.replace(/[（(][^）)]*[）)]\s*$/g, '').trim()
```

## git 提交日期

```js
import { execSync } from 'node:child_process'

function gitDates(repoDir) {
  try {
    const raw = execSync(
      `git -C "${repoDir}" -c core.quotePath=false log --since=3.years ` +
        `--date=short --pretty=format:%x1f%ad --name-only`,
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
    )
    const dates = {}
    let cur = null
    for (const line of raw.split('\n')) {
      if (line.startsWith('\x1f')) cur = line.slice(1).trim()      // %x1f 做分隔符
      else if (line.trim() && cur && !(line.trim() in dates)) {
        dates[line.trim().replace(/^"|"$/g, '')] = cur             // 新→旧遍历，首次命中即最新
      }
    }
    return dates
  } catch {
    return {}   // 非 git 仓库 / git 不可用 → 静默降级到 mtime
  }
}
```

## 内链统计（孤岛文档判定）

```js
// 每篇文档被谁引用了。三种写法都要认。
for (const m of md.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) { ... }   // Obsidian wikilink
for (const m of md.matchAll(/\]\(([^)#\s]+\.md)(?:#[^)]*)?\)/g)) { ... }  // markdown 链接
for (const m of md.matchAll(/`([^`\n]*\.md)`/g)) { ... }                  // README 里反引号列的路径
```

**坑**：如果健康度报告会写回某个文档（如 `首页.md`），报告自身产生的链接会把自己指向的文档"洗白"。计算前要先剥掉自动生成区（`<!-- dashboard:auto:start -->...<!-- dashboard:auto:end -->`）。

## store.ts 收口

```ts
import raw from './generated.json'

export interface DocItem { /* 与 build-data 输出字段一一对应 */ }

// generated.json 由脚本生成，TS 拿不到类型 → 显式断言
export const docs: DocItem[] = (raw as Record<string, unknown>).docs as DocItem[]
```

改动 build-data 的输出结构时，**必须同步改 store.ts 的 interface**，否则 `vue-tsc` 会在视图层报错——这是好事，是唯一能防住"脚本改了但界面没跟上"的机制。

## Mermaid 按需渲染组件

```vue
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{ code: string; id: string }>()
const el = ref<HTMLElement | null>(null)
const rendering = ref(false)

type MermaidApi = {
  initialize: (cfg: Record<string, unknown>) => void
  render: (id: string, code: string) => Promise<{ svg: string }>
}
let mermaid: MermaidApi | null = null

async function load(): Promise<MermaidApi> {
  if (mermaid) return mermaid
  const mod = (await import('mermaid')) as unknown as { default: MermaidApi }   // 关键：动态
  mermaid = mod.default
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    themeVariables: { /* 用工作台的 token 覆盖，视觉才统一 */ },
  })
  return mermaid
}

async function render() {
  if (!el.value) return
  rendering.value = true
  try {
    const api = await load()
    const { svg } = await api.render(`m-${props.id}-${Date.now()}`, props.code)
    el.value.innerHTML = svg
  } catch (e) {
    el.value.textContent = ''   // 渲染失败不能白屏，外面给提示
  } finally {
    rendering.value = false
  }
}

onMounted(render)
watch(() => props.code, render)
</script>

<template>
  <div class="overflow-x-auto">
    <p v-if="rendering">正在渲染…</p>
    <div ref="el" />
  </div>
</template>
```

`theme: 'base'` + `themeVariables` 是唯一能把 mermaid 拉进自定义设计系统的办法。不设就是默认蓝白，和工作台风格打架。

## style.css 追加（Tailwind v4）

```css
@import "tailwindcss";

@theme {
  --color-neo-bg: #f7efe1;
  --color-neo-paper: #fffcf5;
  --color-neo-yellow: #ffe89b;
  --shadow-neo: 4px 4px 0px 0px rgba(0, 0, 0, 1);
}

/* 组件类必须放 @layer components，否则特异性高于工具类，
   text-sm / flex-1 之类没法覆盖它的默认值 */
@layer components {
  .neo-card { border: 2px solid #111; border-radius: 0.75rem; background: var(--color-neo-paper); box-shadow: var(--shadow-neo); }
  .neo-btn { /* ... */ }
  .neo-chip { /* ... */ }
}
```

**渲染 md 正文**（工作台里若要展示 md 原文）需要一套兜底排版类，因为 md 里的裸 HTML 没有样式。至少要覆盖 `h1-h3 / p / ul / ol / li / strong / code / pre / blockquote / table / th / td / hr / a`。
