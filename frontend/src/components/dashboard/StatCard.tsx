import React from 'react';
import { MiniChart } from './MiniChart';
import type { StatCardData } from '@/types/dashboard';

interface StatCardProps {
  data: StatCardData;
}

const colorMap: Record<string, string> = {
  'text-cyan-400': '#00ffcc',
  'text-blue-400': '#60a5fa',
  'text-green-400': '#22c55e',
  'text-red-400': '#ef4444',
  'text-yellow-400': '#eab308',
  'text-purple-400': '#a855f7',
};

export function StatCard({ data }: StatCardProps) {
  const Icon = data.icon;
  const chartColor = colorMap[data.colorClass] || '#00ffcc';
  const chartType = data.chart.type;

  // 根据图表类型确定尺寸
  const getChartDimensions = () => {
    switch (chartType) {
      case 'sparkline':
        return { width: 80, height: 40 };
      case 'donut':
      case 'gauge':
        return { width: 100, height: 100 };
      case 'bar':
        return { width: 100, height: 50 };
      case 'pie':
        return { width: 100, height: 100 };
      case 'area':
        return { width: 100, height: 50 };
      default:
        return { width: 80, height: 40 };
    }
  };

  const chartDims = getChartDimensions();

  return (
    <div
      className="dashboard-stat-card p-6"
      style={{ '--card-glow-color': data.glowColor } as React.CSSProperties}
      onClick={data.onClick}
    >
      {/* 顶部：图标 + 标签 + 趋势 */}
      <div className="stat-header">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 ${data.colorClass}`}>
            <Icon className={data.colorClass} />
          </div>
          <span className="stat-label">{data.label}</span>
        </div>
        {data.trend && (
          <span className={`stat-trend ${data.trend.isPositive ? 'positive' : 'negative'}`}>
            {data.trend.isPositive ? '▲' : '▼'} {Math.abs(data.trend.value)}%
          </span>
        )}
      </div>

      {/* 中部：大数值 + 副标题 */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="stat-value">{data.value}</span>
          {data.unit && <span className="stat-unit">{data.unit}</span>}
        </div>
        {data.subtitle && <div className="stat-subtitle">{data.subtitle}</div>}
      </div>

      {/* 图表区域 */}
      <div className="stat-chart-container flex justify-center items-center min-h-[50px]">
        <div className="stat-chart">
          <MiniChart
            type={chartType}
            data={data.chart.data}
            labels={data.chart.labels}
            percentage={data.chart.percentage}
            color={chartColor}
            width={chartDims.width}
            height={chartDims.height}
            animated={data.chart.animated !== false}
          />
        </div>
      </div>

      {/* 底部说明文字 */}
      {data.footerText && <div className="stat-footer">{data.footerText}</div>}
    </div>
  );
}
