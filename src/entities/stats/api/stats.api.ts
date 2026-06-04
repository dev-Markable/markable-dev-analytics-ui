import { apiClient } from '@/shared/api';
import type {
  DailyStat,
  HourlyStats,
  PeriodSummary,
  ReviewStats,
  WeeklyStat,
} from '../model/types';

export interface PeriodQuery {
  from: string;
  to: string;
}

/** Hourly поддерживает опциональную фильтрацию по автору. */
export interface HourlyQuery extends PeriodQuery {
  email?: string;
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

export async function getHourly(query: HourlyQuery): Promise<HourlyStats> {
  const { data } = await apiClient.get<HourlyStats>('/stats/hourly', { params: query });
  return data;
}

export async function getReviews(query: PeriodQuery): Promise<ReviewStats> {
  const { data } = await apiClient.get<ReviewStats>('/stats/reviews', { params: query });
  return data;
}
