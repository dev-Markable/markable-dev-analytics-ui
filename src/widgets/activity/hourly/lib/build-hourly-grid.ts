import type { HourlyCellAuthor, HourlyStats } from '@/entities/stats';

export interface HourlyGridCell {
  weekday: number; // 0=Пн … 6=Вс
  hour: number; // 0..23
  commits: number;
  addedLines: number;
  /** Кто коммитил в этот час. Пусто на ответах бэка старше контракта 3.12.0. */
  authors: readonly HourlyCellAuthor[];
}

export interface HourlyGrid {
  /** 7 рядов (дни) × 24 ячейки (часы), всегда полная сетка. */
  rows: HourlyGridCell[][];
  /** Максимум коммитов в ячейке — для нормализации цветовой шкалы. */
  maxCommits: number;
  /** Итого коммитов за период. */
  totalCommits: number;
  /** Час пик и его день (для подписи), null если данных нет. */
  peak: { weekday: number; hour: number; commits: number } | null;
}

export const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

/**
 * Достраивает полную сетку 7×24 из разреженных ячеек бэка.
 * Отсутствующие (weekday, hour) трактуются как 0 коммитов.
 */
export function buildHourlyGrid(data: HourlyStats | null): HourlyGrid {
  const rows: HourlyGridCell[][] = Array.from({ length: 7 }, (_, weekday) =>
    Array.from({ length: 24 }, (_, hour) => ({
      weekday,
      hour,
      commits: 0,
      addedLines: 0,
      authors: [] as readonly HourlyCellAuthor[],
    })),
  );

  let maxCommits = 0;
  let totalCommits = 0;
  let peak: HourlyGrid['peak'] = null;

  for (const cell of data?.cells ?? []) {
    const row = rows[cell.weekday];
    if (!row) continue;
    const target = row[cell.hour];
    if (!target) continue;
    target.commits = cell.commits;
    target.addedLines = cell.addedLines ?? 0;
    target.authors = cell.authors ?? [];
    totalCommits += cell.commits;
    if (cell.commits > maxCommits) {
      maxCommits = cell.commits;
      peak = { weekday: cell.weekday, hour: cell.hour, commits: cell.commits };
    }
  }

  return { rows, maxCommits, totalCommits, peak };
}

/** 5-уровневая шкала интенсивности (0..4) от количества коммитов. */
export function intensityLevel(commits: number, max: number): number {
  if (commits === 0 || max === 0) return 0;
  const n = commits / max;
  if (n <= 0.25) return 1;
  if (n <= 0.5) return 2;
  if (n <= 0.75) return 3;
  return 4;
}
