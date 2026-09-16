---
name: oss-repo-sanitize
description: 把含个人隐私、真实凭据或商业品牌的私有仓库/工作台，安全转化为可公开的开源仓。当用户说"把这个仓库开源""去掉 XX 品牌再接进开源仓""开源前清理敏感信息""把 A 仓库合进 B"时使用。覆盖隔离复制、PII 与凭据扫描、中性化映射、结构重排、构建验证、泄漏终检，并内置踩坑清单。
agent_created: true
license: MIT
---

# 私有仓库开源化（PII / 凭据合规清理）

目标不是"删掉敏感内容"，而是**把私人资产变成可复用的开源模板**：真实姓名→示例候选人，真实公司→示例公司，真实服务器→占位符。

## 铁律

1. **归档，不删除。** 所有移出的内容进 `<repo>-archive/`，可回溯。删除只在用户明确要求时做。
2. **操作用 Python，不用 shell grep 扫中文。** 见「致命陷阱 1」。
3. **每一步都验证。** 改完必须重跑构建 + 全量泄漏终检。
4. **个人叙事 vs 技术文档要分开处置**：前者归档，后者中性化。

## 工作流（7 步）

### 1. 隔离复制（不要原地改）
源仓库保留不动，复制一份作为开源本体。大仓库用 `tar` 排除，**不要用 `cp -R`**（node_modules 会拖到超时被 SIGTERM）。

```bash
mkdir -p <new-repo> && tar cf - --exclude=node_modules --exclude=dist --exclude=.git \
  -C <src-repo> . | tar xf - -C <new-repo>
```

### 2. 排除私有目录 → 归档
按用户决策把 PII 目录（简历 / 项目成果 / 面试记录 / 客户资料 / 真实运营数据）移入 `<repo>-archive/`。

### 3. 品牌解耦
逐项清理，缺一不可：
- `package.json` 的 `name`
- `README` / 文档
- 源码与脚本里的**硬编码**（旧仓库名、命名空间、不存在的本地路径依赖）
- 代码注释里的旧命名

若存在本地专属数据源，抽成 `config/*.mjs`（本地版不进公开仓）+ `templates/*.example.mjs`（项目中立版，导出时覆盖）。

### 4. PII / 凭据扫描（必做，用 Python）
见下方脚本模板。**必查清单**：
姓名 / 手机号 / 邮箱 / 真实公司名 / 真实项目名 / **公网 IP + 明文密码** / SSH 公钥 / 主机别名 / 数据库账号密码 / 库名 / 内网 IP / 语雀或网盘个人空间 URL / Windows 用户名。

### 5. 中性化映射（建立固定映射表，全局替换）
| 类型 | 处理 |
| --- | --- |
| 真实姓名 | 示例候选人 |
| 真实公司 | 示例公司 / 示例公司B |
| 真实项目 | 示例项目A / 示例项目B |
| 服务器 IP | `your-server-ip` |
| 明文密码 | `<your-password>` |
| 数据库账号/库名 | `<db-user>` / `example_db` |
| 机器上的人名 | `<user>` |
| SSH 公钥 | `ssh-ed25519 AAAA...(your-public-key)` |
| 个人空间 URL | `yuque.com/<your-namespace>/...` |

**同时判别内容性质**：纯叙事类文件（自我介绍、职业履历、简历、面谈记录、期望薪资）不应中性化——**直接归档**，中性化会产出无意义文本。

### 6. 结构重排（如需要）
若要把知识库/内容目录改造成 PARA 等结构，**先读数据管道**（`build-data.mjs` 之类的目录→UI 映射），确认它按目录扫描还是硬编码，再同步改造分组常量与扫描函数。不要只移文件。

### 7. 验证（两步都要）
```bash
node scripts/build-data.mjs    # 数据管道可跑、分组正确
npm run build                  # 真实构建通过
```
再做全量泄漏终检（脚本模板见下），确认 PII 类关键词全部为 0。

## 扫描脚本模板（复制即用）

