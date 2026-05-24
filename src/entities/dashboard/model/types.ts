import type { AuthorActivity } from '@/entities/user/model/types';

export interface DashboardData {
  from: string;
  to: string;
  topActive: AuthorActivity[];
  outsiders: AuthorActivity[];
}

export interface DashboardQuery {
  from?: string;
  to?: string;
  topN?: number;
  outsiderN?: number;
}
