import type { DailyStat } from '@/entities/stats';
import { dayjs, type DateRange } from '@/shared/lib';

export interface HeatmapDay {
  date: string;
  /** ISO weekday — 0=Monday, 6=Sunday. */
  weekday: number;
  /** Колонка от начала диапазона (snapped к понедельнику первой недели). */
  column: number;
  commits: number;
  mergeCommits: number;
  addedLines: number;
  deletedLines: number;
  testAddedLines: number;
  authors: number;
  repos: number;
  /** True если день вне периода (snap-padding). */
  outOfRange: boolean;
}

export interface HeatmapGrid {
  cells: HeatmapDay[];
  columns: number;
  /** Максимум коммитов за день — для нормализации цветовой шкалы. */
  maxCommits: number;
  /** Подписи месяцев: { column, label } для шапки. */
  monthMarkers: { column: number; label: string }[];
}

interface DayAggregate {
  commits: number;
  mergeCommits: number;
  addedLines: number;
  deletedLines: number;
  testAddedLines: number;
  authors: Set<string>;
  repos: Set<string>;
}

const aggregate = (daily: readonly DailyStat[]): Map<string, DayAggregate> => {
  const byDate = new Map<string, DayAggregate>();
  for (const d of daily) {
    let entry = byDate.get(d.date);
    if (!entry) {
      entry = {
        commits: 0,
        mergeCommits: 0,
        addedLines: 0,
        deletedLines: 0,
        testAddedLines: 0,
        authors: new Set(),
        repos: new Set(),
      };
      byDate.set(d.date, entry);
    }
    entry.commits += d.commits;
    entry.mergeCommits += d.mergeCommits;
    entry.addedLines += d.addedLines;
    entry.deletedLines += d.deletedLines;
    entry.testAddedLines += d.testAddedLines;
    entry.authors.add(d.email);
    entry.repos.add(d.repo);
  }
  return byDate;
};

export function buildHeatmapGrid(
  daily: readonly DailyStat[],
  range: DateRange,
): HeatmapGrid {
  const byDate = aggregate(daily);
  // Snap: первая колонка начинается с понедельника недели, в которую попадает range.from
  const start = dayjs(range.from).startOf('isoWeek');
  const end = dayjs(range.to).endOf('isoWeek');
  const rangeStart = dayjs(range.from);
  const rangeEnd = dayjs(range.to);

  const cells: HeatmapDay[] = [];
  const monthMarkers: { column: number; label: string }[] = [];
  let cursor = start;
  let dayIndex = 0;
  let maxCommits = 0;
  let lastMonth = -1;

  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    const key = cursor.format('YYYY-MM-DD');
    const agg = byDate.get(key);
    const column = Math.floor(dayIndex / 7);
    const outOfRange = cursor.isBefore(rangeStart, 'day') || cursor.isAfter(rangeEnd, 'day');

    cells.push({
      date: key,
      weekday: cursor.isoWeekday() - 1,
      column,
      commits: agg?.commits ?? 0,
      mergeCommits: agg?.mergeCommits ?? 0,
      addedLines: agg?.addedLines ?? 0,
      deletedLines: agg?.deletedLines ?? 0,
      testAddedLines: agg?.testAddedLines ?? 0,
      authors: agg?.authors.size ?? 0,
      repos: agg?.repos.size ?? 0,
      outOfRange,
    });

    if (!outOfRange && agg && agg.commits > maxCommits) {
      maxCommits = agg.commits;
    }

    // Помечаем переход на новый месяц для подписей сверху
    const month = cursor.month();
    if (month !== lastMonth && cursor.isoWeekday() === 1) {
      monthMarkers.push({ column, label: cursor.format('MMM') });
      lastMonth = month;
    }

    cursor = cursor.add(1, 'day');
    dayIndex++;
  }

  return {
    cells,
    columns: Math.ceil(dayIndex / 7),
    maxCommits,
    monthMarkers,
  };
}
