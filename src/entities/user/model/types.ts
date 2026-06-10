import type { Schemas } from '@/shared/api/schema';

/**
 * ⚠️ ВНИМАНИЕ: расхождение локальных имён с именами схем OAS — намеренное.
 *
 * Локальные имена выбраны под доменное прочтение в UI-коде («автор», «активность»),
 * но при бампе OAS, переименовывающем эти схемы, придётся править алиасы здесь.
 * Соответствие:
 *
 *   локальное имя        | schema-имя в OAS
 *   ─────────────────────|──────────────────
 *   UnifiedUser          | UserProfile          (shared.yaml)
 *   AuthorSummary        | UserStatsSummary     (shared.yaml) ← НЕ путать с
 *                        |                      schema's AuthorSummary
 *   AuthorActivity       | AuthorSummary        (shared.yaml) ← обогащённый
 *                        |                      вариант с activity, _не_
 *                        |                      базовый AuthorSummary
 *
 * Если ловишь баг типа «в коде указываю AuthorSummary, а поля как у Activity»
 * или наоборот — проверь эту таблицу.
 */

/**
 * Запись unified_user. id и email — единственные гарантированно non-null поля.
 * Backend: shared.yaml#/components/schemas/UserProfile
 */
export type UnifiedUser = Schemas['UserProfile'];

/**
 * Базовая агрегация автора БЕЗ enrichment. Возвращается в `summary` профиля.
 * Backend: shared.yaml#/components/schemas/UserStatsSummary
 * (имя в OAS — UserStatsSummary, не AuthorSummary — см. шапку файла).
 */
export type AuthorSummary = Schemas['UserStatsSummary'];

/**
 * Обогащённая агрегация автора: displayName/avatarUrl, nonMergeCommits,
 * опциональный ActivityScore (только на /dashboard).
 * Backend: shared.yaml#/components/schemas/AuthorSummary
 * (имя в OAS — AuthorSummary, не Activity — см. шапку файла).
 */
export type AuthorActivity = Schemas['AuthorSummary'];

/**
 * Композитная метрика активности. Только на /dashboard, в weekly/summary = null.
 * Backend: shared.yaml#/components/schemas/ActivityScore
 */
export type ActivityScore = Schemas['ActivityScore'];

export type ActivityCategory = ActivityScore['category'];
