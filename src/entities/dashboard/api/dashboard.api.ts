import { apiClient } from '@/shared/api';
import type { DashboardData, DashboardQuery } from '../model/types';

export async function getDashboard(query: DashboardQuery = {}): Promise<DashboardData> {
  const params: Record<string, string> = {};
  if (query.from) params.from = query.from;
  if (query.to) params.to = query.to;
  if (query.page != null) params.page = String(query.page);
  if (query.size != null) params.size = String(query.size);

  const { data } = await apiClient.get<DashboardData>('/dashboard', { params });
  return data;
}
