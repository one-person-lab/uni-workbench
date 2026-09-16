#!/usr/bin/env node
/**
 * 从产品仓库拉取「拉取型」内容，生成 src/generated/*.ts。
 *
 * 设计原则（重要）：
 *   本脚本只提供**机制**，不含任何产品知识。
 *   「从哪取、取什么、叫什么名字」全部由实例侧的 sources.json 声明。
 *   换产品 = 换一份 sources.json，脚本一行不改。
 *
 * 为什么需要它：
 *   手动把产品令牌抄进视频工程 = 造了一份会漂移的第二副本。
 *   产品改一次主色，视频不会知道；等发现时，已发布的素材和产品早已对不上。
 *
 * 用法：
 *   node pull-product.mjs <工程目录> [--check] [--verbose] [--only <id>]
 *
 *   --check    只体检不写文件；有漂移时退出码 1（可挂 CI / pre-commit）
 *   --verbose  连「无变化」的令牌也逐条列出
 *   --only     只拉某个 source id
 */
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";

const argv = process.argv.slice(2);
const CHECK = argv.includes("--check");
const VERBOSE = argv.includes("--verbose");
const onlyIdx = argv.indexOf("--only");
const ONLY = onlyIdx > -1 ? argv[onlyIdx + 1] : null;

const project = argv.find((a) => !a.startsWith("--") && !argv[argv.indexOf(a) - 1]?.startsWith("--"));
if (!project) {
  console.error("用法: node pull-product.mjs <工程目录> [--check] [--verbose] [--only <id>]");
  process.exit(1);
}

const root = path.resolve(project);
const sourcesPath = path.join(root, "sources.json");

if (!fs.existsSync(sourcesPath)) {
  console.error(`✗ 缺 sources.json: ${sourcesPath}`);
  console.error("  这是每个视频工程自己的人工文件，声明「从产品仓库的哪取什么」。");
  console.error("  模板见 video-factory/references/pull-product.md");
  process.exit(1);
}

/** ---------- 工具 ---------- */

function gitHead(dir) {
  try {
    return execFileSync("git", ["-C", dir, "rev-parse", "--short", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * 从 CSS 里取出某个选择器块的正文。
 * 支持多选择器（如 `page,\n.theme-dark {`），命中即算。
 */
function findCssBlock(css, select) {
  const wanted = select
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let i = 0;
  while (i < css.length) {
    const brace = css.indexOf("{", i);
    if (brace < 0) return null;
    const selectors = css.slice(i, brace).trim();
    // 跳过 @media / @keyframes 之类的 at-rule 头
    if (selectors.startsWith("@")) {
      i = skipBlock(css, brace);
      continue;
    }
    const list = selectors.split(",").map((s) => s.trim());
    if (wanted.some((w) => list.includes(w))) {
      const end = skipBlock(css, brace);
      return css.slice(brace + 1, end - 1);
    }
    i = skipBlock(css, brace);
  }
  return null;
}

function skipBlock(s, braceIdx) {
  let depth = 0;
  for (let j = braceIdx; j < s.length; j++) {
    if (s[j] === "{") depth++;
    else if (s[j] === "}") {
      depth--;
      if (depth === 0) return j + 1;
    }
  }
  return s.length;
}

function parseCssVars(body) {
  const out = new Map();
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(body))) {
    out.set(m[1], m[2].trim());
  }
  return out;
}

/** 去掉颜色里的多余空格，让 diff 稳定 */
function normalize(v) {
  return v.replace(/\s+/g, " ").replace(/,\s+/g, ",").replace(/\s+,/g, ",").trim();
}

function tsString(v) {
  return JSON.stringify(v);
}

function quoteKeys(objLiteral) {
  return Object.entries(objLiteral)
    .map(([k, v]) => `  ${/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k)}: ${tsString(v)},`)
    .join("\n");
}

/** ---------- 解析 sources.json ---------- */

const cfg = JSON.parse(fs.readFileSync(sourcesPath, "utf8"));
const productRoot = cfg.product?.root ? path.resolve(root, cfg.product.root) : null;

console.log(`拉取 → ${root}`);
console.log(`产品: ${cfg.product?.name || "(未命名)"}`);
if (productRoot) console.log(`源目录: ${productRoot}`);
console.log("");

let totalChanged = 0;
let drifted = false;
const written = [];

function readMeta(file) {
  if (!fs.existsSync(file)) return null;
  const txt = fs.readFileSync(file, "utf8");
  const m = txt.match(/export const T = \{([^}]*)\}/);
  if (!m) return null;
  const map = new Map();
  const re = /"?([A-Za-z0-9_$]+)"?\s*:\s*("(?:[^"\\]|\\.)*")/g;
  let x;
  while ((x = re.exec(m[1]))) {
    try {
      map.set(x[1], JSON.parse(x[2]));
    } catch {}
  }
  return map;
}

