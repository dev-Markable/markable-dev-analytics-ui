import type { DailyStat } from '@/entities/stats';

export interface RepoActivity {
  repo: string;
  commits: number;
  nonMergeCommits: number;
  mergeCommits: number;
  addedLines: number;
  deletedLines: number;
  testAddedLines: number;
  authors: number;
  activeDays: number;
}

interface InternalAccumulator {
  repo: string;
  commits: number;
  mergeCommits: number;
  addedLines: number;
  deletedLines: number;
  testAddedLines: number;
  authors: Set<string>;
  dates: Set<string>;
}

export function aggregateByRepo(daily: readonly DailyStat[]): RepoActivity[] {
  const map = new Map<string, InternalAccumulator>();

  for (const d of daily) {
    let entry = map.get(d.repo);
    if (!entry) {
      entry = {
        repo: d.repo,
        commits: 0,
        mergeCommits: 0,
        addedLines: 0,
        deletedLines: 0,
        testAddedLines: 0,
        authors: new Set(),
        dates: new Set(),
      };
      map.set(d.repo, entry);
    }
    entry.commits += d.commits;
    entry.mergeCommits += d.mergeCommits;
    entry.addedLines += d.addedLines;
    entry.deletedLines += d.deletedLines;
    entry.testAddedLines += d.testAddedLines;
    entry.authors.add(d.email);
    if (d.commits > 0) entry.dates.add(d.date);
  }

  return Array.from(map.values())
    .map<RepoActivity>((e) => ({
      repo: e.repo,
      commits: e.commits,
      nonMergeCommits: e.commits - e.mergeCommits,
      mergeCommits: e.mergeCommits,
      addedLines: e.addedLines,
      deletedLines: e.deletedLines,
      testAddedLines: e.testAddedLines,
      authors: e.authors.size,
      activeDays: e.dates.size,
    }))
    .sort((a, b) => b.nonMergeCommits - a.nonMergeCommits);
}