```python
import pathlib, re
from collections import defaultdict

root = pathlib.Path('.')
SKIP = {'node_modules', 'dist', '.git'}
EXT  = {'.md','.json','.ts','.vue','.mjs','.js','.html','.css','.yml','.yaml','.txt'}

# 1) 关键词残留扫描（想查什么往这里加）
KEYS = ['真实姓名','真实公司','真实项目','手机号','旧品牌名']
# 2) 凭据正则
RULES = {
    'IP':    re.compile(r'\b(?!127\.0\.0\.1|0\.0\.0\.0|192\.0\.2\.)(?:\d{1,3}\.){3}\d{1,3}\b'),
    'PWD':   re.compile(r'(密码|password|passwd|pwd)\s*[:：=]\s*\S+', re.I),
    'KEY':   re.compile(r'BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY'),
    'TOKEN': re.compile(r'(api[_-]?key|secret|token)\s*[:=]\s*["\']?[A-Za-z0-9_\-]{16,}', re.I),
}

hits = defaultdict(list)
for p in root.rglob('*'):
    if not p.is_file() or any(s in p.parts for s in SKIP): continue
    if p.suffix not in EXT or p.name in {'package-lock.json','generated.json'}: continue
    t = p.read_text(encoding='utf-8', errors='ignore')
    for k in KEYS:
        if k in t: hits[k].append(str(p))
    for lab, rx in RULES.items():
        for m in rx.finditer(t): hits[f'{lab}'].append(f'{p}: {m.group(0)[:60]}')
for k, v in hits.items():
    print(f'{"⚠️" if v else "✅"} {k}: {len(v)}')
    for x in v[:5]: print('   ', x)
```

中性化批量替换（同样用 Python，保证 UTF-8）：
```python
SUBS = [('真实公司','示例公司'), ('真实项目','示例项目A'),
        ('真实IP','your-server-ip'), ('真实密码','<your-password>')]
for p in root.rglob('*'):
    if not p.is_file() or any(s in p.parts for s in SKIP): continue
    if p.suffix not in EXT or p.name in {'package-lock.json','generated.json'}: continue
    t = p.read_text(encoding='utf-8'); o = t
    for a, b in SUBS: o = o.replace(a, b)
    if o != t: p.write_text(o, encoding='utf-8'); print('清理:', p)
```

## 致命陷阱

1. **`grep 'a\|b'` 在中文环境会静默失效**——返回空，让人误判"已清零"。涉及中文的敏感词扫描**一律用 Python**。（单个词 `grep -rl "词"` 尚可，多词交替必挂。）
2. **`cp -R` 大仓库会被 SIGTERM 中断**（node_modules 太多），留下不完整副本。用 `tar` 排除。
3. **`mv` 在沙箱里可能退化为复制**，源目录残留空壳——操作后必须校验源已清空。
4. **先做泄漏扫描再动结构**：结构重排会改动大量文件，扫描结果失去参考价值。
5. **公开仓禁止直接 push 含敏感历史的原仓库**：历史里的删除只是"再删一次"，旧的敏感内容仍在。只能导出**全新历史快照**（`git init` + 单次提交 + 强推）。
6. **系统 git 被 Xcode 许可协议卡住时（macOS），不要停工。** `/usr/bin/git` 只是个 shim，会调用 `xcode-select -p` 指向的 Xcode；未同意协议就统一报 "You have not agreed to the Xcode license agreements"，`git status` 都跑不了。
   **绕过**：直接用 CommandLineTools 自带的 git 绝对路径，它不受 Xcode 协议限制：
   ```bash
   ls -la /Library/Developer/CommandLineTools/usr/bin/git   # 先确认存在
   export GIT=/Library/Developer/CommandLineTools/usr/bin/git
   $GIT --version && $GIT status
   ```
   若该路径不存在，才需要用户执行 `sudo xcodebuild -license`。
   **注意**：此时提交身份可能是个无关的全局配置，推送公开仓前先设仓库级身份，不要污染公开历史：
   ```bash
   $GIT config user.name  "<github-username>"
   $GIT config user.email "<github-username>@users.noreply.github.com"
   $GIT config core.quotepath false   # 中文文件名不转义
   ```

## 验收标准

- [ ] 源仓库已被隔离副本取代（或已归档），归档目录可回溯
- [ ] 品牌关键词、PII 关键词、凭据正则三类扫描**全部为 0**
- [ ] 数据管道脚本可跑，分组/索引正确
- [ ] 真实构建通过（不是只跑 lint）
- [ ] 公开仓文件清单无 `node_modules` / `dist` / 真实隐私目录
