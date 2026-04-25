'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText, CheckCircle2, BarChart3, AlertCircle, Clock } from 'lucide-react';
import { getDashboardStats, MOCK_STATS } from '@/lib/dashboard';
import { StatCard } from '@/components/dashboard/StatCard';
import type { DashboardStats } from '@/types/dashboard';
import type { StatCardData } from '@/types/dashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const getStatCards = (statsData: DashboardStats): StatCardData[] => [
    {
      id: 'total',
      label: '总测试用例',
      value: statsData.total,
      unit: '个',
      trend: { value: 8, isPositive: true },
      subtitle: '较上周增加 8 个',
      icon: FileText,
      colorClass: 'text-cyan-400',
      glowColor: 'rgba(0, 255, 204, 0.2)',
      chart: {
        type: 'sparkline',
        data: statsData.trend,
        animated: true,
        animationDuration: 1200,
      },
      footerText: '近 7 天趋势',
    },
    {
      id: 'executed',
      label: '已执行',
      value: statsData.executed,
      unit: '次',
      trend: { value: 12, isPositive: true },
      subtitle: `完成率 ${Math.round((statsData.executed / statsData.total) * 100)}%`,
      icon: CheckCircle2,
      colorClass: 'text-blue-400',
      glowColor: 'rgba(59, 130, 246, 0.2)',
      chart: {
        type: 'area',
        data: [...statsData.trend].map(v => Math.max(1, v - 3)),
        animated: true,
        animationDuration: 1200,
      },
      footerText: '执行趋势',
    },
    {
      id: 'passRate',
      label: '通过率',
      value: statsData.passRate,
      unit: '%',
      trend: { value: 3.5, isPositive: true },
      subtitle: '今日通过 ${statsData.executed * 0.78 | 0} 个',
      icon: BarChart3,
      colorClass: 'text-green-400',
      glowColor: 'rgba(34, 197, 94, 0.2)',
      chart: {
        type: 'donut',
        data: [],
        percentage: statsData.passRate,
        animated: true,
        animationDuration: 1500,
      },
      footerText: '本周统计',
    },
    {
      id: 'failed',
      label: '失败用例',
      value: statsData.failed,
      unit: '个',
      trend: { value: 2.1, isPositive: false },
      subtitle: '较上周减少 2 个',
      icon: AlertCircle,
      colorClass: 'text-red-400',
      glowColor: 'rgba(239, 68, 68, 0.2)',
      chart: {
        type: 'bar',
        data: [3, 5, 4, 7, 6, 5, statsData.failed],
        labels: ['一', '二', '三', '四', '五', '六', '日'],
        animated: true,
        animationDuration: 1200,
      },
      footerText: '7 日统计',
    },
    {
      id: 'pending',
      label: '待执行',
      value: statsData.pending,
      unit: '个',
      trend: { value: 5.2, isPositive: false },
      subtitle: '队列中有 12 个其他任务',
      icon: Clock,
      colorClass: 'text-yellow-400',
      glowColor: 'rgba(234, 179, 8, 0.2)',
      chart: {
        type: 'sparkline',
        data: [70, 68, 65, 70, 66, 64, statsData.pending],
        animated: true,
        animationDuration: 1200,
      },
      footerText: '待处理队列',
    },
  ];

  const statCards = getStatCards(stats);
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8 flex flex-col">
      {/* 顶部：欢迎语 + 日期 + 刷新按钮 */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              欢迎回来，{user?.username}!
            </h1>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              <span>📅</span> {dateStr}
            </p>
          </div>
          <Button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            size="sm"
            className={`bg-gradient-to-r from-cyan-400 to-blue-400 text-black font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all ${
              loading ? 'btn-refresh loading' : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 mr-2`} />
            {loading ? '更新中...' : '刷新数据'}
          </Button>
        </div>
      </div>

      {/* 数据卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {statCards.map(card => (
          <StatCard key={card.id} data={card} />
        ))}
      </div>
    </div>
  );
}
