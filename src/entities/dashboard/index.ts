export type { DashboardData, DashboardQuery, DashboardPeriod } from './model/types';
export { getDashboard } from './api/dashboard.api';
export { useDashboardStore } from './model/dashboard.store';
export {
  aggregateAuthors,
  EMPTY_TOTALS,
  type DashboardTotals,
} from './lib/aggregate';
