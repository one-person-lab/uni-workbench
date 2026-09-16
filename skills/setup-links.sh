#!/usr/bin/env bash
# 新机器恢复脚本：clone 本仓库后跑一次，重建所有 symlink
# 用法：bash setup-links.sh
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_DIR="$REPO_ROOT/skills"
IDENTITY_DIR="$REPO_ROOT/identity"
WB_SKILLS="$HOME/.workbuddy/skills"
CLAUDE_SKILLS="$HOME/.claude/skills"

mkdir -p "$WB_SKILLS" "$CLAUDE_SKILLS"

link() {
  local src="$1" dst="$2"
  if [ -L "$dst" ] && [ ! -e "$dst" ]; then
    echo "⚠️  断链，重建: $dst -> $src"
    rm -f "$dst"
    ln -s "$src" "$dst"
  elif [ -L "$dst" ]; then
    echo "已存在 symlink（跳过）: $dst"
  elif [ -e "$dst" ]; then
    echo "⚠️  目标已存在且不是 symlink，跳过（请人工处理）: $dst" >&2
  else
    ln -s "$src" "$dst"
    echo "linked: $dst -> $src"
  fi
}

# 用户级 skill（WorkBuddy 加载位）
# 注意：video-publisher 必须挂这里，否则 WorkBuddy 侧调不到（曾只挂 Claude 位导致 Skill 查不到）
for d in neo-brutalism tide-style uniapp-visual-test md-vault-workbench koubo-video authed-site-harvest app-store-research product-demo-video video-factory video-publisher oss-repo-sanitize jianghushuo hypit; do
  link "$SKILLS_DIR/$d" "$WB_SKILLS/$d"
done

# CLI skill（Claude Code 加载位）：发布器依赖 ego-browser 命令行，两处都挂
link "$SKILLS_DIR/video-publisher" "$CLAUDE_SKILLS/video-publisher"

# 注意：hypit 是「技能(本文件只挂 SKILL.md+references)」与「可执行引擎(独立 monorepo)」分离。
# 引擎需单独准备：git clone hypit-ai/hypit 后 `pnpm install --frozen-lockfile --ignore-scripts`，
# 再把仓库根的 `hypit` 启动脚本软链到 PATH（如 /opt/homebrew/bin/hypit）。技能本身不含引擎代码。

# 身份三件套 + 用户级长期记忆
for f in IDENTITY.md SOUL.md USER.md MEMORY.md; do
  link "$IDENTITY_DIR/$f" "$HOME/.workbuddy/$f"
done

# ego-browser 由 ego 工具自装（~/.local/share/ego），不在本仓库管辖
echo "完成。ego-browser 请用 ego 工具重新安装。"
