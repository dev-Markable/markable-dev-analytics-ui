import type { SharedComponents } from '@/shared/api/generated';

type Schemas = SharedComponents['schemas'];

/**
 * Backend: shared.yaml#/components/schemas/DailyStats
 * (наше внутреннее имя — DailyStat, без `s` — оставляем как было)
 */
export type DailyStat = Schemas['DailyStats'];

/**
 * Backend: shared.yaml#/components/schemas/WeeklyStats
 */
export type WeeklyStat = Schemas['WeeklyStats'];

/**
 * Backend: shared.yaml#/components/schemas/PeriodSummary
 */
export type PeriodSummary = Schemas['PeriodSummary'];
