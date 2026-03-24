# 暗黑极客风登录/注册页改造

## Context

当前登录/注册页是默认的浅色 shadcn/ui 风格，视觉上缺乏科技感。需要改造为「暗黑极客风」：深色背景 + 海浪动态背景 + 发光边框 + 网格装饰，仅修改 `(auth)` 路由组下的页面和对应表单组件。

---

## 实现方案

### 1. 新建波浪背景组件
**文件**：`frontend/src/components/auth/WaveBackground.tsx`（新建）

- Client Component，使用 `<canvas>` + `requestAnimationFrame` 绘制 3 层正弦波浪
- 波浪颜色：`rgba(0, 245, 255, 0.15)`（cyan）+ `rgba(168, 85, 247, 0.1)`（purple）
- 每层波浪参数（频率、振幅、速度）不同，营造海浪叠加感
- canvas 撑满全屏（`position: fixed, inset: 0`），z-index 为 0
- 组件挂载后启动动画，卸载时清除

```tsx
// 伪代码结构
const waves = [
  { amplitude: 40, frequency: 0.008, speed: 0.03, color: 'rgba(0,245,255,0.12)' },
  { amplitude: 25, frequency: 0.012, speed: 0.05, color: 'rgba(168,85,247,0.08)' },
  { amplitude: 55, frequency: 0.005, speed: 0.02, color: 'rgba(0,245,255,0.06)' },
]
// 每帧：offset += speed → drawSineWave → requestAnimationFrame
```

### 2. 修改页面容器
**文件**：`frontend/src/app/(auth)/login/page.tsx`
**文件**：`frontend/src/app/(auth)/register/page.tsx`

- 背景色改为 `#0a0e1a`（深海蓝黑）
- 叠加 `WaveBackground` 作为底层动画
- 叠加半透明网格（CSS `background-image` 实现，z-index 1）
- 表单容器 z-index 2，居中显示

```tsx
<div className="relative min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 overflow-hidden">
  <WaveBackground />
  {/* 网格叠层 */}
  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] z-[1]" />
  <div className="relative z-[2]">
    <LoginForm />
  </div>
</div>
```

### 3. 改造 LoginForm / RegisterForm
**文件**：`frontend/src/components/auth/LoginForm.tsx`
**文件**：`frontend/src/components/auth/RegisterForm.tsx`

**卡片容器**（替代原 `<Card>`，直接用 div）：
- 背景：`rgba(10, 14, 26, 0.85)` + `backdrop-filter: blur(12px)`
- 边框：`border: 1px solid rgba(0,245,255,0.3)`
- 发光：`box-shadow: 0 0 30px rgba(0,245,255,0.1), inset 0 0 30px rgba(0,245,255,0.05)`
- 圆角：`rounded-xl`

**顶部品牌区**：
- 显示「⬡ AI TESTCASE」标题，颜色 `#00f5ff`
- 副标题为灰色小字

**输入框**（`className` 覆盖 Input 组件的样式）：
- 背景：`rgba(0,245,255,0.05)`
- 边框：`border-[rgba(0,245,255,0.2)]`
- 聚焦：`focus:border-[#00f5ff] focus:shadow-[0_0_10px_rgba(0,245,255,0.3)]`
- 文字：`text-white placeholder:text-gray-500`
- Label：颜色 `text-[#00f5ff]` + 小大写字体

**按钮**：
- 渐变：`bg-gradient-to-r from-cyan-500 to-purple-600`
- 悬停：`hover:from-cyan-400 hover:to-purple-500`
- 发光：`shadow-[0_0_20px_rgba(0,245,255,0.4)]`
- hover 加强发光

**错误提示**：
- 背景：`rgba(239,68,68,0.1)`，边框：`border border-red-500/30`，文字：`text-red-400`

**链接**：颜色改为 `#00f5ff`

---

## 关键文件

| 文件 | 改动类型 |
|------|---------|
| `frontend/src/components/auth/WaveBackground.tsx` | **新建** |
| `frontend/src/app/(auth)/login/page.tsx` | 修改背景 + 引入 WaveBackground + 网格层 |
| `frontend/src/app/(auth)/register/page.tsx` | 同上 |
| `frontend/src/components/auth/LoginForm.tsx` | 替换 Card 为暗黑样式，修改所有颜色 |
| `frontend/src/components/auth/RegisterForm.tsx` | 同上 |

不修改 `globals.css` 和 `components/ui/` 目录（避免影响其他页面）。

---

## 验证方案

```bash
npm run dev:frontend
# 访问 http://localhost:3000/login
# 访问 http://localhost:3000/register
```

验证项：
1. 页面背景为深海蓝黑色，有海浪动画流动
2. 背景可见 cyan 色网格线
3. 表单卡片有半透明毛玻璃 + 发光边框效果
4. 输入框聚焦时有 cyan 发光描边
5. 登录按钮有 cyan→purple 渐变 + 发光
6. 功能正常：登录/注册逻辑不受影响
