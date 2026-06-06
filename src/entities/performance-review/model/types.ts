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

/** Углублённая Kaiten-аналитика (1.8.0): defects, development, cycleTime, balance. */
export type KaitenInsights = Schemas['KaitenInsights'];
export type DefectsSummary = Schemas['DefectsSummary'];
export type UrgencyCounts = Schemas['UrgencyCounts'];
export type DevelopmentRollup = Schemas['DevelopmentRollup'];
export type RootTask = Schemas['RootTask'];
export type UseCaseRef = Schemas['UseCaseRef'];
export type CycleTime = Schemas['CycleTime'];
export type WorkBalance = Schemas['WorkBalance'];
export type UseCaseStatus = UseCaseRef['status'];
export type UseCaseType = UseCaseRef['type'];

/** Ключ метрики в PerformanceMetrics — для типобезопасного перебора. */
export type MetricKey = keyof PerformanceMetrics;

export interface PerformanceQuery {
  email: string;
  from: string;
  to: string;
  compareToPrevious: boolean;
}
