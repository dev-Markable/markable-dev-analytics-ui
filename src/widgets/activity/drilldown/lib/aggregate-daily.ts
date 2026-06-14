import type { DailyStat } from '@/entities/stats';
import { formatLinesDelta, formatNumber } from '@/shared/lib';
import type { DrillEnrichment, DrillRow } from '../model/types';

interface Acc {
  email: string;
  commits: number;
  mergeCommits: number;
  addedLines: number;
  deletedLines: number;
}

/**
 * Сводит срез daily-статов (например, по одному репо или одному дню) в строки
 * разбивки по авторам. Сортировка — по не-мердж коммитам убыванием. Имена/
 * аватары берутся из enrichment (в daily только email).
 */
export function aggregateDailyDrill(
  daily: readonly DailyStat[],
  enrichment: ReadonlyMap<string, DrillEnrichment>,
): DrillRow[] {
  const byEmail = new Map<string, Acc>();

  for (const d of daily) {
    const key = d.email.toLowerCase();
    let acc = byEmail.get(key);
    if (!acc) {
      acc = { email: d.email, commits: 0, mergeCommits: 0, addedLines: 0, deletedLines: 0 };
      byEmail.set(key, acc);
    }
    acc.commits += d.commits;
    acc.mergeCommits += d.mergeCommits;
    acc.addedLines += d.addedLines;
    acc.deletedLines += d.deletedLines;
  }

  return Array.from(byEmail.entries())
    .map<DrillRow & { _sort: number }>(([key, a]) => {
      const nonMerge = a.commits - a.mergeCommits;
      const e = enrichment.get(key);
      return {
        email: a.email,
        displayName: e?.displayName ?? null,
        avatarUrl: e?.avatarUrl ?? null,
        team: e?.team ?? null,
        isLead: e?.isLead ?? false,
        _sort: nonMerge,
        stats: [
          { label: 'Коммиты', value: formatNumber(nonMerge) },
          { label: 'Строки', value: formatLinesDelta(a.addedLines, a.deletedLines) },
        ],
      };
    })
    .sort((x, y) => y._sort - x._sort)
    .map(({ _sort, ...row }) => row);
}
