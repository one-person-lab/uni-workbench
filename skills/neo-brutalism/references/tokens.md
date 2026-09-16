# Neo-Brutalism Design Tokens

## 核心原则

少于 8 个颜色变量就能跑起来。这是 neo-brutalism 的优势——它不靠色彩丰富取胜，靠对比。

必有的四类：**墨色**（描边与文字）、**纸色**（底）、**主色**（强调）、**语义色**（成功/警告/危险）。

## 几何 token（跨产品通用，先定这组）

| Token | 值 | 说明 |
|-------|-----|------|
| `--nb-border-w` | `3px` | 桌面主描边。移动端降到 `2px` |
| `--nb-border-w-thin` | `2px` | 嵌套元素 / 小控件 |
| `--nb-shadow` | `4px 4px 0 var(--nb-ink)` | 桌面主投影。移动端 `2px 2px 0` |
| `--nb-shadow-sm` | `2px 2px 0 var(--nb-ink)` | 按钮等小元素 |
| `--nb-shadow-lg` | `8px 8px 0 var(--nb-ink)` | 弹窗 / 强调卡片 |
| `--nb-radius` | `0` | 首选。上限 `4px` |
| `--nb-gap` | `4/8/12/16/24/32` | 间距阶梯，不要自创中间值 |

**一致性铁律**：选定后全局统一。描边 3px 就所有描边都 3px（含输入框、分割线、徽章），不能主卡片 3px、次卡片 2px。

## 配色方案 A：经典黄紫（默认推荐）

最通用。明亮、亲和、辨识度高。适合消费级产品、创作者平台、活动页。

```css
--nb-ink:      #1C293C;  /* 描边、正文（不用纯黑 #000，深墨更耐看） */
--nb-paper:    #FBFBF9;  /* 页面底，暖白 */
--nb-white:    #FFFFFF;  /* 卡片底 */
--nb-primary:  #FDC800;  /* 主色，黄 */
--nb-accent:   #432DD7;  /* 强调色，紫 */
--nb-success:  #16A34A;
--nb-warning:  #D97706;
--nb-danger:   #DC2626;
```

用法：主按钮 = 紫底白字；高亮块 = 黄底黑字；警示 = 红底白字。

## 配色方案 B：纯黑白（克制高级）

适合工具类、数据类、面向专业用户的产品。用一个小面积荧光色破局，不要大面积用。

```css
--nb-ink:      #111111;
--nb-paper:    #F5F5F0;  /* 略泛黄的纸白，比纯白有质感 */
--nb-white:    #FFFFFF;
--nb-primary:  #111111;  /* 主色就是墨色本身 */
--nb-accent:   #D6FF3F;  /* 荧光黄绿，仅用于 1–2 处点缀（徽章/高亮数字） */
```

## 配色方案 C：警示红黑（风险与紧迫）

适合金融、风控、限时活动、错误态密集的产品。红只用于真正需要警觉的地方，滥用会脱敏。

```css
--nb-ink:      #141414;
--nb-paper:    #FFFFFF;
--nb-primary:  #DC2626;
--nb-accent:   #FDC800;  /* 次级提示用黄，不要什么都红 */
--nb-success:  #16A34A;
```

## 字体 token

```css
--nb-font-sans: "Inter", -apple-system, "PingFang SC", sans-serif;
--nb-font-mono: "JetBrains Mono", "SF Mono", ui-monospace, monospace;

--nb-size-xs: 13px;
--nb-size-sm: 15px;
--nb-size-md: 17px;
--nb-size-lg: 21px;
--nb-size-xl: 27px;
--nb-size-2xl: 35px;

--nb-weight-body: 400;
--nb-weight-medium: 500;
--nb-weight-bold: 700;   /* 标题专用，不要 800/900 */
```

**等宽字体的用法**（风格的关键细节，别省）：金额、编号、日期、状态标签、计数器、进度数字。凡是"数据"都用等宽，凡是"叙述"都用无衬线。

## 动效 token

```css
--nb-dur-fast: 80ms;
--nb-dur-base: 120ms;
--nb-ease: cubic-bezier(0.2, 0, 0, 1);
```

只用 `transform: translate()` 和 `background-color` 做过渡。**不要过渡 `box-shadow`**——硬投影位移时应该瞬时切换，那才是物理感。

按压反馈的正确做法：元素 hover 时向右下移 2px 并缩小投影，press 时移到投影位置、投影归零。这模拟"按下去"的物理感：

```css
.nb-btn:hover  { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--nb-ink); }
.nb-btn:active { transform: translate(4px, 4px); box-shadow: none; }
```

## 从既有设计系统迁移

如果项目已有 token 体系，做映射而不是替换：

| 原 token | 映射到 |
|----------|--------|
| `border-radius: 8px+` / `9999px` | `--nb-radius`（0–4px） |
| `box-shadow: 0 2px 8px rgba(...)` | `--nb-shadow`（硬投影） |
| `border: 1px solid #E5E7EB` | `--nb-border-w solid var(--nb-ink)` |
| 品牌主色（低饱和） | 保持不变，只提高饱和度与明度；不要为了风格换掉品牌色 |
| `transition: 300ms` | `--nb-dur-base`（120ms） |

**品牌色处理原则**：如果产品有已确立的品牌色，保留色相、提高饱和度和明度即可，不要换成上面的黄紫。风格特征来自几何（描边/投影/圆角）和排版，颜色是可以替换的。
