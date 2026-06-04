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

/**
 * Почасовая статистика (B1). Бэк может опускать пустые ячейки —
 * фронт достраивает полную сетку 7×24.
 * Backend: shared.yaml#/components/schemas/HourlyStats
 */
export type HourlyStats = Schemas['HourlyStats'];
export type HourlyCell = Schemas['HourlyCell'];

/**
 * Ревью-метрики (B2). Собираются из GitLab MR (approvals + notes).
 * Backend: shared.yaml#/components/schemas/ReviewStats
 */
export type ReviewStats = Schemas['ReviewStats'];
export type ReviewAuthor = Schemas['ReviewAuthor'];
