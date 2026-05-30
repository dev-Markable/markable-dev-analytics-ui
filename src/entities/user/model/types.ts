import type { SharedComponents } from '@/shared/api/generated';

type Schemas = SharedComponents['schemas'];

/**
 * Запись unified_user. id и email — единственные гарантированно non-null поля.
 * username / name / avatarUrl / kaitenId / gitlabId — nullable.
 *
 * Backend: shared.yaml#/components/schemas/UserProfile
 */
export type UnifiedUser = Schemas['UserProfile'];

/**
 * Базовая агрегация автора БЕЗ enrichment. Возвращается в `summary` профиля.
 *
 * Backend: shared.yaml#/components/schemas/UserStatsSummary
 */
export type AuthorSummary = Schemas['UserStatsSummary'];

/**
 * Обогащённая агрегация автора: displayName/avatarUrl из unified_user,
 * nonMergeCommits и опциональный ActivityScore (только на /dashboard).
 *
 * Backend: shared.yaml#/components/schemas/AuthorSummary
 */
export type AuthorActivity = Schemas['AuthorSummary'];

/**
 * Композитная метрика активности. Только на /dashboard, в weekly/summary = null.
 *
 * Backend: shared.yaml#/components/schemas/ActivityScore
 */
export type ActivityScore = Schemas['ActivityScore'];

export type ActivityCategory = ActivityScore['category'];
