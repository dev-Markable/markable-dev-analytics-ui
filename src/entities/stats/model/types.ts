import type { Schemas } from '@/shared/api/schema';

/**
 * Backend: shared.yaml#/components/schemas/DailyStats
 * (наше внутреннее имя — DailyStat, без `s`)
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
