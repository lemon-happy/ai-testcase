import React, { useEffect, useState } from 'react';

interface MiniChartProps {
  type: 'sparkline' | 'donut' | 'bar' | 'pie' | 'area' | 'gauge';
  data: number[];
  labels?: string[];
  percentage?: number;
  color: string;
  width?: number;
  height?: number;
  animated?: boolean;
}

export function MiniChart({
  type,
  data,
  labels,
  percentage = 0,
  color,
  width = 80,
  height = 40,
  animated = true,
}: MiniChartProps) {
  const [isLoading, setIsLoading] = useState(animated);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsLoading(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [animated]);

  switch (type) {
    case 'sparkline':
      return (
        <SparklineChart
          data={data}
          color={color}
          width={width}
          height={height}
          loading={isLoading}
        />
      );
    case 'donut':
      return (
        <DonutChart
          percentage={percentage}
          color={color}
          size={48}
          strokeWidth={3}
          loading={isLoading}
        />
      );
    case 'bar':
      return (
        <BarChart
          data={data}
          color={color}
          width={width}
          height={height}
          loading={isLoading}
        />
      );
    case 'pie':
      return (
        <PieChart
          data={data}
          labels={labels}
          color={color}
          size={80}
          loading={isLoading}
        />
      );
    case 'area':
      return (
        <AreaChart
          data={data}
          color={color}
          width={width}
          height={height}
          loading={isLoading}
        />
      );
    case 'gauge':
      return (
        <GaugeChart
          percentage={percentage}
          color={color}
          size={80}
          loading={isLoading}
        />
      );
    default:
      return null;
  }
}

// Sparkline 折线图
function SparklineChart({
  data,
  color,
  width,
  height,
  loading,
}: {
  data: number[];
  color: string;
  width: number;
  height: number;
  loading: boolean;
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4);
      return `${x},${y}`;
    })
    .join(' ');

  const polygonPoints =
    points +
    ` ${width},${height} 0,${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        strokeDasharray: 1000,
        animation: loading ? `chart-load 1.2s ease-out forwards` : 'none',
      }}
    >
      <defs>
        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* 填充区域 */}
      <polygon
        points={polygonPoints}
        fill={`url(#grad-${color})`}
      />
      {/* 折线 */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 数据点 */}
      {data.map((_, i) => {
        const x = (i / (data.length - 1)) * width;
        const value = data[i];
        const y = height - ((value - min) / range) * (height - 4);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill={color}
            opacity="0.8"
          />
        );
      })}
    </svg>
  );
}

// Donut 环形图
function DonutChart({
  percentage,
  color,
  size,
  strokeWidth,
  loading,
}: {
  percentage: number;
  color: string;
  size: number;
  strokeWidth: number;
  loading: boolean;
}) {
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const displayPercentage = Math.min(percentage, 100);
  const offset = circumference * (1 - displayPercentage / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* 灰色背景圆 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      {/* 彩色进度圆 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={loading ? circumference : offset}
        strokeLinecap="round"
        style={{
          animation: loading ? `donut-load 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards` : 'none',
          transformOrigin: '50% 50%',
        }}
      />
      {/* 中心百分比文字 */}
      <text
        x={size / 2}
        y={size / 2 + 1}
        textAnchor="middle"
        dy="0.3em"
        fontSize="11"
        fontWeight="700"
        fill={color}
        style={{
          transform: 'rotate(90deg)',
          transformOrigin: `${size / 2}px ${size / 2}px`,
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      >
        {Math.round(displayPercentage)}%
      </text>
    </svg>
  );
}

// Bar 柱状图
function BarChart({
  data,
  color,
  width,
  height,
  loading,
}: {
  data: number[];
  color: string;
  width: number;
  height: number;
  loading: boolean;
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const barWidth = width / Math.max(data.length, 3);
  const padding = barWidth * 0.2;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* 背景网格线 */}
      <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      {/* 柱子 */}
      {data.map((value, i) => {
        const x = i * barWidth + padding / 2;
        const barHeight = (value / max) * (height - 8);
        const y = height - barHeight - 4;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth - padding}
            height={barHeight}
            fill="url(#bar-gradient)"
            rx="2"
            style={{
              animation: loading ? `bar-load 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards` : 'none',
              animationDelay: `${i * 50}ms`,
            }}
          />
        );
      })}
    </svg>
  );
}

// Pie 饼图
function PieChart({
  data,
  labels = [],
  color,
  size,
  loading,
}: {
  data: number[];
  labels?: string[];
  color: string;
  size: number;
  loading: boolean;
}) {
  if (data.length === 0) return null;

  const total = data.reduce((a, b) => a + b, 0);
  const colors = [
    color,
    adjustColorBrightness(color, -20),
    adjustColorBrightness(color, -40),
    adjustColorBrightness(color, 20),
    adjustColorBrightness(color, 40),
  ];

  let currentAngle = 0;
  const slices = data.map((value, i) => {
    const sliceAngle = (value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    const path = describeArc(size / 2, size / 2, size / 2 - 4, startAngle, endAngle);
    currentAngle = endAngle;

    return { path, color: colors[i % colors.length], angle: (startAngle + endAngle) / 2 };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((slice, i) => (
        <path
          key={i}
          d={slice.path}
          fill={slice.color}
          opacity="0.8"
          style={{
            animation: loading ? `pie-load 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards` : 'none',
            animationDelay: `${i * 80}ms`,
            transformOrigin: `${size / 2}px ${size / 2}px`,
          }}
        />
      ))}
    </svg>
  );
}

// Area 面积图
function AreaChart({
  data,
  color,
  width,
  height,
  loading,
}: {
  data: number[];
  color: string;
  width: number;
  height: number;
  loading: boolean;
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (value / max) * (height - 8);
      return `${x},${y}`;
    })
    .join(' ');

  const polygonPoints = points + ` ${width},${height} 0,${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`area-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* 网格线 */}
      <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      {/* 面积 */}
      <polygon
        points={polygonPoints}
        fill={`url(#area-${color})`}
        style={{
          animation: loading ? `area-load 1.2s ease-out forwards` : 'none',
        }}
      />
      {/* 线 */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          animation: loading ? `area-load 1.2s ease-out forwards` : 'none',
        }}
      />
    </svg>
  );
}

// Gauge 仪表盘
function GaugeChart({
  percentage,
  color,
  size,
  loading,
}: {
  percentage: number;
  color: string;
  size: number;
  loading: boolean;
}) {
  const radius = size / 2 - 6;
  const displayPercentage = Math.min(percentage, 100);
  const angle = (displayPercentage / 100) * 180 - 90;

  const arcPath = describeArc(size / 2, size / 2, radius, -90, 90);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* 背景弧 */}
      <path
        d={arcPath}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* 进度弧 */}
      <path
        d={describeArc(size / 2, size / 2, radius, -90, angle)}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 4px ${color})`,
          animation: loading ? `gauge-load 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards` : 'none',
        }}
      />
      {/* 中心数字 */}
      <text
        x={size / 2}
        y={size / 2 + 2}
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill={color}
        style={{
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      >
        {Math.round(displayPercentage)}%
      </text>
    </svg>
  );
}

// ============ Utility Functions ============

function adjustColorBrightness(color: string, percent: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${((0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)).toUpperCase()}`;
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start} A ${radius} ${radius} 0 ${largeArc} 0 ${end}`;
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): string {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  const x = centerX + radius * Math.cos(angleInRadians);
  const y = centerY + radius * Math.sin(angleInRadians);
  return `${x},${y}`;
}
