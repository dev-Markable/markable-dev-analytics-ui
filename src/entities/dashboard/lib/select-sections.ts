import type { ActivityCategory, AuthorActivity } from '@/entities/user';

export interface DashboardSections {
  top: AuthorActivity[];
  outsiders: AuthorActivity[];
}

const UNDERPERFORMING: ReadonlySet<ActivityCategory> = new Set([
  'INACTIVE',
  'BELOW_AVERAGE',
]);

export const isUnderperforming = (author: AuthorActivity): boolean =>
  author.activity != null && UNDERPERFORMING.has(author.activity.category);

/**
 * Делит отфильтрованный (и отсортированный по `activity.score desc`) список
 * на две **непересекающиеся** секции:
 *
 * - **Top** — все, кто НЕ underperforming (категория `ACTIVE` / `STAR`,
 *   либо `activity == null` — graceful fallback при отсутствии данных),
 *   первые `maxN` по score.
 * - **Outsiders** — авторы с категорией `INACTIVE` или `BELOW_AVERAGE`,
 *   до `maxN` самых низких по score.
 *
 * Обе секции — в исходном убывающем порядке. Рейтинг рендерится одним
 * непрерывным списком с продолжающейся нумерацией позиций, поэтому порядок
 * внутри аутсайдеров тоже должен быть убывающим: иначе «8-е место» оказывается
 * выше «3-го» по score и номера врут.
 *
 * Множества дизъюнктны по построению: один автор не может одновременно
 * быть и не быть underperforming.
 */
export function selectDashboardSections(
  sortedAuthors: readonly AuthorActivity[],
  maxN: number,
): DashboardSections {
  // sortedAuthors уже отсортирован по score desc. filter сохраняет порядок.
  const top = sortedAuthors.filter((a) => !isUnderperforming(a)).slice(0, maxN);
  const underperformers = sortedAuthors.filter(isUnderperforming);
  // slice(-maxN) → последние maxN = самые низкие; порядок не меняем.
  const outsiders = underperformers.slice(-maxN);

  return { top, outsiders };
}
