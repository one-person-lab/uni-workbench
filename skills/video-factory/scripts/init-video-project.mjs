#!/usr/bin/env node
/**
 * 脚手架：一分钟起一个新的品牌视频工程（含口播模板 + brand-kit 注入）。
 *
 * 用法：
 *   node init-video-project.mjs <project-name> [--dir <父目录>] [--from <已有 brand-kit.json>]
 *
 * 例如：
 *   node init-video-project.mjs promo-video-buildhub --dir ~/workspace/code/one-person-hub \
 *        --from ../../build-hub/.workbuddy/brand-kit.json
 */
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";

const SKILL_DIR = path.resolve(import.meta.dirname, "..");
const TEMPLATE = path.join(SKILL_DIR, "remotion-template");
const GEN = path.join(SKILL_DIR, "scripts/gen-brand-theme.mjs");

const argv = process.argv.slice(2);
function arg(name, def) {
  const i = argv.indexOf("--" + name);
  return i > -1 && argv[i + 1] ? argv[i + 1] : def;
}

const name = argv[0] && !argv[0].startsWith("--") ? argv[0] : null;
if (!name) {
  console.error("用法: node init-video-project.mjs <project-name> [--dir <父目录>] [--from <brand-kit.json>]");
  process.exit(1);
}
const root = path.resolve(arg("dir", process.cwd()), name);
if (fs.existsSync(root)) {
  console.error(`✗ 已存在: ${root}`);
  process.exit(1);
}

const REMOTION_VERSION = "4.0.521";

const files = {
  "package.json": JSON.stringify(
    {
      name,
      version: "1.0.0",
      private: true,
      scripts: {
        dev: "remotion studio",
        "sync:template": 'node "${VIDEO_FACTORY:-../uni-workbench/skills/video-factory}/scripts/sync-template.mjs" .',
        "gen:brand": 'node "${VIDEO_FACTORY:-../uni-workbench/skills/video-factory}/scripts/gen-brand-theme.mjs" --kit brand-kit.json',
        pull: 'node "${VIDEO_FACTORY:-../uni-workbench/skills/video-factory}/scripts/pull-product.mjs" .',
        "pull:check": 'node "${VIDEO_FACTORY:-../uni-workbench/skills/video-factory}/scripts/pull-product.mjs" . --check',
        "render:koubo": 'remotion render Koubo "out/koubo.mp4"',
      },
      dependencies: {
        "@remotion/cli": REMOTION_VERSION,
        "@remotion/zod-types": `^${REMOTION_VERSION}`,
        react: "19.2.3",
        "react-dom": "19.2.3",
        remotion: `^${REMOTION_VERSION}`,
        zod: "^4.5.4",
      },
      devDependencies: {
        "@types/react": "19.2.7",
        typescript: "5.9.3",
      },
    },
    null,
    2
  ) + "\n",

  "remotion.config.ts": `import { Config } from "@remotion/cli/config";

// 本机网络下载不了 Remotion 的 Headless Shell，直接用系统 Chrome
Config.setBrowserExecutable("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
Config.setChromeMode("headless");

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
Config.setCrf(17);
Config.setAudioBitrate("192k");
`,

  "tsconfig.json": JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        lib: ["ES2020", "DOM"],
        module: "ESNext",
        moduleResolution: "bundler",
        jsx: "react-jsx",
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        resolveJsonModule: true,
        skipLibCheck: true,
      },
      include: ["src"],
    },
    null,
    2
  ) + "\n",

  ".gitignore": `node_modules
out
.tmp
.DS_Store
`,

  "src/index.ts": `import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
`,

  "src/Root.tsx": `import type {FC} from "react";
import {Composition} from "remotion";
import {Koubo, KOUBO_TOTAL} from "./koubo";
import timing from "./koubo/koubo-timing.json";

export const RemotionRoot: FC = () => (
  <Composition
    id="Koubo"
    component={Koubo}
    durationInFrames={KOUBO_TOTAL}
    fps={timing.fps || 30}
    width={1080}
    height={1920}
  />
);
`,

  "public/.gitkeep": "",
};

console.log(`创建工程 → ${root}\n`);
for (const [rel, content] of Object.entries(files)) {
  const dst = path.join(root, rel);
  fs.mkdirSync(path.dirname(dst), {recursive: true});
  fs.writeFileSync(dst, content, "utf8");
  console.log(`  + ${rel}`);
}

// 模板代码 + 占位时间轴
fs.mkdirSync(path.join(root, "src/koubo"), {recursive: true});
for (const f of ["Koubo.tsx", "index.ts", "koubo-timing.json"]) {
  fs.copyFileSync(path.join(TEMPLATE, "src/koubo", f), path.join(root, "src/koubo", f));
  console.log(`  + src/koubo/${f} (模板)`);
}

// brand-kit
const fromKit = arg("from");
const kitPath = path.join(root, "brand-kit.json");
if (fromKit && fs.existsSync(path.resolve(fromKit))) {
  fs.copyFileSync(path.resolve(fromKit), kitPath);
  console.log(`  + brand-kit.json (来自 ${fromKit})`);
} else {
  fs.copyFileSync(path.join(SKILL_DIR, "examples/_blank.brand-kit.json"), kitPath);
  console.log("  + brand-kit.json (空白模板，记得填)");
}

// sources.json —— 拉取清单骨架（人工填：往产品仓的哪里取什么）
const srcPath = path.join(root, "sources.json");
fs.copyFileSync(path.join(SKILL_DIR, "examples/_blank.sources.json"), srcPath);
console.log("  + sources.json (空白模板，填 product.root 与 map 后跑 npm run pull)");

execFileSync(process.execPath, [GEN, "--kit", kitPath], {stdio: "inherit"});

console.log(`\n✓ ${name} 就绪`);
console.log(`  cd ${root} && npm install && npm run dev`);
console.log("\n  下一步：填 sources.json 的 product.root + map，然后 npm run pull 拉产品令牌。");
