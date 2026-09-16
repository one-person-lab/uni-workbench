import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workbenchRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const repositoryRoot = path.resolve(workbenchRoot, "..");
const excludedDirectories = new Set([
  ".git", ".astro", "dist", "node_modules", "qa",
]);

/*
 * 扫描范围（2026-09-08 重新界定）
 * 仓库现在是「单仓库 + 私有」：career/ 与 kb/ 里放的就是真实个人数据，
 * 扫到“有个人信息”不代表泄露，那是数据层。公开面只有 site/dist/，
 * 由 site/scripts/verify-public.mjs 在发布边界把关。
 * 本脚本负责另一半：版本库里的代码、文档、站点源文件不得夹带个人标识与凭证。
 */
const excludedPrefixes = [
  "career/",           // 私有数据层：个人履历与面试记录
  "kb/",             // Vault：私有数据层
  "identity/",        // 身份三件套+记忆：私有数据层
  "ai-interview-guide/",  // 他人仓库克隆：不入库
  ".agents/skills/",      // 第三方技能安装：由 skills-lock.json 锁定，不入库
];
const excludedFiles = new Set([
  "engine/package-lock.json",
  "engine/scripts/privacy-scan.mjs",
  // 门禁规则文件自身必然写着要拦的标识与正则，跳过自身
  // （verify-public.mjs 现在从 privacy-rules.mjs import 规则，不再自带字面量）
  "site/scripts/privacy-rules.mjs",
  "site/scripts/visual-check.mjs",
]);
const binaryExtensions = new Set([
  ".gif", ".ico", ".jpeg", ".jpg", ".pdf", ".png", ".webp",
]);

const checks = [
  {
    label: "absolute macOS home path",
    expression: /\/Users\/[^/\s"'`<>]+/g,
  },
  {
    label: "private Vault or product identifier",
    expression: /MediaContentVault|OBSIDIAN\/MediaContentVault|小戴AI|小戴一直在学习/g,
  },
  {
    label: "credential-like assignment",
    expression: /(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][^"'\n]{8,}["']/gi,
  },
  {
    label: "private key material",
    expression: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
];

async function collectFiles(directory) {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".DS_Store")) continue;
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(repositoryRoot, absolutePath).split(path.sep).join("/");
    if (entry.isDirectory()) {
      const skipped =
        excludedDirectories.has(entry.name) ||
        excludedPrefixes.some((prefix) => relativePath.startsWith(prefix));
      if (!skipped) files.push(...await collectFiles(absolutePath));
      continue;
    }
    if (!entry.isFile() || excludedFiles.has(relativePath)) continue;
    if (excludedPrefixes.some((prefix) => relativePath.startsWith(prefix))) continue;
    if (binaryExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    const details = await stat(absolutePath);
    if (details.size > 5 * 1024 * 1024) continue;
    files.push({ absolutePath, relativePath });
  }
  return files;
}

const findings = [];
const scanned = await collectFiles(repositoryRoot);
if (process.argv.includes("--list")) {
  for (const file of scanned) process.stdout.write(file.relativePath + "\n");
  process.exit(0);
}
process.stdout.write(
  `Privacy scan: ${scanned.length} 个版本库文件（已排除 career/、kb/、identity/、ai-interview-guide/、.agents/skills/、site/dist/）。\n`,
);
for (const file of scanned) {
  const source = await readFile(file.absolutePath, "utf8");
  for (const check of checks) {
    check.expression.lastIndex = 0;
    for (const match of source.matchAll(check.expression)) {
      const line = source.slice(0, match.index).split("\n").length;
      findings.push({
        file: file.relativePath,
        line,
        label: check.label,
        sample: match[0].slice(0, 120),
      });
    }
  }
}

if (findings.length > 0) {
  process.stderr.write("Privacy scan failed:\n");
  for (const finding of findings) {
    process.stderr.write(
      `- ${finding.file}:${finding.line} [${finding.label}] ${finding.sample}\n`,
    );
  }
  process.exitCode = 1;
} else {
  process.stdout.write("Privacy scan passed: no blocked personal identifiers or credential assignments found.\n");
}
