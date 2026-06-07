import { queryOptions } from '@tanstack/react-query';
import { previousPeriod } from '@/shared/lib';
import { getDashboard } from './dashboard.api';
import type { DashboardPeriod } from '../model/types';

/**
 * Query keys и query options для dashboard.
 *
 * Соглашение по ключам:
 * - `['dashboard', { from, to }]` — текущий период;
 * - `['dashboard', 'prev', { from, to }]` — predecессорный для PoP-дельт.
 *
 * Зачем queryOptions vs голый объект: один источник, типы сами выводятся
 * (включая тип data), удобно переиспользовать `queryClient.invalidateQueries`.
 */
export const dashboardQuery = (period: DashboardPeriod) =>
  queryOptions({
    queryKey: ['dashboard', period] as const,
    queryFn: ({ signal }) => getDashboard(period, signal),
    enabled: Boolean(period.from && period.to),
  });

/** PoP-period (тот же ответ для встык-предыдущего периода). */
export const dashboardPrevQuery = (period: DashboardPeriod) => {
  const prev =
    period.from && period.to ? previousPeriod({ from: period.from, to: period.to }) : period;
  return queryOptions({
    queryKey: ['dashboard', 'prev', prev] as const,
    queryFn: ({ signal }) => getDashboard(prev, signal),
    enabled: Boolean(period.from && period.to),
  });
};
