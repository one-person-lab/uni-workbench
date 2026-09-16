# Neo-Brutalism 组件配方

所有配方假定已引入 `assets/neo-brutalism.css` 的变量。每个组件给出：结构、状态、反例。

通用前提：**描边宽度、投影偏移、圆角全局统一**。下面的数值以 `--nb-border-w: 3px` / `--nb-shadow: 4px 4px 0` 为基准，移动端按 `2px` / `2px 2px 0` 等比降。

---

## 按钮

三种层级，靠**填充方式**区分，不靠尺寸或透明度：

```css
.nb-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 20px;
  border: var(--nb-border-w) solid var(--nb-ink);
  border-radius: var(--nb-radius);
  box-shadow: var(--nb-shadow-sm);
  font: 500 var(--nb-size-sm)/1 var(--nb-font-sans);
  cursor: pointer;
  transition: transform var(--nb-dur-fast) var(--nb-ease),
              box-shadow var(--nb-dur-fast) var(--nb-ease);
}

.nb-btn--primary { background: var(--nb-primary); color: var(--nb-ink); }
.nb-btn--accent  { background: var(--nb-accent);  color: #fff; }
.nb-btn--ghost   { background: var(--nb-white);   color: var(--nb-ink); }

.nb-btn:hover  { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--nb-ink); }
.nb-btn:active { transform: translate(4px, 4px); box-shadow: none; }

.nb-btn:focus-visible {
  outline: 3px solid var(--nb-accent);
  outline-offset: 3px;
}

.nb-btn[disabled],
.nb-btn[aria-disabled="true"] {
  background: #E5E5E0; color: #8A8A85;
  border-color: #8A8A85; box-shadow: 2px 2px 0 #8A8A85;
  transform: none; cursor: not-allowed;
}
```

**反例**：胶囊形按钮（`border-radius: 999px`）、hover 时背景变浅 10%、无描边的纯色按钮、加载态用旋转菊花图标（改用文字 `处理中…` 或方块闪烁，见「加载态」）。

**层级纪律**：一个视图里只允许一个 `--primary`/`--accent` 主按钮。其余全部 `--ghost`。这与 neo-brutalism 的"重量感"直接相关——都重，等于都不重。

---

## 卡片

```css
.nb-card {
  background: var(--nb-white);
  border: var(--nb-border-w) solid var(--nb-ink);
  border-radius: var(--nb-radius);
  box-shadow: var(--nb-shadow);
  padding: 20px;
}
```

**卡片内部标题区**（制造层次，不用阴影）：

```html
<div style="border-bottom: 3px solid var(--nb-ink); margin: -20px -20px 16px; padding: 12px 20px; background: var(--nb-primary);">
  <span style="font: 700 15px var(--nb-font-sans);">卡片标题</span>
</div>
```

即：标题条用「满宽色块 + 一条墨色下边」压在卡片顶部。这是 neo-brutalism 最典型的卡片结构。

**反例**：卡片用柔和阴影浮起、卡片之间用间距区分层级（应该用描边粗细或投影大小区分）、卡片内再套卡片（嵌套不要超过一层，第二层改用 `2px` 描边 + 无投影区分）。

---

## 输入框与表单

```css
.nb-input {
  width: 100%; padding: 10px 12px;
  background: var(--nb-white);
  border: var(--nb-border-w) solid var(--nb-ink);
  border-radius: var(--nb-radius);
  font: 400 var(--nb-size-sm)/1.4 var(--nb-font-sans);
  color: var(--nb-ink);
  transition: box-shadow var(--nb-dur-fast) var(--nb-ease);
}
.nb-input::placeholder { color: #8A8A85; }
.nb-input:focus {
  outline: none;
  box-shadow: var(--nb-shadow-sm);          /* 聚焦时"抬起来"，不用发光 */
}
.nb-input[aria-invalid="true"] {
  border-color: var(--nb-danger);
  box-shadow: 3px 3px 0 var(--nb-danger);
}
```

**标签用等宽字体 + 全大写**（英文）或小号加粗（中文），放在输入框上方，不要用浮动标签：

