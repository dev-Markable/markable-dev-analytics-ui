export interface UnifiedUser {
  id: number;
  email: string;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  kaitenId: number | null;
  gitlabId: number | null;
}

/**
 * Базовая агрегация по автору. Возвращается в `/users/{email}/profile.summary`
 * и в массиве `authors[]` старых эндпоинтов. Не содержит enrichment-полей.
 */
export interface AuthorSummary {
  email: string;
  commits: number;
  mergeCommits: number;
  addedLines: number;
  deletedLines: number;
  testAddedLines: number;
}

export type ActivityCategory = 'INACTIVE' | 'BELOW_AVERAGE' | 'ACTIVE' | 'STAR';

/**
 * Композитная метрика активности автора за период.
 * Возвращается ТОЛЬКО на `/dashboard`. В weekly/summary поле = null,
 * в daily вообще нет такого поля.
 *
 * `score = volumeFactor × qualityFactor`, где
 * - `volumeFactor` = nonMergeCommits / expectedCommits (baseline 50/30 дней, масштабируется)
 * - `qualityFactor` = 0.3..1.0, штраф за микро-коммиты (&lt;5 строк) и бомбы (&gt;500 строк)
 *
 * Сортировка дашборда — по `score desc`.
 */
export interface ActivityScore {
  score: number;
  category: ActivityCategory;
  volumeFactor: number;
  qualityFactor: number;
  avgLinesPerCommit: number;
}

/**
 * Обогащённая агрегация — AuthorSummary + displayName/avatarUrl
 * (подтягивается бэком из unified_user) + nonMergeCommits (= commits − mergeCommits)
 * + optional ActivityScore (только на /dashboard).
 *
 * Возвращается в `/dashboard.items[]`, `/stats/weekly.authors[]`, `/stats/summary.topAuthors[]`.
 */
export interface AuthorActivity extends AuthorSummary {
  displayName: string | null;
  avatarUrl: string | null;
  nonMergeCommits: number;
  activity?: ActivityScore | null;
}
