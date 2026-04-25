# 计划：登录后欢迎仪表盘

## Context

当前 `dashboard/page.tsx` 只是一个占位卡片，`dashboard/layout.tsx` 只有鉴权守卫。
需要将其改造为带左侧导航菜单的完整仪表盘，右侧展示 5 张带静态数据的 StatCard 和迷你图表，
整体风格延续登录页的暗黑极客风（`#0a0a0f` 背景 + `#00ffcc` Cyan 主色），请使用/frontend-design这个skill进行前端页面设计。

---

## 文件变更清单

### 新建（7 个）

| 文件 | 职责 |
|------|------|
| `frontend/src/types/dashboard.ts` | MenuItem / StatCardData / DashboardStats 接口 |
| `frontend/src/lib/dashboard.ts` | MOCK 数据 + `getDashboardStats()` API stub |
| `frontend/src/components/dashboard/Sidebar.tsx` | 左侧导航，基于 `usePathname` 高亮，按 role 过滤菜单 |
| `frontend/src/components/dashboard/StatCard.tsx` | 统计卡片：图标 + 数值 + MiniChart |
| `frontend/src/components/dashboard/MiniChart.tsx` | 纯 SVG 迷你图：折线（sparkline）/ 环形（donut） |
| `frontend/src/app/dashboard/test-cases/page.tsx` | 占位页（功能待开发提示） |
| `frontend/src/app/dashboard/executions/page.tsx` | 占位页 |
| `frontend/src/app/dashboard/reports/page.tsx` | 占位页 |
| `frontend/src/app/dashboard/settings/page.tsx` | 占位页 |

### 修改（2 个）

| 文件 | 改动 |
|------|------|
| `frontend/src/app/dashboard/layout.tsx` | 保留鉴权守卫 + 加二栏布局（Sidebar + main） |
| `frontend/src/app/dashboard/page.tsx` | 替换为欢迎语 + 5 张 StatCard + 刷新按钮 |
| `frontend/src/app/globals.css` | 末尾追加 `.dashboard-*` 侧边栏和卡片样式 |

---

## 路由结构

App Router 嵌套路由，`layout.tsx` 渲染壳（Sidebar + children），子路由只渲染右侧内容：

```
/dashboard              → page.tsx（默认活跃）
/dashboard/test-cases   → 占位页
/dashboard/executions   → 占位页
/dashboard/reports      → 占位页
/dashboard/settings     → 占位页
```

菜单活跃状态：`usePathname()` 与 `item.href` 精确匹配，无需额外 state。

---

## 详细实现

### 1. `types/dashboard.ts`

```ts
import type { ComponentType } from 'react';

export type UserRole = 'USER' | 'ADMIN';

export interface MenuItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  requiredRole?: UserRole;    // 缺省则所有角色可见
}

export type ChartType = 'sparkline' | 'donut';

export interface StatCardData {
  id: string;
  label: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  colorClass: string;         // e.g. 'text-cyan-400'
  glowColor: string;          // e.g. 'rgba(0,255,204,0.2)'
  chart: {
    type: ChartType;
    data: number[];
    percentage?: number;      // donut 专用
  };
}

export interface DashboardStats {
  total: number;
  executed: number;
  passRate: number;
  failed: number;
  pending: number;
  trend: number[];            // 近 7 天执行趋势
}
```

### 2. `lib/dashboard.ts`

```ts
import type { DashboardStats } from '@/types/dashboard';

export const MOCK_STATS: DashboardStats = {
  total: 150,
  executed: 87,
  passRate: 78,
  failed: 19,
  pending: 63,
  trend: [12, 18, 15, 22, 19, 25, 21],
};

// API stub：后续替换为真实请求
// return (await api.get<ApiResponse<DashboardStats>>('/api/stats/dashboard')).data.data
export async function getDashboardStats(): Promise<DashboardStats> {
  return Promise.resolve(MOCK_STATS);
}
```

### 3. `components/dashboard/MiniChart.tsx`

纯 SVG，无任何外部依赖：

- **sparkline**：`<polyline points={...}>` + `<polygon>` 填充色块，数据点归一化到 `[0, height]`
- **donut**：两层 `<circle>`，进度弧用 `stroke-dasharray / stroke-dashoffset` 实现

```tsx
// sparkline 核心计算
const max = Math.max(...data), min = Math.min(...data);
const range = max - min || 1;
const points = data.map((v, i) => {
  const x = (i / (data.length - 1)) * width;
  const y = height - ((v - min) / range) * (height - 4);
  return `${x},${y}`;
}).join(' ');

// donut 核心计算
const r = (size / 2) - strokeWidth;
const circumference = 2 * Math.PI * r;
const offset = circumference * (1 - percentage / 100);
```

### 4. `components/dashboard/StatCard.tsx`

Props: `{ data: StatCardData }`

结构：
```
┌─────────────────────────────┐
│ [Icon]          [label]      │
│                              │
│    [大数值]                  │
│                              │
│    [MiniChart]               │
└─────────────────────────────┘
```

