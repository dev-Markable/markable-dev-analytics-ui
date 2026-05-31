import type { AuthorActivity } from '@/entities/user';

/** Оси радара — ключевые метрики автора. */
export const COMPARE_AXES = [
  { key: 'nonMergeCommits', label: 'Коммиты' },
  { key: 'addedLines', label: 'Добавлено' },
  { key: 'deletedLines', label: 'Удалено' },
  { key: 'testAddedLines', label: 'Тесты' },
  { key: 'score', label: 'Activity' },
] as const;

export type CompareAxisKey = (typeof COMPARE_AXES)[number]['key'];

/** Достаёт сырое значение метрики из автора. */
export function axisValue(author: AuthorActivity, key: CompareAxisKey): number {
  if (key === 'score') return author.activity?.score ?? 0;
  return author[key] ?? 0;
}

/**
 * Точка радара: { axis: 'Коммиты', <email1>: 0.8, <email2>: 1.0, ... }.
 * Значения нормализованы к [0..1] относительно максимума по оси среди выбранных,
 * чтобы метрики разного масштаба (коммиты ~100, строки ~10000) читались на
 * одной паутине. Если по оси у всех 0 — все получают 0.
 */
export function buildRadarData(
  authors: readonly AuthorActivity[],
): Array<Record<string, string | number>> {
  return COMPARE_AXES.map((axis) => {
    const max = Math.max(...authors.map((a) => axisValue(a, axis.key)), 0);
    const point: Record<string, string | number> = { axis: axis.label };
    for (const a of authors) {
      const raw = axisValue(a, axis.key);
      point[a.email] = max === 0 ? 0 : Number((raw / max).toFixed(3));
    }
    return point;
  });
}
