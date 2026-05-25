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
