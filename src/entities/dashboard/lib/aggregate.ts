import type { AuthorActivity } from '@/entities/user';

export interface DashboardTotals {
  totalCommits: number;
  totalNonMergeCommits: number;
  totalMergeCommits: number;
  totalAddedLines: number;
  totalDeletedLines: number;
  totalTestAddedLines: number;
  uniqueAuthors: number;
}

export const EMPTY_TOTALS: DashboardTotals = {
  totalCommits: 0,
  totalNonMergeCommits: 0,
  totalMergeCommits: 0,
  totalAddedLines: 0,
  totalDeletedLines: 0,
  totalTestAddedLines: 0,
  uniqueAuthors: 0,
};

export function aggregateAuthors(items: readonly AuthorActivity[]): DashboardTotals {
  if (items.length === 0) return EMPTY_TOTALS;
  return items.reduce<DashboardTotals>(
    (acc, a) => ({
      totalCommits: acc.totalCommits + a.commits,
      totalNonMergeCommits: acc.totalNonMergeCommits + a.nonMergeCommits,
      totalMergeCommits: acc.totalMergeCommits + a.mergeCommits,
      totalAddedLines: acc.totalAddedLines + a.addedLines,
      totalDeletedLines: acc.totalDeletedLines + a.deletedLines,
      totalTestAddedLines: acc.totalTestAddedLines + a.testAddedLines,
      uniqueAuthors: acc.uniqueAuthors + 1,
    }),
    EMPTY_TOTALS,
  );
}
