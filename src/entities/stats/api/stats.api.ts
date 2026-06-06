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

/**
 * Все эндпоинты принимают опциональный AbortSignal — стор отменяет
 * предыдущий fetch при смене периода или unmount страницы. См.
 * `shared/api/abort.ts` и `createStatsStore`.
 */

export async function getSummary(query: PeriodQuery, signal?: AbortSignal): Promise<PeriodSummary> {
  const { data } = await apiClient.get<PeriodSummary>('/stats/summary', { params: query, signal });
  return data;
}

export async function getWeekly(query: PeriodQuery, signal?: AbortSignal): Promise<WeeklyStat[]> {
  const { data } = await apiClient.get<WeeklyStat[]>('/stats/weekly', { params: query, signal });
  return data;
}

export async function getDaily(query: PeriodQuery, signal?: AbortSignal): Promise<DailyStat[]> {
  const { data } = await apiClient.get<DailyStat[]>('/stats/daily', { params: query, signal });
  return data;
}

export async function getHourly(query: HourlyQuery, signal?: AbortSignal): Promise<HourlyStats> {
  const { data } = await apiClient.get<HourlyStats>('/stats/hourly', { params: query, signal });
  return data;
}

export async function getReviews(query: PeriodQuery, signal?: AbortSignal): Promise<ReviewStats> {
  const { data } = await apiClient.get<ReviewStats>('/stats/reviews', { params: query, signal });
  return data;
}
