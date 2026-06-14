import type { CohortDeveloper } from '@/entities/cohort';

export type MatrixSort = 'tenure' | 'activity' | 'team';

/** Суммарные не-мердж коммиты разработчика за всё окно. */
export const totalCommits = (d: CohortDeveloper): number =>
  d.cells.reduce((s, v) => s + v, 0);

/** Поиск по имени / email / команде (регистронезависимо). */
export function filterDevelopers(
  devs: readonly CohortDeveloper[],
  query: string,
): CohortDeveloper[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...devs];
  return devs.filter((d) =>
    `${d.displayName ?? ''} ${d.email} ${d.team ?? ''}`.toLowerCase().includes(q),
  );
}

const nameKey = (d: CohortDeveloper) => (d.displayName ?? d.email).toLowerCase();

/**
 * Сортировка строк матрицы. `tenure` — по стажу (старейшие сверху), `activity` —
 * по суммарной активности убыванием, `team` — по команде (без команды — в конец),
 * затем по имени.
 */
export function sortDevelopers(
  devs: readonly CohortDeveloper[],
  sort: MatrixSort,
): CohortDeveloper[] {
  const copy = [...devs];
  switch (sort) {
    case 'tenure':
      copy.sort((a, b) => a.firstActive.localeCompare(b.firstActive) || nameKey(a).localeCompare(nameKey(b)));
      break;
    case 'activity':
      copy.sort((a, b) => totalCommits(b) - totalCommits(a));
      break;
    case 'team':
      copy.sort(
        (a, b) =>
          (a.team ?? '￿').localeCompare(b.team ?? '￿') ||
          nameKey(a).localeCompare(nameKey(b)),
      );
      break;
  }
  return copy;
}
