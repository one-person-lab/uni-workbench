# Motion —— 动效规范

> 原则：动效是"呼吸与水波"，不是"机械与弹跳"。所有动效都应该慢得下来、轻得起来。

## 曲线与时长

| 场景 | 曲线 | 时长 |
|------|------|------|
| 标准过渡（颜色/透明度/背景） | `cubic-bezier(0.4, 0, 0.2, 1)` | 300–400ms |
| 按压回弹（FAB/图标钮） | `cubic-bezier(0.34, 1.56, 0.64, 1)`（spring） | 350–600ms |
| 入场（卡片/FAB 首现） | spring 曲线 + `both` 填充 | 600ms |
| 呼吸循环 | `ease-in-out` | 3–4s/圈 |

**红线**：时长 <150ms 的跳变（风格事故）；>500ms 的交互动效（用户在等）；弹性过冲用在非按压场景。

## 呼吸动画（风格灵魂）

用于"需要被注意但不催促"的元素（悬浮图标钮、引导入口）。容器与图标**同步**呼吸：

```css
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    background: var(--surface-1);
    box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.12),
                inset 0 1rpx 0 rgba(255,255,255,0.15);
  }
  50% {
    transform: scale(1.06);
    background: var(--surface-3);
    box-shadow: 0 12rpx 40rpx rgba(0,0,0,0.18),
                inset 0 1rpx 0 rgba(255,255,255,0.2);
  }
}
.breathe { animation: breathe 3.5s ease-in-out infinite; }
```

规则：呼吸元素一屏最多 1 个；用户按压后 `animation: none`（呼吸让位于操作）。

## 按压反馈

统一模式：`scale` 缩小 + 亮度/透明度微升，不放"按下沉"：

```css
.pressable { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.pressable:active { transform: scale(0.88); }        /* 图标钮/小控件 */
.cta-primary:active { transform: scale(0.97); }      /* 大按钮幅度收小 */
```

## 漂浮动画（FAB）

```css
@keyframes fabFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8rpx); }
}
.fab { animation: fabEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both,
                   fabFloat 4s ease-in-out 1s infinite; }
```

## 底图切换（L1 场景页）

- 背景图淡入淡出：`transition: opacity 0.3s`
- 遮罩与内容同步淡切，避免文字闪跳
- 底图预加载：swiper 渲染全部 scene，只切 `current`

## 降级（低端机 / 不支持 backdrop-filter）

```css
.glass-card {
  background: var(--surface-card);            /* 纯色半透明兜底，永远先写 */
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
}
```

- 半透明底是兜底，blur 是增强——**不支持 blur 时页面必须依然成立**
- 呼吸/漂浮动画在低端设备可选关闭（性能敏感页面用条件编译或 `prefers-reduced-motion`）
- 同屏 blur 元素不超过 4 个（uni-app App 端 webview 渲染，多了掉帧）

## 反面清单

- ❌ 跳变（无 transition 的显隐/换色）
- ❌ 弹跳过冲用在卡片入场（FAB 专用 spring，卡片用标准曲线）
- ❌ 多个元素同时呼吸（视觉焦躁）
- ❌ 长动画阻塞交互（入场动画期间应可点击）
