import type { Commit } from '@/entities/commit';
import { dayjs, type DateRange } from '@/shared/lib';

export interface DayActivity {
  date: string;
  label: string;
  commits: number;
  nonMergeCommits: number;
  addedLines: number;
}

export interface HourActivity {
  hour: number;
  label: string;
  commits: number;
}

/**
 * Аггрегирует коммиты по дням в указанном диапазоне.
 * Дни без коммитов тоже включены — нулевыми точками, для непрерывности графика.
 */
export function groupByDay(
  commits: readonly Commit[],
  range: DateRange,
): DayActivity[] {
  const map = new Map<string, DayActivity>();

  let cursor = dayjs(range.from);
  const end = dayjs(range.to);
  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    const key = cursor.format('YYYY-MM-DD');
    map.set(key, {
      date: key,
      label: cursor.format('D MMM'),
      commits: 0,
      nonMergeCommits: 0,
      addedLines: 0,
    });
    cursor = cursor.add(1, 'day');
  }

  for (const c of commits) {
    const key = dayjs(c.commitDate).format('YYYY-MM-DD');
    const point = map.get(key);
    if (!point) continue;
    point.commits += 1;
    if (!c.merge) point.nonMergeCommits += 1;
    point.addedLines += c.addedLines;
  }

  return Array.from(map.values());
}

/**
 * Распределение коммитов по часам суток (0–23).
 */
export function groupByHour(commits: readonly Commit[]): HourActivity[] {
  const arr: HourActivity[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${String(h).padStart(2, '0')}:00`,
    commits: 0,
  }));

  for (const c of commits) {
    const h = dayjs(c.commitDate).hour();
    const slot = arr[h];
    if (slot) slot.commits += 1;
  }

  return arr;
}
