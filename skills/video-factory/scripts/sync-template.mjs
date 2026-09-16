#!/usr/bin/env node
/**
 * 把 video-factory 的通用口播模板同步到某个产品视频工程。
 *
 * 契约（重要）：
 *   - 模板**代码**文件会被覆盖（Koubo.tsx / index.ts）→ 实例里不许改这些文件
 *   - 实例**数据**文件永不覆盖（koubo-timing.json 由配音生成、brand-kit.json 由人工维护）
 *   - brand.generated.ts 每次都按 brand-kit.json 重新编译
 *
 * 用法：
 *   node sync-template.mjs <工程目录> [--kit <brand-kit.json>] [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";

const SKILL_DIR = path.resolve(import.meta.dirname, "..");
const TEMPLATE = path.join(SKILL_DIR, "remotion-template");
const GEN = path.join(SKILL_DIR, "scripts/gen-brand-theme.mjs");

/** 模板代码文件：[源相对路径, 目标相对路径] */
const CODE_FILES = [
  ["src/koubo/Koubo.tsx", "src/koubo/Koubo.tsx"],
  ["src/koubo/index.ts", "src/koubo/index.ts"],
];

const argv = process.argv.slice(2);
function arg(name, def) {
  const i = argv.indexOf("--" + name);
  return i > -1 && argv[i + 1] ? argv[i + 1] : def;
}

const project = argv.find((a) => !a.startsWith("--"));
if (!project) {
  console.error("用法: node sync-template.mjs <工程目录> [--kit <brand-kit.json>] [--dry]");
  process.exit(1);
}
const DRY = argv.includes("--dry");
const root = path.resolve(project);

if (!fs.existsSync(root)) {
  console.error(`✗ 工程目录不存在: ${root}`);
  process.exit(1);
}

const kitArg = arg("kit");
const kitPath = path.resolve(kitArg || path.join(root, "brand-kit.json"));

console.log(`同步 → ${root}`);
console.log(`brand-kit: ${kitPath}\n`);

// 1. 拷贝模板代码
for (const [from, to] of CODE_FILES) {
  const src = path.join(TEMPLATE, from);
  const dst = path.join(root, to);
  if (!fs.existsSync(src)) {
    console.error(`✗ 模板缺文件: ${src}`);
    process.exit(1);
  }
  const existed = fs.existsSync(dst);
  const same = existed && fs.readFileSync(dst, "utf8") === fs.readFileSync(src, "utf8");
  if (DRY) {
    console.log(`  ${same ? "·" : existed ? "↻" : "+"} ${to}${same ? " (无变化)" : existed ? " (覆盖)" : " (新建)"}`);
    continue;
  }
  fs.mkdirSync(path.dirname(dst), {recursive: true});
  fs.copyFileSync(src, dst);
  console.log(`  ${same ? "·" : existed ? "↻" : "+"} ${to}`);
}

// 2. 检查实例专有数据
const timing = path.join(root, "src/koubo/koubo-timing.json");
if (!fs.existsSync(timing)) {
  console.log("\n  ⚠ 缺 src/koubo/koubo-timing.json —— 跑 koubo-video 的 gen-koubo-audio.mjs 生成");
} else {
  console.log("  · src/koubo/koubo-timing.json 保留（实例数据，不覆盖）");
}

// 3. 编译品牌主题
console.log("");
if (DRY) {
  console.log(`  + src/koubo/brand.generated.ts (dry)`);
  process.exit(0);
}
execFileSync(
  process.execPath,
  [GEN, "--kit", kitPath, "--out", path.join(root, "src/koubo/brand.generated.ts")],
  {stdio: "inherit"}
);

console.log("\n✓ 完成。改品牌请编辑 brand-kit.json 再跑本脚本；改模板请改 skill 里的模板再同步到所有实例。");
