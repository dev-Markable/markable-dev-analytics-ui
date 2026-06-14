import { apiClient } from '@/shared/api';
import type { CohortActivityMatrix, CohortRetention, TierTransitions } from '../model/types';

/**
 * Окно истории опционально: без from/to бэк отдаёт всю доступную историю
 * (страница когорт смотрит на весь состав, а не на текущий 30-дневный период).
 * `team` — фильтр по ТЕКУЩЕЙ команде разработчика.
 */
export interface CohortQuery {
  from?: string;
  to?: string;
  team?: string;
}

/** Retention дополнительно принимает порог «активен» (минимум коммитов в месяце). */
export interface RetentionQuery extends CohortQuery {
  minCommits?: number;
}

export async function getCohortRetention(
  q: RetentionQuery,
  signal?: AbortSignal,
): Promise<CohortRetention> {
  const { data } = await apiClient.get<CohortRetention>('/cohorts/retention', {
    params: q,
    signal,
  });
  return data;
}

export async function getCohortActivityMatrix(
  q: CohortQuery,
  signal?: AbortSignal,
): Promise<CohortActivityMatrix> {
  const { data } = await apiClient.get<CohortActivityMatrix>('/cohorts/activity-matrix', {
    params: q,
    signal,
  });
  return data;
}

export async function getTierTransitions(
  q: CohortQuery,
  signal?: AbortSignal,
): Promise<TierTransitions> {
  const { data } = await apiClient.get<TierTransitions>('/cohorts/tier-transitions', {
    params: q,
    signal,
  });
  return data;
}
