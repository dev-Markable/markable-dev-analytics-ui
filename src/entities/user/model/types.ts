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

/**
 * Обогащённая агрегация — то же, что AuthorSummary + displayName/avatarUrl
 * (подтягивается бэком из unified_user) + nonMergeCommits (= commits − mergeCommits).
 *
 * Возвращается в `/dashboard.items[]`, `/stats/weekly.authors[]`, `/stats/summary.topAuthors[]`.
 */
export interface AuthorActivity extends AuthorSummary {
  displayName: string | null;
  avatarUrl: string | null;
  nonMergeCommits: number;
}
