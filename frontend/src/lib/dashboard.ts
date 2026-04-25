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
