# 仪表盘设计规范 v2.0 - 科技数据可视化

## 📋 设计愿景

**主题**：暗黑科技风格的多维度数据可视化平台
**核心体验**：每个数据卡片都是一个交互式的信息密集体，融合玻璃态设计、动画过渡和多样的图表类型，创造沉浸式的仪表盘体验。

**美学方向**：
- 🌌 **深邃暗黑底座** —— 背景采用多层次的渐变网格，营造无限深度感
- ⚡ **高能量色彩系统** —— 主色 Cyan (#00ffcc) + 5 种数据色（蓝、绿、红、黄、紫），高饱和度、高对比度
- 💎 **玻璃态分层** —— 多个透明度层级，创造景深和浮动感
- 🎬 **流畅动画驱动** —— 图表加载、数值递增、卡片悬停，所有交互都有精心设计的过渡
- 📊 **图表中心设计** —— 丰富的图表类型，每种都针对特定的数据模式优化

---

## 🎨 完整色彩系统

### 主色板

```css
/* 背景层级 */
--bg-0: #0a0a0f;           /* 最深背景 */
--bg-1: #141420;           /* 卡片背景层 */
--bg-2: #1a1a25;           /* 悬停层 */

/* 主品牌色（Cyan） */
--primary: #00ffcc;        /* Cyan 实心 */
--primary-50: rgba(0, 255, 204, 0.05);
--primary-dim: rgba(0, 255, 204, 0.12);
--primary-glow: rgba(0, 255, 204, 0.25);
--primary-bright: rgba(0, 255, 204, 0.4);

/* 数据色板（5 种对应 5 张卡片） */
--data-cyan: #00ffcc;      /* 卡片1: 总数 */
--data-blue: #60a5fa;      /* 卡片2: 已执行 */
--data-green: #22c55e;     /* 卡片3: 通过率 */
--data-red: #ef4444;       /* 卡片4: 失败 */
--data-yellow: #eab308;    /* 卡片5: 待执行 */
--data-purple: #a855f7;    /* 额外：用于强调或第6张卡片 */

/* 辅助色 */
--text-primary: #ffffff;
--text-secondary: #b4b4b8;
--text-tertiary: #71717a;
--border-light: rgba(255, 255, 255, 0.08);
--border-primary: rgba(0, 255, 204, 0.15);

/* 状态色 */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### 渐变预设

```css
/* 卡片背景渐变 */
--gradient-card: linear-gradient(
  135deg,
  rgba(0, 255, 204, 0.08) 0%,
  rgba(0, 0, 0, 0) 100%
);

/* 悬停发光渐变 */
--gradient-hover: linear-gradient(
  90deg,
  var(--card-glow-color, rgba(0, 255, 204, 0.15)) 0%,
  transparent 100%
);

/* 页面背景渐变网格 */
--gradient-grid-bg:
  linear-gradient(90deg, rgba(0, 255, 204, 0.03) 1px, transparent 1px),
  linear-gradient(rgba(0, 255, 204, 0.03) 1px, transparent 1px);
```

---

## 📊 图表类型系统

### 1️⃣ **Sparkline**（迷你折线图）
- **用途**：显示短期趋势（7-30 天数据）
- **特点**：紧凑、高效、快速扫一眼
- **应用**：已执行、待执行、失败等趋势卡片
- **动画**：
  - 页面加载：SVG stroke 从 0% 到 100%（animation-duration: 1.2s）
  - 数据更新：polyline 点颜色渐变变化（缓慢过渡 0.6s）

```tsx
// 实现特性
- points: [12, 18, 15, 22, 19, 25, 21]
- 自动归一化 [0, height]
- 填充色块：`<polygon>` 采用 0.15 alpha 的数据色
- 虚线背景网格：thin stroke 衬托
- 数据点标记：小圆点，悬停显示数值 tooltip
```

### 2️⃣ **Donut（甜甜圈环形进度）**
- **用途**：显示百分比（完成率、通过率等）
- **特点**：一目了然、中心显示数值
- **应用**：通过率卡片（78%）
- **动画**：
  - 初始加载：从 0% 扫至目标 percentage（1.5s easeOut）
  - 悬停：内圈半径微扩大、外圈发光加强

```tsx
// 实现特性
- 双层圆：外圈背景（15% alpha），内圈进度色
- stroke-dasharray 方案实现百分比
- 中心大字显示百分比 + 小字显示标签
- 颜色动态绑定：data.colorClass 自动映射
```

### 3️⃣ **Bar Chart**（竖向柱状图）
- **用途**：显示多个类别对比（5 项以上）
- **特点**：易于比较大小关系、支持排序
- **应用**：可扩展性强，用于自定义仪表盘或报告
- **动画**：
  - 初始加载：柱子从底部逐根上升（stagger delay: 50ms）
  - 悬停：柱子高度微增加 5%、发光加强

```tsx
// 实现特性
- 最多 8 根柱子（防止过度拥挤）
- Y 轴参考线（lighter stroke）
- 顶部数值标签
- 不同颜色映射不同类别
```

### 4️⃣ **Pie Chart**（饼图）
- **用途**：显示占比分布（4-6 个切片）
- **特点**：直观展示整体构成
- **应用**：测试用例分布（通过/失败/待执行）
- **动画**：
  - 加载：扇形从中心逆时针扫出（delay 递增）
  - 悬停：对应扇形突出扩展、显示数值 tooltip

```tsx
// 实现特性
- SVG path arc 计算
- Legend 在饼图右侧，可交互（点击高亮对应扇形）
- 中心可选内文字（总计数）
- 颜色精心设计，相邻扇形对比明显
```

### 5️⃣ **Area Chart**（面积图）
- **用途**：显示时间序列多条线（2-3 条）
- **特点**：展现趋势和关键点变化
- **应用**：对标多维度指标对比
- **动画**：
  - 加载：面积从底部上升填充（1.2s）
  - 交互：悬停十字线显示日期和数值

```tsx
// 实现特性
- 多条线叠加（Stacked 或 Multi-line 两种模式可选）
- 背景网格（X: 日期，Y: 数值）
- 数据点标记（小圆点，可点击）
```

### 6️⃣ **Metric Gauge**（仪表盘）
- **用途**：显示单一关键指标在某个范围内的位置
- **特点**：酷炫、引人注目
- **应用**：系统健康度、性能评分
- **动画**：
  - 加载：指针从 0 旋转到目标值（1.5s easeOut）
  - 实时更新：指针平滑过渡

```tsx
// 实现特性
- SVG arc + 旋转指针（transform: rotate）
- 三段区间着色（低/中/高）
- 中心大数字显示当前值
```

---

## 💎 卡片设计升级

### StatCard 结构升级

```
┌────────────────────────────────────────┐
│ [渐变背景网格]                          │  ← 新增：背景网格图案
│  ┌──────────────────────────────────┐  │
│  │ [Icon] [Label] [Trend Icon▲]     │  │  ← 优化：增加趋势指示器
│  │  ─────────────────────────────   │  │  ← 新增：分割线
│  │                                   │  │
│  │  [大数值 + 单位]                  │  │  ← 优化：字号阶层更明确
│  │  [环比/同比数据] ▲ +12.5%        │  │  ← 新增：对标数据
│  │                                   │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │    [图表]                   │  │  │  ← 图表类型可切换
│  │  │                             │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  [图表说明文字]                    │  │  ← 新增：上下文帮助
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### 样式详解

```css
.dashboard-stat-card {
  /* 背景网格纹理 */
  background:
    var(--gradient-grid-bg),
    linear-gradient(135deg, rgba(0, 255, 204, 0.08) 0%, rgba(0, 0, 0, 0) 100%),
    #0a0a0f;
  background-size:
    20px 20px,
    100% 100%,
    100% 100%;
  background-attachment: fixed;

  /* 多层玻璃态 */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;

  /* 初始阴影（淡） */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 20px rgba(0, 0, 0, 0.3);

  /* 过渡 */
  transition:
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dashboard-stat-card:hover {
  /* 悬停发光 */
  border-color: var(--card-glow-color, rgba(0, 255, 204, 0.5));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 0 30px var(--card-glow-color, rgba(0, 255, 204, 0.25)),
    0 0 60px rgba(0, 0, 0, 0.2);

  /* 微缩放 */
  transform: translateY(-4px) scale(1.02);
}

.dashboard-stat-card::before {
  /* 底部光线渐变 */
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--card-glow-color, rgba(0, 255, 204, 0.2)),
    transparent
  );
  pointer-events: none;
}
```

### 卡片内容区域

```css
/* 标题区 */
.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 16px;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat-trend.positive { color: var(--data-green); }
.stat-trend.negative { color: var(--data-red); }

/* 数值区 */
.stat-value {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(
    135deg,
    var(--card-glow-color, rgba(0, 255, 204, 1)) 0%,
    var(--card-glow-color, rgba(0, 255, 204, 0.8)) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}

.stat-unit {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 4px;
}

.stat-subtitle {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: 16px;
}

/* 图表容器 */
.stat-chart-container {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  position: relative;
  overflow: hidden;
}

.stat-chart-container::before {
  /* 右上角装饰光 */
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, var(--card-glow-color, rgba(0, 255, 204, 0.1)), transparent);
  pointer-events: none;
}

.stat-chart {
  position: relative;
  z-index: 1;
}

/* 图表说明 */
.stat-footer {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 8px;
  text-align: center;
}
```

---

## 🎬 动画系统

### 核心动画库

```css
/* 1. 图表加载动画 */
@keyframes chart-load {
  from {
    opacity: 0;
    stroke-dashoffset: 1000;
  }
  to {
    opacity: 1;
    stroke-dashoffset: 0;
  }
}

/* 2. 数值递增动画 */
@keyframes number-increment {
  0% { transform: translateY(10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* 3. 卡片进入 */
@keyframes card-enter {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 4. 发光脉冲 */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px var(--card-glow-color);
  }
  50% {
    box-shadow: 0 0 40px var(--card-glow-color);
  }
}

/* 5. 加载旋转 */
@keyframes spinner {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 6. 闪烁强调 */
@keyframes highlight-flash {
  0%, 100% { filter: drop-shadow(0 0 2px var(--card-glow-color)); }
  50% { filter: drop-shadow(0 0 10px var(--card-glow-color)); }
}
```

### 动画应用规则

```css
/* 页面初始加载：卡片错落进入 */
.dashboard-stat-card {
  animation: card-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-fill-mode: both;
}

/* nth-child 延迟 */
.dashboard-stat-card:nth-child(1) { animation-delay: 0.1s; }
.dashboard-stat-card:nth-child(2) { animation-delay: 0.2s; }
.dashboard-stat-card:nth-child(3) { animation-delay: 0.3s; }
.dashboard-stat-card:nth-child(4) { animation-delay: 0.4s; }
.dashboard-stat-card:nth-child(5) { animation-delay: 0.5s; }

/* 图表 SVG stroke 动画 */
svg polyline, svg path {
  stroke-dasharray: 1000;
  animation: chart-load 1.2s ease-out forwards;
}

/* 悬停时脉冲 */
.dashboard-stat-card:hover .stat-value {
  animation: highlight-flash 0.6s ease-in-out;
}

/* 数值更新动画 */
.stat-value.updating {
  animation: number-increment 0.5s ease-out;
}

/* 刷新按钮加载状态 */
.btn-refresh.loading {
  animation: spinner 1s linear infinite;
}
```

---

## 🎯 Sidebar 和导航增强

### Sidebar 样式

```css
.dashboard-sidebar {
  width: 240px;
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;

  /* 背景网格纹理 */
  background-image:
    linear-gradient(90deg, rgba(0, 255, 204, 0.03) 1px, transparent 1px);
  background-size: 20px 100%;

  box-shadow: inset -1px 0 0 var(--border-primary);
}

/* 菜单项 */
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* 菜单项背景动画 */
.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 2px;
  height: 0;
  background: linear-gradient(180deg, var(--primary), transparent);
  transition: height 0.3s ease-out;
}

.nav-item:hover {
  background: linear-gradient(90deg, rgba(0, 255, 204, 0.08), transparent);
  color: var(--primary);
}

.nav-item:hover::before {
  height: 100%;
}

/* 活跃菜单项 */
.nav-item.active {
  background: linear-gradient(90deg, rgba(0, 255, 204, 0.15), transparent);
  border-left: 2px solid var(--primary);
  color: var(--primary);
  font-weight: 500;
  text-shadow: 0 0 8px rgba(0, 255, 204, 0.3);
  padding-left: 14px;
}

/* 活跃指示器 */
.nav-item.active::after {
  content: '';
  position: absolute;
  right: 12px;
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--primary);
  animation: pulse-glow 1.5s ease-in-out infinite;
}

/* 菜单图标 */
.nav-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.nav-item:hover .nav-icon {
  transform: scale(1.1) rotate(-5deg);
}

.nav-item.active .nav-icon {
  filter: drop-shadow(0 0 4px var(--primary));
}
```

---

## 📐 响应式设计断点

```css
/* Mobile: < 640px */
@media (max-width: 639px) {
  .dashboard-sidebar {
    width: 200px;
    position: fixed;
    left: 0;
    z-index: 100;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .dashboard-sidebar.open {
    transform: translateX(0);
  }

  .stat-card-grid {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 24px;
  }
}

/* Tablet: 640px - 1024px */
@media (min-width: 640px) and (max-width: 1023px) {
  .stat-card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: > 1024px */
@media (min-width: 1024px) {
  .stat-card-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}
```

---

## 🔧 TypeScript 接口扩展

```typescript
// types/dashboard.ts 扩展

export type ChartType =
  | 'sparkline'      // 迷你折线
  | 'donut'          // 甜甜圈进度
  | 'bar'            // 竖向柱状
  | 'pie'            // 饼图
  | 'area'           // 面积图
  | 'gauge';         // 仪表盘

export interface ChartConfig {
  type: ChartType;
  data: number[];
  labels?: string[];          // 类别标签
  percentage?: number;        // donut 和 gauge 专用
  animated?: boolean;         // 默认 true
  animationDuration?: number; // ms，默认 1200
  interactive?: boolean;      // 支持交互提示
}

export interface StatCardData {
  id: string;
  label: string;
  value: number | string;
  unit?: string;              // 单位，如 "%", "个", "次"
  trend?: {                   // 新增：趋势数据
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;          // 副标题或说明
  icon: ComponentType<{ className?: string }>;
  colorClass: string;
  glowColor: string;
  chart: ChartConfig;
  footerText?: string;        // 图表下方说明
  onClick?: () => void;       // 点击卡片回调
}

export interface DashboardStats {
  total: number;
  executed: number;
  passRate: number;
  failed: number;
  pending: number;
  trend: number[];
  lastUpdated?: Date;         // 上次更新时间
}
```

---

## 💻 实现建议

### 分阶段开发

**Phase 1: 基础美化（当前）**
- ✅ 升级 StatCard 玻璃态和渐变
- ✅ 实现 Sparkline 加载动画
- ✅ 增强 Donut 交互和发光
- ✅ 优化 Sidebar 样式和活跃态

**Phase 2: 图表多样化（1-2 周）**
- 🔧 实现 BarChart 组件（纯 SVG）
- 🔧 实现 PieChart 组件（带 Legend 和交互）
- 🔧 实现 AreaChart 组件（多线支持）

**Phase 3: 高级交互（可选）**
- 📊 图表类型切换按钮
- 📊 时间范围选择器
- 📊 数据导出功能
- 📊 自定义仪表盘（拖拽排序）

### 核心代码结构

```
frontend/src/
├── components/dashboard/
│   ├── StatCard.tsx              ← 升级
│   ├── MiniChart.tsx             ← 升级（所有图表类型）
│   ├── Sidebar.tsx               ← 升级（样式和动画）
│   ├── charts/                   ← 新增目录
│   │   ├── BarChart.tsx
│   │   ├── PieChart.tsx
│   │   └── AreaChart.tsx
│   └── DashboardHeader.tsx        ← 新增（欢迎语 + 刷新）
├── types/dashboard.ts            ← 扩展接口
├── lib/dashboard.ts              ← 扩展 mock 数据
└── app/globals.css               ← 新增动画系统
```

### 关键文件变更示意

**MiniChart.tsx 结构升级：**
```tsx
import { useEffect, useState } from 'react';

interface MiniChartProps {
  type: ChartType;
  data: number[];
  labels?: string[];
  percentage?: number;
  color: string;
  animated?: boolean;
  interactive?: boolean;
  // ... 其他 props
}

export function MiniChart({ type, data, animated = true, ...props }: MiniChartProps) {
  const [isLoading, setIsLoading] = useState(animated);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsLoading(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [animated]);

  // 根据 type 返回对应图表组件
  switch (type) {
    case 'sparkline':
      return <SparklineChart {...props} data={data} loading={isLoading} />;
    case 'donut':
      return <DonutChart {...props} percentage={percentage} loading={isLoading} />;
    case 'bar':
      return <BarChart {...props} data={data} labels={labels} loading={isLoading} />;
    case 'pie':
      return <PieChart {...props} data={data} labels={labels} loading={isLoading} />;
    case 'area':
      return <AreaChart {...props} data={data} loading={isLoading} />;
    case 'gauge':
      return <GaugeChart {...props} percentage={percentage} loading={isLoading} />;
    default:
      return null;
  }
}
```

---

## ✨ 设计亮点总结

| 维度 | 亮点 | 效果 |
|------|------|------|
| **颜色** | 5 色数据色板 + 渐变映射 | 信息层级清晰，视觉冲击强 |
| **卡片** | 多层玻璃态 + 网格背景 + 发光边框 | 深度感和浮动感 |
| **动画** | 错落进入 + 图表加载 + 数值递增 | 流畅、高级、富有生命力 |
| **图表** | 6 种类型，每种都有独特的交互 | 灵活适配不同数据模式 |
| **交互** | 悬停缩放、活跃指示器脉冲、图表 tooltip | 细节精致，反馈及时 |
| **响应式** | Sidebar 折叠、卡片 1-3 列自适应 | 全设备体验优秀 |

---

## 🎓 参考资源

- **图表库选项**（可选）：
  - [Recharts](https://recharts.org/) - React 图表库，丰富动画
  - [Victory](https://formidable.com/open-source/victory/) - 高定制化
  - 纯 SVG（当前方案）- 最轻量、最可控

- **动画参考**：
  - Cubic Bezier: `cubic-bezier(0.34, 1.56, 0.64, 1)` — Bounce
  - Cubic Bezier: `cubic-bezier(0.43, 0.13, 0.23, 0.96)` — Smooth

- **工具**：
  - Figma 调色板生成：https://coolors.co/
  - SVG 动画预览：https://www.svgator.com/

---

## 📝 实现检查清单

- [ ] 升级 StatCard 背景为网格渐变
- [ ] 优化所有卡片的悬停动画（4px translateY）
- [ ] 实现图表加载动画（stroke-dasharray）
- [ ] 为所有卡片添加 animation-delay 实现错落进入
- [ ] Sidebar 菜单项增加左侧竖线动画
- [ ] 活跃菜单项添加右侧脉冲圆点
- [ ] 刷新按钮添加加载旋转动画
- [ ] 验证所有颜色变量已应用
- [ ] 测试响应式布局（Mobile/Tablet/Desktop）
- [ ] 性能检查：动画帧率 > 60fps

