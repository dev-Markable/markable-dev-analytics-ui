import { apiClient } from '@/shared/api';
import type { DailyStat, PeriodSummary, WeeklyStat } from '../model/types';

export interface PeriodQuery {
  from: string;
  to: string;
}

export async function getSummary(query: PeriodQuery): Promise<PeriodSummary> {
  const { data } = await apiClient.get<PeriodSummary>('/stats/summary', { params: query });
  return data;
}

export async function getWeekly(query: PeriodQuery): Promise<WeeklyStat[]> {
  const { data } = await apiClient.get<WeeklyStat[]>('/stats/weekly', { params: query });
  return data;
}

export async function getDaily(query: PeriodQuery): Promise<DailyStat[]> {
  const { data } = await apiClient.get<DailyStat[]>('/stats/daily', { params: query });
  return data;
}
