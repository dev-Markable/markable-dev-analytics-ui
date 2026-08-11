import { useMemo } from 'react';
import { FolderGit2 } from 'lucide-react';
import type { DailyStat } from '@/entities/stats';
import { EmptyState, SectionCard } from '@/shared/ui';
import { formatNumber } from '@/shared/lib';
import {
  aggregateDailyDrill,
  type DrillContent,
  type DrillEnrichment,
} from '@/widgets/activity/drilldown';
import { aggregateByRepo } from '../lib/aggregate-repos';

interface ReposListProps {
  daily: readonly DailyStat[];
  enrichment: ReadonlyMap<string, DrillEnrichment>;
  onDrill: (content: DrillContent) => void;
  topN?: number;
}

/**
 * Репозитории по объёму работы.
 *
 * Раньше это была горизонтальная столбчатая диаграмма, но репозиториев обычно 2–5 —
 * график из двух баров занимал пол-экрана и не давал ничего сверх списка. Здесь строки
 * с долей и цифрами: та же информация плотнее, а клик по-прежнему открывает авторов репо.
 */
export function ReposList({ daily, enrichment, onDrill, topN = 8 }: ReposListProps) {
  const data = useMemo(() => aggregateByRepo(daily).slice(0, topN), [daily, topN]);
  const max = useMemo(() => Math.max(1, ...data.map((r) => r.nonMergeCommits)), [data]);
  const totalCommits = useMemo(
    () => data.reduce((sum, r) => sum + r.nonMergeCommits, 0),
    [data],
  );

  const openRepo = (repo: string) => {
    const rows = aggregateDailyDrill(
      daily.filter((d) => d.repo === repo),
      enrichment,
    );
    onDrill({ title: repo, subtitle: 'Авторы репозитория за период', rows });
  };

  return (
    <SectionCard
      title="Репозитории"
      icon={<FolderGit2 size={16} />}
      description="По числу не-мердж коммитов · клик — авторы репозитория"
    >
      {data.length === 0 ? (
        <EmptyState title="Нет данных" />
      ) : (
        <div className="repos-list">
          {data.map((r) => {
            const sharePct = totalCommits > 0 ? (r.nonMergeCommits / totalCommits) * 100 : 0;
            return (
              <button
                key={r.repo}
                type="button"
                className="repos-list__row"
                onClick={() => openRepo(r.repo)}
              >
                <span className="repos-list__main">
                  <span className="repos-list__name">{r.repo}</span>
                  <span className="repos-list__meta">
                    {formatNumber(r.authors)} авт. · {formatNumber(r.activeDays)} дн ·{' '}
                    +{formatNumber(r.addedLines)} / −{formatNumber(r.deletedLines)}
                  </span>
                </span>

                <span className="repos-list__track" aria-hidden>
                  <span
                    className="repos-list__fill"
                    style={{ width: `${Math.max((r.nonMergeCommits / max) * 100, 2)}%` }}
                  />
                </span>

                <span className="repos-list__value">
                  <span className="repos-list__commits">{formatNumber(r.nonMergeCommits)}</span>
                  <span className="repos-list__share">{sharePct.toFixed(0)}%</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
