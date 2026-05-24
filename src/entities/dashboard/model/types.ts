import type { AuthorActivity } from '@/entities/user/model/types';

/**
 * Paginated-ответ /dashboard. Авторы отсортированы по nonMergeCommits desc.
 * Первая страница (page=0) — самые активные. Последняя — аутсайдеры.
 */
export interface DashboardData {
  from: string;
  to: string;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  items: AuthorActivity[];
}

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
