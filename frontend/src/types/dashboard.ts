import type { ComponentType } from 'react';

export type UserRole = 'USER' | 'ADMIN';

export interface MenuItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  requiredRole?: UserRole;    // 缺省则所有角色可见
}

export type ChartType = 'sparkline' | 'donut' | 'bar' | 'pie' | 'area' | 'gauge';

export interface ChartConfig {
  type: ChartType;
  data: number[];
  labels?: string[];
  percentage?: number;
  animated?: boolean;
  animationDuration?: number;
  interactive?: boolean;
}

export interface TrendData {
  value: number;
  isPositive: boolean;
}

export interface StatCardData {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: TrendData;
  subtitle?: string;
  icon: ComponentType<{ className?: string }>;
  colorClass: string;
  glowColor: string;
  chart: ChartConfig;
  footerText?: string;
  onClick?: () => void;
}

export interface DashboardStats {
  total: number;
  executed: number;
  passRate: number;
  failed: number;
  pending: number;
  trend: number[];            // 近 7 天执行趋势
}
