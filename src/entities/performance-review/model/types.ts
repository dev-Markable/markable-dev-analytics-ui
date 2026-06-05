import type { Schemas } from '@/shared/api/schema';

/**
 * Досье к perf-review: subject + метрики с дельтами + разбивка задач + пруфы.
 * Backend: stats-contract / shared.yaml#/components/schemas/PerformanceReview
 */
export type PerformanceReview = Schemas['PerformanceReview'];
export type PerformanceMetrics = Schemas['PerformanceMetrics'];
export type MetricDelta = Schemas['MetricDelta'];
export type TaskTypeBreakdown = Schemas['TaskTypeBreakdown'];
export type TaskStatusCounts = Schemas['TaskStatusCounts'];
export type PerformanceHighlight = Schemas['PerformanceHighlight'];

/** Ключ метрики в PerformanceMetrics — для типобезопасного перебора. */
export type MetricKey = keyof PerformanceMetrics;

export interface PerformanceQuery {
  email: string;
  from: string;
  to: string;
  compareToPrevious: boolean;
}
