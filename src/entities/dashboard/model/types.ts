import type { DashboardComponents } from '@/shared/api/generated';

/**
 * Paginated-ответ /dashboard. Авторы отсортированы по `activity.score desc`.
 *
 * Backend: dashboard-api.yaml#/components/schemas/DashboardResponse
 */
export type DashboardData = DashboardComponents['schemas']['DashboardResponse'];

export interface DashboardQuery {
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface DashboardPeriod {
  from: string;
  to: string;
}
