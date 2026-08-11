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
export type HourlyCellAuthor = Schemas['HourlyCellAuthor'];

/**
 * Ревью-метрики (B2). Собираются из GitLab MR (approvals + notes).
 * Backend: shared.yaml#/components/schemas/ReviewStats
 */
export type ReviewStats = Schemas['ReviewStats'];
export type ReviewAuthor = Schemas['ReviewAuthor'];

/**
 * Дефекты команды по приоритету за периоды (POST /stats/defects).
 * Дефекты уникальны (дедуп по id карточки на бэке).
 * Backend: stats-api.yaml#/components/schemas/DefectsByPeriodRequest|Response
 */
export type DefectsByPeriodRequest = Schemas['DefectsByPeriodRequest'];
export type DefectsByPeriodResponse = Schemas['DefectsByPeriodResponse'];
export type PeriodRange = Schemas['PeriodRange'];
export type PeriodDefects = Schemas['PeriodDefects'];
export type PriorityCounts = Schemas['PriorityCounts'];
export type DefectItem = Schemas['DefectItem'];
export type DefectMember = Schemas['DefectMember'];
export type MarkDefectsAiAgentRequest = Schemas['MarkDefectsAiAgentRequest'];
export type MarkDefectsAiAgentResponse = Schemas['MarkDefectsAiAgentResponse'];

/**
 * Статистика вмерженных MR по команде (GET /stats/merged-mrs): всего + по авторам.
 * Backend: stats-api.yaml#/components/schemas/MergedMrStats|MergedMrByAuthor
 */
export type MergedMrStats = Schemas['MergedMrStats'];
export type MergedMrByAuthor = Schemas['MergedMrByAuthor'];
export type MergedMrByRepo = Schemas['MergedMrByRepo'];

/**
 * Таймшит разработчика: трудозатраты по дням (GET /stats/timesheet).
 * Время в МИНУТАХ (как в Kaiten time_spent) — форматируем в часы на клиенте.
 * Backend: stats-api.yaml#/components/schemas/Timesheet|TimesheetDay
 */
export type Timesheet = Schemas['Timesheet'];
export type TimesheetDay = Schemas['TimesheetDay'];
export type TimesheetEntry = Schemas['TimesheetEntry'];
export type TimesheetMergeRequest = Schemas['TimesheetMergeRequest'];
