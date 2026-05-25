import type { DailyStat } from '@/entities/stats';

export interface AuthorEnrichment {
  displayName: string | null;
  avatarUrl: string | null;
}

export interface ContributorActivity extends AuthorEnrichment {
  email: string;
  commits: number;
  nonMergeCommits: number;
  mergeCommits: number;
  addedLines: number;
  deletedLines: number;
  testAddedLines: number;
  activeDays: number;
  repos: number;
}

interface InternalAccumulator {
  email: string;
  commits: number;
  mergeCommits: number;
  addedLines: number;
  deletedLines: number;
  testAddedLines: number;
  dates: Set<string>;
  repos: Set<string>;
}

/**
 * Аггрегирует daily-статы по автору. Опциональный enrichmentByEmail
 * (из /dashboard) подмешивает displayName/avatarUrl — daily-эндпоинт
 * их не возвращает, поэтому без enrichment у всех будут только инициалы.
 */
export function aggregateByContributor(
  daily: readonly DailyStat[],
  enrichmentByEmail?: ReadonlyMap<string, AuthorEnrichment>,
): ContributorActivity[] {
  const map = new Map<string, InternalAccumulator>();

  for (const d of daily) {
    let entry = map.get(d.email);
    if (!entry) {
      entry = {
        email: d.email,
        commits: 0,
        mergeCommits: 0,
        addedLines: 0,
        deletedLines: 0,
        testAddedLines: 0,
        dates: new Set(),
        repos: new Set(),
      };
      map.set(d.email, entry);
    }
    entry.commits += d.commits;
    entry.mergeCommits += d.mergeCommits;
    entry.addedLines += d.addedLines;
    entry.deletedLines += d.deletedLines;
    entry.testAddedLines += d.testAddedLines;
    if (d.commits > 0) entry.dates.add(d.date);
    entry.repos.add(d.repo);
  }

  return Array.from(map.values())
    .map<ContributorActivity>((e) => {
      const enrich = enrichmentByEmail?.get(e.email.toLowerCase()) ?? null;
      return {
        email: e.email,
        displayName: enrich?.displayName ?? null,
        avatarUrl: enrich?.avatarUrl ?? null,
        commits: e.commits,
        nonMergeCommits: e.commits - e.mergeCommits,
        mergeCommits: e.mergeCommits,
        addedLines: e.addedLines,
        deletedLines: e.deletedLines,
        testAddedLines: e.testAddedLines,
        activeDays: e.dates.size,
        repos: e.repos.size,
      };
    })
    .sort((a, b) => b.nonMergeCommits - a.nonMergeCommits);
}
