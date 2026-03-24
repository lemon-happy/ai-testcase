# 暗黑极客风登录注册页面改造

## Context

当前登录/注册页面为浅色简约风格，需改造为「暗黑极客风」：全屏动态海浪粒子背景 + Glassmorphism 表单容器 + 青色/电子蓝发光效果。
依据 spec 文件确认：品牌标识需适配暗黑风格，登录/注册切换时粒子背景不重新初始化，移动端 ≤60 粒子，桌面端 ≤150 粒子。

---

## 实现方案

### 总体架构

- **粒子动画**：原生 Canvas API + requestAnimationFrame，不引入任何新 npm 包
- **粒子连续性**：在 `(auth)/layout.tsx` 层挂载 `ParticleCanvas`，App Router 路由切换时 layout 不卸载，确保 `/login` ↔ `/register` 粒子不重建
- **CSS 策略**：在 `globals.css` 的 `@layer components` 中定义 `.auth-*` 命名空间样式（优先级高于 `@layer utilities`，可覆盖 Tailwind 默认类）
- **Card 组件**：LoginForm/RegisterForm 中的 `<Card>` 系列组件替换为原生 `<div>`，彻底避免 CSS 优先级冲突

---

## 文件改动列表

### 新建文件

| 文件 | 说明 |
|------|------|
| `frontend/src/app/(auth)/layout.tsx` | Auth 路由组 layout，Server Component，挂载粒子背景 |
| `frontend/src/components/auth/ParticleCanvas.tsx` | 粒子动画 Client Component |

### 修改文件

| 文件 | 改动说明 |
|------|------|
| `frontend/src/app/globals.css` | 新增 CSS 变量、`@keyframes`、全部 `.auth-*` 样式类 |
| `frontend/src/app/(auth)/login/page.tsx` | 移除外层容器 div（由 layout 提供），简化为直接渲染 `<LoginForm />` |
| `frontend/src/app/(auth)/register/page.tsx` | 同上 |
| `frontend/src/components/auth/LoginForm.tsx` | 替换 Card 系列为 div + auth-* class；更新 Input/Button/Link className；插入 Logo |
| `frontend/src/components/auth/RegisterForm.tsx` | 同 LoginForm |

---

## 关键技术细节

### 1. 粒子系统（ParticleCanvas.tsx）

**Particle 数据结构：**
```
{ x, y, baseY, vx, vy, radius(1-3), opacity(0.3-0.8), phase, amplitude(10-40), frequency(0.0005-0.002), speed }
```

**海浪运动（时间驱动，单位 ms）：**
```
y = baseY
  + sin(t × frequency + phase) × amplitude           // 主波
  + sin(t × frequency × 1.7 + phase × 0.5) × (amplitude × 0.3)  // 叠加副波
x += speed  →  越界后从对侧回绕
```

**连线逻辑：** 桌面阈值 120px / 移动端 80px，用距离平方提前剪枝，alpha = `(1 - dist/threshold) × 0.4`

**粒子数量：** `width ≤ 768 ? 60 : 150`，resize 时 debounce 150ms 后动态增减

**prefers-reduced-motion：** 检测到时 RAF 停止，绘制静止粒子点（样式保留，动效停止）

### 2. CSS 变量（作用域 `.auth-layout`）

```css
--auth-bg: #0a0a0f
--auth-cyan: #00ffcc
--auth-blue: #0066ff
--auth-glass-bg: rgba(255,255,255,0.05)         /* glassmorphism */
--auth-glass-bg-fallback: #111827               /* backdrop-filter 不支持时兜底 */
--auth-glass-border: rgba(0,255,204,0.2)
--auth-cyan-glow: rgba(0,255,204,0.4)
```

### 3. 关键 CSS 类

| 类名 | 用途 |
|------|------|
| `.auth-layout` | 全屏深黑背景容器，flex 居中 |
| `.auth-canvas` | `position:fixed; z-index:0; pointer-events:none` |
| `.auth-content` | 表单居中层，`z-index:1; max-width:448px` |
| `.auth-card` | glassmorphism 容器，`backdrop-blur(16px)` + 发光边框，`animation: auth-fade-in-up 0.5s` |
| `.auth-input` | 深色半透明输入框，focus 时青色发光 `box-shadow` |
| `.auth-btn-submit` | 青→蓝渐变按钮，hover 时 `box-shadow` 扩散发光 |
| `.auth-logo` | 等宽字体品牌标识，青色文字发光 |
| `.auth-link` | 青色链接，hover 时文字发光 |
| `.auth-error` | 红色半透明错误提示 |

### 4. backdrop-filter 兜底

```css
@supports not (backdrop-filter: blur(1px)) {
  .auth-card { background: var(--auth-glass-bg-fallback); }
}
```

### 5. prefers-reduced-motion 覆盖

```css
@media (prefers-reduced-motion: reduce) {
  .auth-card { animation: none; }
  .auth-btn-submit { transition: none; }
}
```

---

## 实现顺序

```
Step 1: globals.css          ← 定义所有 .auth-* class（其他步骤依赖）
Step 2: ParticleCanvas.tsx   ← 独立 Client Component
Step 3: (auth)/layout.tsx    ← 依赖 Step 2
Step 4: login/page.tsx       ← 简化容器
        register/page.tsx    ← 简化容器（与 Step 4 并行）
Step 5: LoginForm.tsx        ← 替换 className（与 RegisterForm.tsx 并行）
        RegisterForm.tsx
```

---

## 验证方式

1. `npm run dev:frontend` 启动前端（端口 3000）
2. 访问 `http://localhost:3000/login`，确认：
   - 全屏粒子动画正常运行（海浪起伏）
   - 表单容器呈磨砂玻璃质感，可透出粒子背景
   - 输入框 focus 时青色发光
   - 提交按钮 hover 时发光扩散
3. 点击「立即注册」跳转 `/register`，确认粒子背景不闪烁/重建
4. 缩小浏览器至 375px 宽，确认无横向滚动
5. 完整走通登录流程（成功登录 → 跳转 /dashboard），确认功能无回归
6. DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce，确认动画停止但样式保留