样式：`dashboard-stat-card` 类（玻璃态背景 + 颜色发光边框），
通过内联 `style={{ '--card-glow-color': data.glowColor }}` 注入颜色变量。

### 5. `components/dashboard/Sidebar.tsx`

```tsx
// Props
interface SidebarProps {
  user: User | null;
  pathname: string;
  onLogout: () => void;
}

// 菜单配置（文件顶部常量）
const MENU_ITEMS: MenuItem[] = [
  { label: '仪表盘',     href: '/dashboard',            icon: LayoutDashboard },
  { label: '测试用例',   href: '/dashboard/test-cases', icon: TestTube2 },
  { label: '测试执行',   href: '/dashboard/executions', icon: Play },
  { label: '报告统计',   href: '/dashboard/reports',    icon: BarChart3 },
  { label: '用户设置',   href: '/dashboard/settings',   icon: Settings },
];

// 权限过滤
const visibleItems = MENU_ITEMS.filter(
  item => !item.requiredRole || item.requiredRole === user?.role
);
```

侧边栏顶部显示系统名称 + 用户信息，底部显示退出登录按钮。
宽度固定 240px，`sticky top-0 h-screen overflow-y-auto`。
使用 `next/link` `<Link>` 实现路由跳转。

### 6. 修改 `dashboard/layout.tsx`

```tsx
'use client';
// 保留现有 useAuthStore + useRouter 鉴权逻辑
// 新增：
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/dashboard/Sidebar';

// 在通过鉴权后渲染：
return (
  <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
    <Sidebar user={user} pathname={pathname} onLogout={logout} />
    <main className="flex-1 overflow-y-auto">
      {children}
    </main>
  </div>
);
```

### 7. 修改 `dashboard/page.tsx`

```tsx
'use client';
// useState(MOCK_STATS) + refreshKey 驱动 getDashboardStats() 重新请求

// 5 张卡片配置（getStatCards(stats) 函数返回 StatCardData[]）
// 颜色分配：总数=cyan, 已执行=blue, 通过率=green, 失败=red, 待执行=yellow

// 顶部区域：欢迎语 + 日期 + 刷新按钮
// 中间区域：grid grid-cols-2 xl:grid-cols-3 gap-6 的卡片网格
```

### 8. `globals.css` 追加

```css
@layer components {
  .dashboard-sidebar {
    background: rgba(10, 10, 15, 0.98);
    border-right: 1px solid rgba(0, 255, 204, 0.15);
    --dash-cyan: #00ffcc;
    --dash-cyan-dim: rgba(0, 255, 204, 0.12);
    --dash-cyan-glow: rgba(0, 255, 204, 0.3);
  }
  .dashboard-nav-active {
    background: linear-gradient(90deg, rgba(0,255,204,0.15) 0%, transparent 100%);
    border-left: 2px solid #00ffcc;
    color: #00ffcc;
  }
  .dashboard-nav-item:hover:not(.dashboard-nav-active) {
    background: rgba(0, 255, 204, 0.05);
  }
  .dashboard-stat-card {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.75rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .dashboard-stat-card:hover {
    border-color: var(--card-glow-color, rgba(0,255,204,0.3));
    box-shadow: 0 0 20px var(--card-glow-color, rgba(0,255,204,0.1));
  }
}
```

---

## 实施顺序

```
1. types/dashboard.ts            ← 类型先行
2. lib/dashboard.ts              ← mock 数据和 stub
3. globals.css 追加样式
4. components/dashboard/MiniChart.tsx
5. components/dashboard/StatCard.tsx
6. components/dashboard/Sidebar.tsx
7. app/dashboard/layout.tsx      ← 改写（二栏布局）
8. app/dashboard/page.tsx        ← 改写（仪表盘内容）
9. 4 个子路由占位页
```

---

## 已有可复用资源

- `lucide-react@^0.323.0` 已安装（`LayoutDashboard`, `TestTube2`, `Play`, `BarChart3`, `Settings`, `CheckCircle2`, `XCircle`, `Clock`, `RefreshCw`）
- `@/hooks/useAuth` — 提供 `user`, `logout`
- `@/store/authStore` — 提供 `isAuthenticated`
- `@/lib/utils` — 提供 `cn()`
- `@/components/ui/button` — 刷新按钮使用 `variant="outline"`
- `globals.css` 中 `.dark` 变量体系（`--background: 222.2 84% 4.9%` 等）

---

## 验证方式

```bash
# 启动前端
npm run dev:frontend

# 验证流程
1. 访问 http://localhost:3000/login 登录
2. 确认跳转至 /dashboard，侧边栏显示 5 个菜单项
3. 点击菜单项，URL 变化，对应项高亮
4. 仪表盘显示欢迎语（用户名）+ 5 张数据卡片（150/87/78%/19/63）
5. 点击刷新按钮，卡片短暂 loading 后重新展示相同数据
6. 未登录直接访问 /dashboard，应重定向至 /login
```
