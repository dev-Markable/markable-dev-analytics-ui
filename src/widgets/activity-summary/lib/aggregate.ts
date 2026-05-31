import type { DailyStat } from '@/entities/stats';

export interface ActivityTotals {
  totalCommits: number;
  totalMergeCommits: number;
  totalAddedLines: number;
  totalDeletedLines: number;
  totalTestAddedLines: number;
  uniqueAuthors: number;
  uniqueRepos: number;
  activeDays: number;
}

export function aggregateTotals(daily: readonly DailyStat[]): ActivityTotals {
  const authors = new Set<string>();
  const repos = new Set<string>();
  const dates = new Set<string>();

  let totalCommits = 0;
  let totalMergeCommits = 0;
  let totalAddedLines = 0;
  let totalDeletedLines = 0;
  let totalTestAddedLines = 0;

  for (const d of daily) {
    authors.add(d.email);
    repos.add(d.repo);
    if (d.commits > 0) dates.add(d.date);
    totalCommits += d.commits;
    totalMergeCommits += d.mergeCommits;
    totalAddedLines += d.addedLines;
    totalDeletedLines += d.deletedLines;
    totalTestAddedLines += d.testAddedLines;
  }

  return {
    totalCommits,
    totalMergeCommits,
    totalAddedLines,
    totalDeletedLines,
    totalTestAddedLines,
    uniqueAuthors: authors.size,
    uniqueRepos: repos.size,
    activeDays: dates.size,
  };
}

export interface DailySeries {
  /** Коммиты по дням (хронологически). */
  commits: number[];
  /** Добавленные строки по дням. */
  addedLines: number[];
  /** Уникальные авторы по дням. */
  authors: number[];
}

interface DayAcc {
  commits: number;
  addedLines: number;
  authors: Set<string>;
}

/**
 * Сворачивает daily-статы (ключ email × date × repo) в ряды по дате —
 * для спарклайнов. Дни сортируются хронологически по строке `date`
 * (ISO YYYY-MM-DD сортируется лексикографически = хронологически).
 * Дни без записей не вставляются — спарклайн показывает тренд по активным точкам.
 */
export function dailySeries(daily: readonly DailyStat[]): DailySeries {
  const byDate = new Map<string, DayAcc>();

  for (const d of daily) {
    let acc = byDate.get(d.date);
    if (!acc) {
      acc = { commits: 0, addedLines: 0, authors: new Set() };
      byDate.set(d.date, acc);
    }
    acc.commits += d.commits;
    acc.addedLines += d.addedLines;
    acc.authors.add(d.email);
  }

  const dates = [...byDate.keys()].sort();
  return {
    commits: dates.map((dt) => byDate.get(dt)!.commits),
    addedLines: dates.map((dt) => byDate.get(dt)!.addedLines),
    authors: dates.map((dt) => byDate.get(dt)!.authors.size),
  };
}
