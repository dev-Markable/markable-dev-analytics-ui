import type { DailyStat } from '@/entities/stats';

export interface PulsePoint {
  /** ISO-дата дня. */
  date: string;
  commits: number;
  addedLines: number;
  /** Сколько уникальных авторов коммитили в этот день. */
  authors: number;
}

/**
 * Дневные агрегаты (email × date × repo) → ряд по дням для графика пульса.
 *
 * Один день приходит несколькими строками (по автору и репозиторию), поэтому
 * схлопываем: коммиты и строки суммируем, авторов считаем как уникальные email.
 * Дни без активности в ряд не добавляем — их не было в выборке; провал на графике
 * виден по разрыву значений, а не по искусственным нулям.
 */
export function aggregatePulse(daily: readonly DailyStat[]): PulsePoint[] {
  const byDate = new Map<string, { commits: number; addedLines: number; authors: Set<string> }>();

  for (const row of daily) {
    let acc = byDate.get(row.date);
    if (!acc) {
      acc = { commits: 0, addedLines: 0, authors: new Set() };
      byDate.set(row.date, acc);
    }
    acc.commits += row.commits;
    acc.addedLines += row.addedLines;
    acc.authors.add(row.email.toLowerCase());
  }

  return [...byDate.entries()]
    .map(([date, acc]) => ({
      date,
      commits: acc.commits,
      addedLines: acc.addedLines,
      authors: acc.authors.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Самый продуктивный день периода — для подписи под графиком. */
export function peakDay(points: readonly PulsePoint[]): PulsePoint | null {
  if (points.length === 0) return null;
  return points.reduce((best, p) => (p.commits > best.commits ? p : best));
}
