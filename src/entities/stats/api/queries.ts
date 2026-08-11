import { queryOptions } from '@tanstack/react-query';
import {
  getDaily,
  getHourly,
  getMergedMrs,
  getReviews,
  getSummary,
  getTimesheet,
  getWeekly,
  type HourlyQuery,
  type MergedMrQuery,
  type PeriodQuery,
  type TimesheetQuery,
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

export const mergedMrsQuery = (q: MergedMrQuery) =>
  queryOptions({
    queryKey: ['stats', 'merged-mrs', q] as const,
    queryFn: ({ signal }) => getMergedMrs(q, signal),
    // Требует и период, и конкретную команду (раздел team-scoped).
    enabled: enabledByPeriod(q) && Boolean(q.team),
  });

export const timesheetQuery = (q: TimesheetQuery) =>
  queryOptions({
    queryKey: ['stats', 'timesheet', q] as const,
    queryFn: ({ signal }) => getTimesheet(q, signal),
    // Требует и период, и конкретного разработчика.
    enabled: enabledByPeriod(q) && Boolean(q.email),
  });
