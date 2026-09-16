# Components —— 玻璃组件配方

> 所有颜色引用语义令牌（见 tokens.md）。配方给出的是"结构 + 令牌引用方式"，数值可直接用。
> 单位约定：uni-app 项目用 rpx（750 设计稿），Web 项目把 rpx 换算为 px（÷2）。

## 1. 玻璃卡片（风格的基本单元）

```css
.glass-card {
  background: var(--surface-card);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  border-radius: 26rpx;                          /* 13px 级；重点卡可到 52rpx */
  border: 1rpx solid var(--border);
  box-shadow: var(--shadow-card),
              inset 0 1rpx 0 rgba(255,255,255,0.15);  /* 顶部内高光是玻璃感的另一半 */
  padding: 32rpx;
}
```

**反例**：`background: #fff` 实心白卡直贴深底（失去"透出场景"的能力）；只有半透明底没有 blur（雾没擦干净）；没有内高光（塑料片而不是玻璃）。

选中态用 `--surface-solid`（近实心白）+ `--text-inverse`，这是全站唯一允许"实心白"的地方。

## 2. 暖金主 CTA（一屏一处）

```css
.cta-primary {
  background: linear-gradient(135deg, var(--brand-strong) 0%, var(--brand) 100%);
  color: var(--text-on-brand);
  border-radius: 999rpx;                          /* 胶囊 */
  font-weight: 600;
  box-shadow: 0 12rpx 32rpx var(--brand-glow);    /* 暖光晕：黑暗里的灯 */
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.cta-primary:active {
  transform: scale(0.97);
  box-shadow: 0 6rpx 16rpx var(--brand-glow);
}
```

**反例**：两个暖金按钮同屏；暖金铺成区块背景；CTA 上用白字（必须 `--text-on-brand` 深字）。

## 3. 胶囊按钮（次级）

```css
.btn-capsule {
  background: var(--surface-2);
  border: 1rpx solid var(--border);
  border-radius: 999rpx;
  color: var(--text-secondary);
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-capsule.active {
  color: var(--text-inverse);
  background: var(--surface-solid);
  border-color: var(--surface-solid);
}
```

## 4. FAB 悬浮球

```css
.fab {
  border-radius: 50%;
  /* 深色主题：近黑玻璃 + 顶部高光 + 三层落影 */
  background: linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%),
              linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  box-shadow: 0 24rpx 48rpx rgba(0,0,0,0.35),
              0 12rpx 24rpx rgba(0,0,0,0.25),
              0 6rpx 12rpx rgba(0,0,0,0.15),
              inset 0 2rpx 0 rgba(255,255,255,0.15);
  border: 1.5rpx solid rgba(255,255,255,0.08);
  /* 浅色主题换纯白渐变 + 灰落影，用 .theme-light 覆盖背景与阴影，结构不变 */
}
```

配 `fabFloat` 漂浮动画（见 motion.md）。**反例**：FAB 用暖金（抢 CTA 的灯）；方角。

## 5. 悬浮玻璃图标钮（44px 触控热区）

```css
.glass-icon-btn {
  width: 88rpx; height: 88rpx;
  background: var(--surface-1);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  border-radius: 44rpx;
  border: 1rpx solid var(--border-strong);
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.12),
              inset 0 1rpx 0 rgba(255,255,255,0.15);
}
```

需要"引起注意"时叠呼吸动画（motion.md）。

## 6. 信息标签（tag）与胶囊 chip

```css
.tag {                        /* 分类标签：浅底 + 同色字 */
  background: var(--tag-life-bg);
  color: var(--tag-life-text);
  border-radius: 999rpx;
  font-size: 22rpx;
  padding: 6rpx 20rpx;
}
.chip {                       /* 中性信息胶囊 */
  background: var(--chip-bg);
  color: var(--text-secondary);
  border-radius: 999rpx;
}
```

**反例**：裸色字无底；标签四色同屏超过 2 种。

## 7. 状态徽章（成功 / 失败 / 进行）

```css
.badge-success { background: var(--state-success-soft); color: var(--state-success); }
.badge-fail    { background: var(--state-fail-soft);    color: var(--state-fail); }
.badge-doing   { background: var(--brand-soft);          color: var(--brand); }
/* 共同结构：border-radius: 999rpx; padding: 6rpx 20rpx; font-weight: 600; */
```

失败分两档：破坏性失败用 `--state-danger`（珊瑚红），"今日未达成"这类温和失败用 `--state-fail`（琥珀橙）。

## 8. 悬浮导航 / TabBar

```css
.floating-nav {
  background: var(--bg-nav);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 48rpx;
  border: 1rpx solid var(--border);
}
.nav-item.selected {
  background: var(--brand-soft);       /* 或 --surface-solid 深字，二选一，全站统一 */
  border-radius: 32rpx;
}
```

## 9. L1 场景页上的文字与控件

摄影底图页（首页级）上，文字不进玻璃卡时必须：

```css
.hero-text {
  color: #fff;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}
.bottom-gradient {                 /* 文字可读性遮罩，压在底图上 */
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.35) 50%, transparent 100%);
}
```

规则：白字必须有遮罩或 text-shadow 托底；底图上不放小号 tertiary 文字。

## 10. 输入框（凹陷）

```css
.input-sunken {
  background: var(--bg-sunken);
  border: 1rpx solid var(--border-subtle);
  border-radius: 24rpx;
  color: var(--text-primary);
}
.input-sunken:focus { border-color: var(--brand-border); }
```

## 组件选用速查

| 需求 | 用什么 |
|------|--------|
| 主行动 | 暖金 CTA（一屏一个） |
| 次行动 | 胶囊按钮 |
| 内容容器 | 玻璃卡片（surface-card） |
| 弱分层/内嵌 | surface-1/2 |
| 选中态 | surface-solid + text-inverse |
| 分类/状态 | tag / badge（soft 底 + 同色字） |
| 悬浮操作 | FAB 或玻璃图标钮 |
| 输入 | sunken 凹陷框 |
