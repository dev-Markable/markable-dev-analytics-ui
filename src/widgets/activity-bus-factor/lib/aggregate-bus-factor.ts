import type { DailyStat } from '@/entities/stats';

export type RiskLevel = 'high' | 'medium' | 'low';

export interface RepoBusFactor {
  repo: string;
  /** Сумма не-мердж коммитов по репо. */
  totalCommits: number;
  /** Уникальных авторов в репо. */
  authorCount: number;
  /** Топ-контрибьютор и его доля коммитов [0..1]. */
  topAuthorEmail: string;
  topAuthorShare: number;
  /**
   * Bus factor — минимальное число авторов, чьи коммиты в сумме дают > 50%.
   * 1 = знания в одних руках (риск), ≥3 = распределено.
   */
  busFactor: number;
  riskLevel: RiskLevel;
}

const riskOf = (busFactor: number): RiskLevel =>
  busFactor <= 1 ? 'high' : busFactor === 2 ? 'medium' : 'low';

interface RepoAcc {
  total: number;
  authors: Map<string, number>;
}

/**
 * Считает bus factor по репозиториям из daily-статов.
 *
 * Вклад автора = не-мердж коммиты (`commits - mergeCommits`), суммированные по
 * всем дням. Bus factor = сколько топ-авторов нужно, чтобы накрыть > 50% коммитов.
 *
 * Сортировка результата: сначала по риску (high → low), внутри — по объёму
 * (крупные рисковые репо сверху — на них смотреть в первую очередь).
 * Репозитории без не-мердж коммитов отбрасываются.
 */
export function aggregateBusFactor(daily: readonly DailyStat[]): RepoBusFactor[] {
  const byRepo = new Map<string, RepoAcc>();

  for (const d of daily) {
    const nonMerge = d.commits - d.mergeCommits;
    if (nonMerge <= 0) continue;
    let acc = byRepo.get(d.repo);
    if (!acc) {
      acc = { total: 0, authors: new Map() };
      byRepo.set(d.repo, acc);
    }
    acc.total += nonMerge;
    acc.authors.set(d.email, (acc.authors.get(d.email) ?? 0) + nonMerge);
  }

  const result: RepoBusFactor[] = [];
  for (const [repo, acc] of byRepo) {
    if (acc.total === 0) continue;
    const sorted = [...acc.authors.entries()].sort((a, b) => b[1] - a[1]);
    const [topEmail, topCommits] = sorted[0]!;

    let cumulative = 0;
    let busFactor = 0;
    for (const [, commits] of sorted) {
      cumulative += commits;
      busFactor += 1;
      if (cumulative / acc.total > 0.5) break;
    }

    result.push({
      repo,
      totalCommits: acc.total,
      authorCount: acc.authors.size,
      topAuthorEmail: topEmail,
      topAuthorShare: topCommits / acc.total,
      busFactor,
      riskLevel: riskOf(busFactor),
    });
  }

  const riskRank: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
  return result.sort(
    (a, b) =>
      riskRank[a.riskLevel] - riskRank[b.riskLevel] || b.totalCommits - a.totalCommits,
  );
}
