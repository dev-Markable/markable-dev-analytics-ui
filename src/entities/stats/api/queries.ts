import { queryOptions } from '@tanstack/react-query';
import {
  getDaily,
  getHourly,
  getReviews,
  getSummary,
  getWeekly,
  type HourlyQuery,
  type PeriodQuery,
} from './stats.api';

const enabledByPeriod = (q: PeriodQuery): boolean => Boolean(q.from && q.to);

export const summaryQuery = (q: PeriodQuery) =>
  queryOptions({
    queryKey: ['stats', 'summary', q] as const,
    queryFn: ({ signal }) => getSummary(q, signal),
    enabled: enabledByPeriod(q),
  });

export const weeklyQuery = (q: PeriodQuery) =>
  queryOptions({
    queryKey: ['stats', 'weekly', q] as const,
    queryFn: ({ signal }) => getWeekly(q, signal),
    enabled: enabledByPeriod(q),
  });

export const dailyQuery = (q: PeriodQuery) =>
  queryOptions({
    queryKey: ['stats', 'daily', q] as const,
    queryFn: ({ signal }) => getDaily(q, signal),
    enabled: enabledByPeriod(q),
  });

export const hourlyQuery = (q: HourlyQuery) =>
  queryOptions({
    queryKey: ['stats', 'hourly', q] as const,
    queryFn: ({ signal }) => getHourly(q, signal),
    enabled: enabledByPeriod(q),
  });

export const reviewsQuery = (q: PeriodQuery) =>
  queryOptions({
    queryKey: ['stats', 'reviews', q] as const,
    queryFn: ({ signal }) => getReviews(q, signal),
    enabled: enabledByPeriod(q),
  });
