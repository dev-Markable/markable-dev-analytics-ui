import { useMemo } from 'react';
import { Bell } from 'lucide-react';
import { Tooltip } from 'antd';
import type { AuthorActivity } from '@/entities/user';
import type { DailyStat, ReviewAuthor } from '@/entities/stats';
import type { DashboardTotals } from '@/entities/dashboard';
import type { DateRange } from '@/shared/lib';
import { formatNumber, formatPctDelta, pctChange, safeDiv } from '@/shared/lib';
import { DeltaBadge } from '@/shared/ui';
import { computeHealth } from '@/widgets/dashboard/health';
import { SignalsList, useSignalsCount } from '@/widgets/dashboard/signals';

interface OverviewCardProps {
  totals: DashboardTotals;
  prevTotals?: DashboardTotals | null;
  items: readonly AuthorActivity[];
  previous: readonly AuthorActivity[];
  daily: readonly DailyStat[];
  reviews: readonly ReviewAuthor[];
  range: DateRange;
  loading?: boolean;
}

interface Tile {
  key: string;
  value: string;
  label: string;
  hint?: string;
  tone?: 'good' | 'warn' | 'bad';
  delta?: number | null;
}

/**
 * Сводка периода + риски в одном блоке.
 *
 * Раньше это были три секции подряд (плитки, здоровье, «Требует внимания»), причём
 * половина цифр дублировалась: коммиты повторяли пульс выше, «уникальных авторов» —
 * «активных авторов», «тестовых строк %» — «долю тестового кода». Здесь дубли убраны,
 * а лента рисков переехала в правую колонку — она не требует всей ширины экрана.
 */
export function OverviewCard({
  totals,
  prevTotals,
  items,
  previous,
  daily,
  reviews,
  range,
  loading,
}: OverviewCardProps) {
  const health = useMemo(() => computeHealth(items, daily, reviews), [items, daily, reviews]);
  const signalsCount = useSignalsCount(items, previous, reviews);

  const tiles = useMemo<Tile[]>(() => {
    const byKey = (k: string) => health.find((h) => h.key === k);
    const testRatio = byKey('test-ratio');
    const reviewCoverage = byKey('review-coverage');
    const busFactor = byKey('bus-factor');
    const mergeRatio = safeDiv(totals.totalMergeCommits, totals.totalCommits) * 100;

    return [
      {
        key: 'authors',
        value: formatNumber(totals.uniqueAuthors),
        label: 'Авторов',
        hint: 'коммитили в периоде',
        tone: totals.uniqueAuthors > 0 ? 'good' : 'bad',
      },
      {
        key: 'added',
        value: formatNumber(totals.totalAddedLines),
        label: 'Строк добавлено',
        hint: `удалено: ${formatNumber(totals.totalDeletedLines)}`,
        delta: prevTotals ? pctChange(totals.totalAddedLines, prevTotals.totalAddedLines) : null,
      },
      {
        key: 'tests',
        value: testRatio?.value ?? '—',
        label: 'Тестовый код',
        hint: 'от добавленных строк',
        tone: testRatio?.tone,
      },
      {
        key: 'review',
        value: reviewCoverage?.value ?? '—',
        label: 'Участвуют в ревью',
        hint: reviewCoverage?.hint,
        tone: reviewCoverage?.tone,
      },
      {
        key: 'bus',
        value: busFactor?.value ?? '—',
        label: 'Bus factor',
        hint: 'дают половину коммитов',
        tone: busFactor?.tone,
      },
      {
        key: 'merge',
        value: formatNumber(totals.totalMergeCommits),
        label: 'Merge-коммиты',
        hint: `${mergeRatio.toFixed(1)}% от всех`,
      },
    ];
  }, [health, totals, prevTotals]);

  return (
    <section className="overview">
      <div className="overview__stats">
        {tiles.map((t) => (
          <StatTile key={t.key} tile={t} />
        ))}
      </div>

      <aside className="overview__signals">
        <header className="overview__signals-head">
          <span className="overview__signals-title">
            <Bell size={15} />
            Требует внимания
          </span>
          {signalsCount > 0 && <span className="overview__signals-count">{signalsCount}</span>}
        </header>
        <SignalsList
          current={items}
          previous={previous}
          reviews={reviews}
          range={range}
          loading={loading}
        />
      </aside>
    </section>
  );
}

function StatTile({ tile }: { tile: Tile }) {
  const body = (
    <div className="overview__tile">
      <span className="overview__tile-head">
        {tile.tone && <span className={`overview__dot overview__dot--${tile.tone}`} aria-hidden />}
        <span className="overview__tile-label">{tile.label}</span>
      </span>
      <span className="overview__tile-value">
        {tile.value}
        {tile.delta != null && <DeltaBadge value={tile.delta} format={formatPctDelta} />}
      </span>
      {tile.hint && <span className="overview__tile-hint">{tile.hint}</span>}
    </div>
  );

  return tile.hint ? <Tooltip title={tile.hint}>{body}</Tooltip> : body;
}
