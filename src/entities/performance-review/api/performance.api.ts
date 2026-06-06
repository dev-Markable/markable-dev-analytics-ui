import { apiClient } from '@/shared/api';
import type { PerformanceReview, PerformanceQuery } from '../model/types';

export async function getPerformanceReview(
  query: PerformanceQuery,
  signal?: AbortSignal,
): Promise<PerformanceReview> {
  const { data } = await apiClient.get<PerformanceReview>('/performance/review', {
    params: {
      email: query.email,
      from: query.from,
      to: query.to,
      compareToPrevious: query.compareToPrevious,
    },
    signal,
  });
  return data;
}
