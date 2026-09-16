#!/usr/bin/env node
/**
 * brand-kit.json → src/koubo/brand.generated.ts
 *
 * 视频工厂的「换皮肤」就发生在这里：一份 brand-kit 编译出一份 Remotion 主题，
 * 模板（Koubo.tsx）零改动，渲染结果却完全属于某个产品。
 *
 * 用法：
 *   node gen-brand-theme.mjs --kit <brand-kit.json> [--out <file>] [--dry]
 * 默认 --kit 取当前目录的 brand-kit.json，--out 取 <kit 同级>/src/koubo/brand.generated.ts
 */
import fs from "node:fs";
import path from "node:path";

// ---------- 颜色工具 ----------
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const to255 = (n) => Math.round(clamp(n, 0, 255));

function hexToRgb(hex) {
  let h = String(hex).trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) throw new Error(`非法颜色: ${hex}`);
  return {r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255};
}

function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return {
    r: to255(A.r + (B.r - A.r) * t),
    g: to255(A.g + (B.g - A.g) * t),
    b: to255(A.b + (B.b - A.b) * t),
  };
}

const hex = ({r, g, b}) => "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
const rgba = (rgb, a) => `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
const rgbaHex = (h, a) => rgba(hexToRgb(h), a);
const lighten = (h, t) => hex(mix(h, "#ffffff", t));

// ---------- 参数 ----------
function arg(name, def) {
  const i = process.argv.indexOf("--" + name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
const DRY = process.argv.includes("--dry");

const kitPath = path.resolve(arg("kit", "brand-kit.json"));
if (!fs.existsSync(kitPath)) {
  console.error(`✗ 找不到 brand-kit: ${kitPath}`);
  console.error("  先准备一份 brand-kit.json（字段见 video-factory/brand-kit.schema.json）");
  process.exit(1);
}
const kit = JSON.parse(fs.readFileSync(kitPath, "utf8"));

const outPath = path.resolve(arg("out", path.join(path.dirname(kitPath), "src/koubo/brand.generated.ts")));

// ---------- 取色 ----------
if (!kit.name) throw new Error("brand-kit 缺 name");
const colors = kit.colors || {};
const primary = colors.primary || "#f4c77c";
const primaryBright = colors.bright || colors.accent || lighten(primary, 0.12);

/** 竖屏视频一律走深底（夜→晨），可从 colors.primary 推导，也可用 video.palette 精确覆盖 */
const DEEP = "#0b1421";
const palette = kit.video?.palette || {};
const textHex = palette.text || "#f4f7fb";
const textRgb = hexToRgb(textHex);

const C = {
  bg0: palette.bg0 || hex(mix(DEEP, primary, 0.14)),
  bg1: palette.bg1 || hex(mix(DEEP, primary, 0.07)),
  bg2: palette.bg2 || hex(mix(DEEP, primary, 0.02)),
  horizon: palette.horizon || hex(mix(DEEP, primary, 0.22)),

  text: textHex,
  text2: rgba(textRgb, 0.76),
  text3: rgba(textRgb, 0.5),
  text4: rgba(textRgb, 0.34),

  primary,
  primaryBright,
  primarySoft: rgbaHex(primary, 0.16),
  primaryBorder: rgbaHex(primary, 0.28),

  glow: palette.glow || rgbaHex(lighten(primary, 0.15), 0.45),
  horizonGlowA: palette.horizonGlowA || rgbaHex(lighten(primary, 0.08), 0.3),
  horizonGlowB: palette.horizonGlowB || rgbaHex(primary, 0.13),

  cellFill: palette.cellFill || rgbaHex(primary, 0.95), // 运行时按进度改 alpha，见 Koubo.tsx
  cellGlow: palette.cellGlow || rgbaHex(lighten(primary, 0.2), 1),
  track: rgba(textRgb, 0.1),
  trackBorder: rgba(textRgb, 0.16),
};

const sizes = kit.video?.sizes || {};
const outro = kit.video?.outro || {};

const brand = {
  name: kit.name,
  slogan: kit.slogan || "",
  domain: kit.domain || "",
  badge: kit.badge || "✦",
  barRight: kit.barRight ?? kit.slogan ?? "",
  outroCTA: kit.outroCta || kit.slogan || "",
  aiLabel: kit.aiLabel ?? "AI 生成",
  audioFile: kit.video?.audioFile || "koubo/narration.wav",
  fontFamily:
    kit.video?.fontFamily ||
    '-apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", sans-serif',
  safeX: sizes.safeX ?? 84,
  contextFontSize: sizes.context ?? 36,
  fontSizes: {
    xl: sizes.xl ?? 104,
    lg: sizes.lg ?? 88,
    md: sizes.md ?? 74,
    sm: sizes.sm ?? 62,
  },
  outroSizes: {
    name: outro.name ?? 132,
    cta: outro.cta ?? 56,
    ai: outro.ai ?? 30,
  },
  horizonGlow: kit.video?.horizonGlow ?? true,
  decor: {
    type: kit.video?.decor?.type || "none",
    count: Number(kit.video?.decor?.count) || 0,
  },
};

const q = JSON.stringify;
const body = `// @generated — 由 video-factory/scripts/gen-brand-theme.mjs 生成，请勿手改
// 源文件: ${path.basename(kitPath)}
// 重新生成: node <skill>/video-factory/scripts/gen-brand-theme.mjs --kit ${path.basename(kitPath)}

export const brand = {
  name: ${q(brand.name, null, 0)},
  slogan: ${q(brand.slogan, null, 0)},
  domain: ${q(brand.domain, null, 0)},
  badge: ${q(brand.badge, null, 0)},
  barRight: ${q(brand.barRight, null, 0)},
  outroCTA: ${q(brand.outroCTA, null, 0)},
  aiLabel: ${q(brand.aiLabel, null, 0)},
  audioFile: ${q(brand.audioFile, null, 0)},
  fontFamily: ${q(brand.fontFamily, null, 0)},
  safeX: ${brand.safeX},
  contextFontSize: ${brand.contextFontSize},
  fontSizes: {
    xl: ${brand.fontSizes.xl},
    lg: ${brand.fontSizes.lg},
    md: ${brand.fontSizes.md},
    sm: ${brand.fontSizes.sm},
  },
  outroSizes: {
    name: ${brand.outroSizes.name},
    cta: ${brand.outroSizes.cta},
    ai: ${brand.outroSizes.ai},
  },
  horizonGlow: ${brand.horizonGlow},
  decor: {
    type: ${q(brand.decor.type, null, 0)},
    count: ${brand.decor.count},
  },
  c: {
${Object.entries(C)
  .map(([k, v]) => `    ${k}: ${q(v, null, 0)},`)
  .join("\n")}
  },
} as const;

export default brand;
`;

if (DRY) {
  console.log(body);
  console.error(`\n[dry] 将写入 ${outPath}`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(outPath), {recursive: true});
fs.writeFileSync(outPath, body, "utf8");
console.log(`✓ ${path.relative(process.cwd(), outPath)}  ←  ${path.relative(process.cwd(), kitPath)}`);
console.log(`  品牌 ${brand.name} | 主色 ${primary} | 装饰 ${brand.decor.type}${brand.decor.count ? " ×" + brand.decor.count : ""}`);