```html
<label style="display:block; font: 500 12px var(--nb-font-mono); letter-spacing:.06em; margin-bottom:6px;">AMOUNT</label>
```

错误提示放在输入框下方，用墨色文字 + 红色小方块前缀，不用红色文字（红字在白底上对比度常不足）：

```html
<p style="display:flex; align-items:center; gap:6px; font-size:12px; margin-top:6px;">
  <span style="width:8px;height:8px;background:var(--nb-danger);display:block;"></span>
  金额不能超过钱包余额
</p>
```

---

## 弹窗 / 模态

```css
.nb-modal-mask {
  position: fixed; inset: 0;
  background: rgba(28, 41, 60, 0.6);   /* 唯一允许的透明度用法：实心遮罩 */
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.nb-modal {
  background: var(--nb-white);
  border: var(--nb-border-w) solid var(--nb-ink);
  border-radius: var(--nb-radius);
  box-shadow: var(--nb-shadow-lg);
  max-width: 420px; width: 100%;
}
```

结构：标题条（色块 + 墨边）→ 内容区（`20px` padding）→ 操作区（顶部 3px 墨线分隔，按钮右对齐，主按钮在最右）。

**注意**：遮罩用纯色，不要用 backdrop-blur。打开动效只做 `transform: scale(0.96) → 1` + `opacity`，`120ms`，不要弹跳。

---

## 进度条

neo-brutalism 的进度条应该**分段、有边框、能数清**——这比连续条形更有"承诺感"：

```html
<div style="border: 3px solid var(--nb-ink); background: var(--nb-white); height: 20px; display:flex;">
  <div style="width: 33%; background: var(--nb-accent); border-right: 3px solid var(--nb-ink);"></div>
</div>
```

变体：用 21 个小方格（每天一格）代替连续条——适合 21 天打卡、连续签到类场景。已完成的格子填充主色，未完成留白，格子之间 4px 间隙，整体外围一圈墨色描边。

数字必须用等宽字体并紧跟其后：`DAY_07/21`。

**反例**：渐变进度条、圆角进度条、圆角端点。

---

## 徽章 / 状态标签

```css
.nb-badge {
  display: inline-block; padding: 3px 8px;
  border: 2px solid var(--nb-ink); border-radius: 0;
  font: 500 12px var(--nb-font-mono);
  background: var(--nb-primary); color: var(--nb-ink);
}
```

语义映射：进行中 → 纸白底；已完成 → 成功绿底白字；失败 → 危险红底白字；待处理 → 黄底墨字。

**一律加描边**，即使底色很深。深底白字的徽章如果不加墨边，会在这个风格里"漏气"。

---

## Tab / 分段控件

选中态用**实心色块 + 投影**，未选中用纸白底。不要用下划线指示器。

```html
<div style="display:flex; border: 3px solid var(--nb-ink); background: var(--nb-white);">
  <div style="padding:10px 18px; background: var(--nb-ink); color:#fff; font-weight:500;">全部</div>
  <div style="padding:10px 18px; border-left:3px solid var(--nb-ink);">进行中</div>
  <div style="padding:10px 18px; border-left:3px solid var(--nb-ink);">已完成</div>
</div>
```

分段之间用墨色竖线分隔，整体外框一圈墨边。

**注意适用边界**：上面这套"选中 = 实心黑"只适合**横向分段控件**（3–5 项、一行以内、本身是一个整体控件）。搬到竖排导航列表就是灾难——见下节。

---

## 侧边导航 / 菜单列表（选中态）

**选中态不要用实心黑填充。** 这是最容易犯的错：分段控件里实心黑很好看，但一屏 7 项、每项都带图标色块的竖排导航里，它就变成一条顶到底的重色长块——把色块压住、让整列的视觉重心歪掉。

正确解法是**抬起卡片**：白底 + 2px 墨边 + 右下硬投影。选中表达的是"这张纸抬起来了"，而不是"这一块被涂黑了"。

