---
name: authed-site-harvest
description: 用 ego-browser 从**需要登录的网站后台**（创作者中心、商家后台、数据看板、SaaS 控制台）采集数据到本地。当用户说"同步某平台数据"、"把某后台数据接进我的看板"、"抓一下我的账号数据"，或平台没有对个人开放的 API、只有网页后台时使用。提供登录态复用、抗改版的提取策略、落 JSON 与接数据管道的完整方法。
metadata:
  version: "1.0.0"
  date: "2026-09-10"
  agent_created: true
---

# 采集需登录的后台数据

**适用场景**：目标数据只存在于网页后台，且平台没有对个人开放的 API。
典型：小红书/抖音创作者中心、公众号后台、抖店/有赞商家后台、各类 SaaS 控制台。

**先做判断：有没有官方 API。** API 是首选——稳定、有文档、不依赖登录态、不怕改版。只有确认拿不到 API 时才用本方法。
（常见结论：面向创作者的运营数据，个人几乎都拿不到 API。小红书开放平台永久限制个人开发者且不覆盖自有账号运营数据；抖音开放平台仅限企业开发者。）

## 为什么用 ego-browser

它跑的是**真实浏览器 + 用户自己的登录态**，因此：

- 不用处理登录、验证码、OAuth——用户登一次，长期有效
- 请求在页面内发出，签名与风控（如抖音 `a_bogus`/`byted_acrawler`）由页面自己处理
- 性质上等于"替用户点了几下页面"，而不是绕过限制去抓

**这条边界决定了风险量级**，也是选择它的核心理由。

## 四步流程

**1. 确认登录态。** 列出 spaces 找到对应 profile，逐个打开目标后台确认已登录。

> ⚠️ **别用根路径判断登录态。** 很多平台的根路径一律跳登录页，直接访问深链接才是已登录状态。曾因此误判"未登录"而白白绕了一圈。

若未登录，用 `task.handOff()` 让用户接管登录，再 `takeOverTaskSpace(id)` 恢复。

**2. 定位数据页。** 优先找**带表格或明确数字**的详情页，避开首页摘要——首页数字常是缩略的、四舍五入的、或统计口径不明的。

**3. 提取。** 见下方三条规则。

**4. 落盘。** 写成 JSON 文件，交给目标项目**已有的**数据管道。不要在这一步改渲染层。

## 提取三条规则

**规则一：绝不硬编码 CSS 类名。**
现代前端普遍用 CSS Modules / 原子化方案，类名带构建 hash（如 `metric-name-text-HADaeN`），改版即废。

**规则二：优先「标签 + 数值」文本正则。**
中文界面的标签文案是最稳定的锚点：

```js
const pick = (txt, keys) => {
  const out = {}
  for (const k of keys) {
    const m = txt.match(new RegExp(k + '\\s*([-+]?[\\d,]+(?:\\.\\d+)?%?)'))
    if (m) out[k] = m[1]
  }
  return out
}
```

好处是**坏了能立刻发现**（值变 `null`），修复只需改标签名。

**规则三：表格用二维化，而非逐列选择器。**

```js
const grid = await page.evaluate(() => {
  const trs = [...document.querySelectorAll('table tr')]
  return trs.map((tr) =>
    [...tr.querySelectorAll('td,th')].map((c) => (c.innerText || '').trim()),
  )
})
// 表头当 key 映射成对象 —— 列增删只影响映射，不影响抓取
```

**数值统一归一**：`"1,598"` / `"2.78万"` / `"11.6%"` / `"6.3s"` → `number`。注意「万/千」量级。

## 踩坑清单

- `task.newPage()` **返回值不是 Page 对象**（会报 `.goto is not a function`）。需要多页时复用 `task.page("p1")` 顺序导航，或从 `task.pages()` 取
- **`page.evaluate` 有 ~15s 超时**（`PageEvaluationTimeoutError`）。批量 fetch 一定要分小批（每批 ≤5 个请求），每批一次 evaluate，批次间在 Node 侧衔接
- **找内部 API 别猜路径**：猜 3 次还 404 就改用 `performance.getEntriesByType('resource')` 过滤 `/api/`，看页面加载时**实际调用**的端点和完整 query 参数（很多端点缺一个参数就是 404）
- 每次 heredoc 都是新进程，**JS 变量不保留**，但 space 与页面持久——把 `spaceId` 打印出来下轮复用，不要每轮开新 space
- macOS 无 `timeout` 命令，超时交给工具自身参数
- **提取逻辑尽量放 Node 侧**，`page.evaluate()` 只负责"把页面变成文本或二维数组"。解析放外层，改规则不用重跑浏览器
- 脚本写进项目文件，用 `ego-browser nodejs < script.mjs`（stdin 重定向）执行；只有临时探测才用 heredoc
- **别抓首页的摘要数字当快照**：优先详情页，并连带记录**统计周期**（"09-03 至 09-09"）——不同周期的数字不可比
- **全量清单别从可见链接抓**：树形目录（知识库、文档站、后台菜单）默认折叠，页面 `<a>` 只含展开项——语雀 130 节点只抓到 15 篇。先找页面自带的全量数据源：`window.appData`（语雀是 `appData.book.toc`，含 `type/title/url/level`，level 栈可还原分组路径），或点开「全部/展开」后再抓。核对手段：清单数 vs 页面显示的总数（如 `items_count`）必须对上，对不上就是漏了

## 交付形态

产物是**一个带日期的 JSON 文件**（`metrics/raw/<date>.json`），一个文件 = 一个快照点。
**不要覆盖同一个文件**——多个文件累积起来才有时间序列，才能画趋势。两个点就能看出走向，低频快照足够。

下游交给项目原有管道，渲染层不感知采集方式。这样从"手动导出"换成"自动采集"时，页面代码一行不用改。

## 合规边界（先确认再动手）

- 只采集**用户自己的账号**数据，不碰他人数据
- 不采集个人隐私字段（用户 ID、手机号、画像明细等）
- 频率克制。按业务节奏来（周更内容 → 每周 1–2 次足够），别做成高频定时任务
- 采集失败时**停下来问用户**，不要自动重试或降级到更激进的手段

## 案例：语雀（yuque.com）

语雀官方 API 与知识库导出**需要会员**，免费账号用页面内 fetch 采集：

- 端点：`/api/docs/<slug>?include_contributors=true&include_like=true&include_hits=true&merge_dynamic_data=true&book_id=<book_id>` → `data.content`
- `book_id` 是**数字 ID**，从任一篇文档页加载时的 resource 记录里抓（正则 `[?&]book_id=(\d+)`）
- `content` 是 lake 格式 HTML 变体（标准标签 + lake 属性）。三种 `card` 需预处理：`codeblock`（value 为 URL 编码 JSON，取 `code`/`language`）、`checkbox`（value 为 `data:true|false`）、`hr`；其余标签直接 turndown + gfm 转 markdown
- 文档目录从知识库页 DOM 的 `a[href^="/<ns>/"]` 收集；注意区分 Doc 和小记（部分小记无 content）
- 实现见 `acme/career-hub/scripts/fetch-yuque-raw.mjs`（采集）+ `convert-yuque.mjs`（转换）
