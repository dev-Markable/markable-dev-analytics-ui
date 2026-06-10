import { queryOptions } from '@tanstack/react-query';
import { getPerformanceReview } from './performance.api';
import type { PerformanceQuery } from '../model/types';

/**
 * Performance Review: enabled при наличии email — на странице есть период
 * «выберите разработчика», когда query не активен.
 */
export const performanceReviewQuery = (q: PerformanceQuery | null) =>
  queryOptions({
    queryKey: ['performance-review', q] as const,
    queryFn: ({ signal }) => getPerformanceReview(q as PerformanceQuery, signal),
    enabled: Boolean(q?.email),
  });
