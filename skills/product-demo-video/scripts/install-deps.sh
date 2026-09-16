#!/usr/bin/env bash
# 依赖检查（**不自动安装**）
#
# 上游原版的 install-deps.sh 会 `npm i -g puppeteer`、`pip3 install ...` 到全局，
# 还可能往 /usr/local/bin 写 ffmpeg。本仓库改成就地检查 + 打印安装命令，
# 装到哪由你决定（推荐隔离环境，见 references/macos-adaptation.md）。
#
# 用法：bash scripts/install-deps.sh
set -u

echo "📋 product-demo-video 依赖检查"
echo

miss=0

check() {
  local label="$1" probe="$2" hint="$3"
  if eval "$probe" >/dev/null 2>&1; then
    printf "  ✅ %-14s %s\n" "$label" "$(eval "$probe" 2>/dev/null | head -1)"
  else
    printf "  ❌ %-14s 缺失\n     → %s\n" "$label" "$hint"
    miss=$((miss + 1))
  fi
}

check "ffmpeg"  "ffmpeg -version"  "brew install ffmpeg   （或系统包管理器）"
check "ffprobe" "ffprobe -version" "随 ffmpeg 一起安装"
check "node"    "node --version"   "安装 Node.js 18+"

# puppeteer：优先看 NODE_PATH，其次看全局
if [ -n "${NODE_PATH:-}" ] && [ -d "$NODE_PATH/puppeteer" ]; then
  printf "  ✅ %-14s %s\n" "puppeteer" "$NODE_PATH/puppeteer"
elif node -e "require.resolve('puppeteer')" >/dev/null 2>&1; then
  printf "  ✅ %-14s %s\n" "puppeteer" "解析正常"
elif node -e "require.resolve('puppeteer-core')" >/dev/null 2>&1; then
  printf "  ⚠️  %-14s 只有 puppeteer-core，需自备浏览器（设 CHROME_PATH）\n" "puppeteer"
else
  printf "  ❌ %-14s 缺失\n     → npm i puppeteer   （自带匹配版本 Chrome，推荐）\n" "puppeteer"
  miss=$((miss + 1))
fi

# python + edge-tts + Pillow
PY="${PYTHON:-python3}"
if command -v "$PY" >/dev/null 2>&1; then
  printf "  ✅ %-14s %s\n" "python" "$("$PY" --version 2>&1)"
  if "$PY" -c "import edge_tts" >/dev/null 2>&1; then
    printf "  ✅ %-14s 已装\n" "edge-tts"
  else
    printf "  ❌ %-14s 缺失\n     → pip install edge-tts\n" "edge-tts"
    miss=$((miss + 1))
  fi
  if "$PY" -c "import PIL" >/dev/null 2>&1; then
    printf "  ✅ %-14s 已装\n" "Pillow"
  else
    printf "  ❌ %-14s 缺失\n     → pip install Pillow\n" "Pillow"
    miss=$((miss + 1))
  fi
else
  printf "  ❌ %-14s 缺失\n     → 安装 Python 3，或用 PYTHON= 指定解释器\n" "python"
  miss=$((miss + 2))
fi

echo
if [ "$miss" -eq 0 ]; then
  echo "🎬 依赖齐了，可以跑："
  echo "   SCENES_FILE=./scenes.json OUT=./demo.mp4 node scripts/record-demo.mjs"
else
  echo "还差 $miss 项，按上面提示装完再跑。"
fi