for (const src of cfg.sources || []) {
  if (ONLY && src.id !== ONLY) continue;
  const label = `${src.id}  (${src.from})`;

  if (src.kind !== "css-vars") continue;

  const file = productRoot ? path.join(productRoot, src.from) : path.resolve(root, src.from);
  if (!fs.existsSync(file)) {
    console.log(`  ✗ ${label}`);
    console.log(`    源不存在: ${file}`);
    console.log(`    → 检查 sources.json 的 product.root 是否指向正确的产品目录`);
    drifted = true;
    continue;
  }

  const css = fs.readFileSync(file, "utf8");
  const body = findCssBlock(css, src.select);
  if (body === null) {
    console.log(`  ✗ ${label}`);
    console.log(`    CSS 里找不到选择器: ${src.select}`);
    drifted = true;
    continue;
  }

  const vars = parseCssVars(body);
  const outFile = path.join(root, src.out || `src/generated/${src.id}.ts`);
  const prev = readMeta(outFile);

  const next = {};
  const changes = [];
  const same = [];
  const missing = [];

  for (const [key, specRaw] of Object.entries(src.map || {})) {
    const spec = typeof specRaw === "string" ? {var: specRaw} : specRaw;
    if (!vars.has(spec.var)) {
      if (spec.fallback !== undefined) {
        next[key] = spec.fallback;
        missing.push([key, spec.fallback, spec.note || spec.var + " 产品侧无，用视频自有值"]);
      } else {
        missing.push([key, null, spec.var + " 产品侧缺失且无 fallback"]);
        drifted = true;
      }
      continue;
    }
    const val = normalize(vars.get(spec.var));
    next[key] = val;
    const before = prev ? prev.get(key) : undefined;
    if (before === undefined) changes.push([key, null, val]);
    else if (before !== val) changes.push([key, before, val]);
    else same.push([key, val]);
  }

  console.log(`  ── ${label}`);
  if (changes.length) {
    for (const [k, from, to] of changes) {
      console.log(`    ↻ ${k.padEnd(14)} ${from === null ? "(新增)" : from}  →  ${to}`);
    }
  }
  if (missing.length) {
    for (const [k, v, why] of missing) {
      console.log(`    · ${k.padEnd(14)} ${v === null ? "?" : v}   [${why}]`);
    }
  }
  if (VERBOSE && same.length) {
    for (const [k, v] of same) console.log(`    · ${k.padEnd(14)} ${v}`);
  }
  if (!changes.length && !missing.length) {
    console.log(`    · ${Object.keys(src.map || {}).length} 令牌，全部无变化`);
  } else if (!changes.length) {
    console.log(`    · ${changes.length} 变更 / ${same.length} 未变`);
  }

  totalChanged += changes.length;
  if (changes.length) drifted = true;

  const meta = {
    id: src.id,
    source: file,
    select: src.select,
    commit: gitHead(path.dirname(file)),
    mtime: fs.statSync(file).mtime.toISOString(),
  };

  const ts = `/**
 * 自动生成，禁止手改 —— 由 video-factory/scripts/pull-product.mjs 生成。
 *
 * 数据来源：${path.relative(root, meta.source) || meta.source}${meta.commit ? ` @ ${meta.commit}` : ""}
 * 产品令牌的**唯一真相**在产品仓库里，本文件只是渲染期的一份快照。
 *
 * 想改这里的值？去改产品侧的令牌，然后跑：npm run pull
 * 产品侧没有的令牌？写到 sources.json 的 map.fallback，别改本文件。
 * 本文件不带时间戳，令牌不变则字节不变（幂等，可安全入库）。
 */

export const T = {
${quoteKeys(next)}
} as const;

export const meta = {
  source: ${JSON.stringify(meta.source)},
  commit: ${JSON.stringify(meta.commit)},
  productName: ${JSON.stringify(cfg.product?.name || "")},
} as const;

export type Token = keyof typeof T;
`;

  written.push({file: outFile, content: ts});
}

/** ---------- 写入 ---------- */

console.log("");
if (CHECK) {
  if (drifted) {
    console.log(`✗ 有漂移：${totalChanged} 处令牌与产品不一致`);
    console.log("  跑 npm run pull 同步，然后再渲染。");
    process.exit(1);
  }
  console.log("✓ 无漂移：产品令牌与上一次拉取一致");
  process.exit(0);
}

for (const {file, content} of written) {
  const existed = fs.existsSync(file);
  const unchanged = existed && fs.readFileSync(file, "utf8") === content;
  if (unchanged) {
    console.log(`  · ${path.relative(root, file)} (无变化)`);
    continue;
  }
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, content);
  console.log(`  ${existed ? "↻" : "+"} ${path.relative(root, file)}`);
}

console.log("");
console.log(`✓ 完成。共 ${written.length} 个生成文件，${totalChanged} 处令牌变更。`);
console.log("  变更会让画面跟着产品走 —— 渲染前最好先看一眼 still 帧。");
