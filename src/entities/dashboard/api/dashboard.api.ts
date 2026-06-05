import { apiClient } from '@/shared/api';
import type { DashboardData, DashboardQuery } from '../model/types';

/**
 * Backend max — 500. По умолчанию забираем всех авторов одним запросом,
 * чтобы клиентский скоп команды (team-scope) корректно пересчитывал
 * агрегации, а не показывал «общие totals при выбранной команде».
 */
const DEFAULT_DASHBOARD_SIZE = 500;

export async function getDashboard(query: DashboardQuery = {}): Promise<DashboardData> {
  const params: Record<string, string> = {};
  if (query.from) params.from = query.from;
  if (query.to) params.to = query.to;
  params.size = String(query.size ?? DEFAULT_DASHBOARD_SIZE);
  if (query.page != null) params.page = String(query.page);

  const { data } = await apiClient.get<DashboardData>('/dashboard', { params });
  return data;
}