```html
<!-- 未选中 -->
<button class="border-2 border-transparent font-bold hover:bg-[主色]/60"> … </button>
<!-- 选中 -->
<button class="border-2 border-black bg-white font-black shadow-neo-sm"> … </button>
```

四条容易踩的细节：

1. **形状要用小圆角，别用胶囊**。`rounded-full` + 偏移硬投影会沿曲线走出"双弧边"，看着像重影。矩形（4–6px 圆角）才是硬投影的正确载体。
2. **列表 `gap` 必须 ≥ 4px（推荐 6px）**。选中项有 2px 投影，间距太小会顶到下一项。原来用 `gap-0.5`（2px）的紧排列表，改选中态时必须同步放宽。
3. **投影要小于容器的投影**。容器 `.neo-card` 用 `4px 4px 0`，选中项就用 `2px 2px 0`——层次是"容器 > 当前项"。反过来（选中项投影比容器还大）会像浮在容器外面。
4. **别用纸白底，用纯白**。容器本身已经是纸白（`#fffcf5`），选中项再用同色等于没变化。纯白（`#fff`）那一点亮度差 + 墨边 + 投影，刚好够用。
5. **两个状态都要带 `border-2`**，未选中写 `border-transparent` 占位。否则点击时盒子尺寸跳 4px，整列内容会抖一下。

**对图标的影响**：实心黑选中态下，色块容器里的图标必须显式加 `text-black`，否则会被黑底的白字继承规则染白、与 pastel 色块撞色。换成抬起卡片后这个问题自动消失——但保留 `text-black` 仍是好习惯，将来改回深色选中态时不会翻车。

**顺带一个收益**：抬起卡片让图标色块保持在白底上，颜色识别度是完整的；实心黑时色块周围一圈黑，pastel 会被压暗。

---

## 空状态

neo-brutalism 的空状态不用插画，用**大字 + 实心色块**：

```html
<div style="text-align:center; padding:48px 24px;">
  <div style="width:64px; height:64px; border:3px solid var(--nb-ink); background:var(--nb-primary); box-shadow:4px 4px 0 var(--nb-ink); margin:0 auto 20px;"></div>
  <p style="font:700 21px var(--nb-font-sans); margin:0 0 8px;">还没有挑战</p>
  <p style="font-size:15px; color:#5F5E5A; margin:0 0 20px;">选一个 21 天挑战，投入挑战金开始</p>
  <span class="nb-btn nb-btn--accent">去看看</span>
</div>
```

---

## 加载态

**不要用旋转菊花**。用文字 + 方块闪烁，或骨架屏（骨架块用 `2px` 墨边 + 纸白底，不加动画或用 800ms 的透明度呼吸）。

```html
<span style="font:500 13px var(--nb-font-mono); letter-spacing:.06em;">加载中…</span>
```

---

## 提示条 / Toast

顶部或底部满宽，`3px` 墨边（只保留朝向内容的那一边，或四周全包），左侧一个 `32px` 实心色块标记语义。不要圆角，不要阴影，不要自动渐隐——保留关闭按钮，或者停留 4 秒后瞬时消失。

---

## 表格

- 表头：墨色实底 + 白字，或纸白底 + `3px` 下边框（不要用浅灰表头）
- 行分隔：`2px` 实线，不要斑马纹（斑马纹属于柔和风格语言）
- 数字列：等宽字体、右对齐
- 选中行：整行换成主色底
- 单元格内操作按钮用小号 `--ghost` 变体

---

## 金额与数字展示

这是 neo-brutalism 的招牌场景——金额要看起来"有重量"：

```html
<div style="display:inline-flex; align-items:baseline; gap:4px; font-family:var(--nb-font-mono);">
  <span style="font-size:15px; font-weight:500;">¥</span>
  <span style="font-size:35px; font-weight:700; letter-spacing:-0.02em;">199.00</span>
</div>
```

要点：货币符号小一号、金额用等宽 + 700 字重、小数位补齐两位、**不要千分位逗号之外的任何装饰**。需要强调时，给整块加 `背景色块 + 墨边`，而不是改成红色或加粗更多。
