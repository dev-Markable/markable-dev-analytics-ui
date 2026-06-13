import { useMemo } from 'react';
import { Card, Typography } from 'antd';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FolderGit2 } from 'lucide-react';
import type { DailyStat } from '@/entities/stats';
import { EmptyState } from '@/shared/ui';
import { formatNumber, truncate } from '@/shared/lib';
import {
  aggregateDailyDrill,
  type DrillContent,
  type DrillEnrichment,
} from '@/widgets/activity/drilldown';
import { aggregateByRepo, type RepoActivity } from '../lib/aggregate-repos';

interface ReposChartProps {
  daily: readonly DailyStat[];
  enrichment: ReadonlyMap<string, DrillEnrichment>;
  onDrill: (content: DrillContent) => void;
  topN?: number;
}

const COLORS = {
  bar: 'var(--ant-color-primary)',
  axis: 'var(--ant-color-text-tertiary)',
  grid: 'var(--ant-color-split)',
} as const;

interface TooltipPayloadEntry {
  payload?: RepoActivity;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

function ChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const repo = payload[0]?.payload;
  if (!repo) return null;
  return (
    <div className="weekly-tooltip">
      <div className="weekly-tooltip__title">{repo.repo}</div>
      <ul className="weekly-tooltip__list">
        <li className="weekly-tooltip__row">
          <span className="weekly-tooltip__swatch" style={{ background: COLORS.bar }} />
          <span className="weekly-tooltip__label">Коммитов</span>
          <span className="weekly-tooltip__value">
            {formatNumber(repo.nonMergeCommits)}
            {repo.mergeCommits > 0 && ` (+${repo.mergeCommits})`}
          </span>
        </li>
        <li className="weekly-tooltip__row">
          <span className="weekly-tooltip__swatch" style={{ background: 'transparent' }} />
          <span className="weekly-tooltip__label">Авторов</span>
          <span className="weekly-tooltip__value">{formatNumber(repo.authors)}</span>
        </li>
        <li className="weekly-tooltip__row">
          <span className="weekly-tooltip__swatch" style={{ background: 'transparent' }} />
          <span className="weekly-tooltip__label">Строк</span>
          <span className="weekly-tooltip__value">
            +{formatNumber(repo.addedLines)} / −{formatNumber(repo.deletedLines)}
          </span>
        </li>
      </ul>
    </div>
  );
}

export function ReposChart({ daily, enrichment, onDrill, topN = 10 }: ReposChartProps) {
  const data = useMemo(
    () => aggregateByRepo(daily).slice(0, topN),
    [daily, topN],
  );

  const handleRepoClick = (repo: string) => {
    const rows = aggregateDailyDrill(
      daily.filter((d) => d.repo === repo),
      enrichment,
    );
    onDrill({
      title: `Репозиторий: ${repo}`,
      subtitle: `${rows.length} ${rows.length === 1 ? 'автор' : 'авторов'} в репозитории`,
      rows,
    });
  };

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <FolderGit2 size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Топ репозиториев
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          По числу не-мердж коммитов · клик — авторы репозитория
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {data.length === 0 ? (
          <EmptyState title="Нет данных" />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36 + 32)}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.grid} />
              <XAxis
                type="number"
                stroke={COLORS.axis}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="repo"
                type="category"
                stroke={COLORS.axis}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={140}
                tickFormatter={(v: string) => truncate(v, 22)}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(91, 108, 255, 0.06)' }} />
              <Bar
                dataKey="nonMergeCommits"
                radius={[0, 6, 6, 0]}
                maxBarSize={20}
                cursor="pointer"
                onClick={(d: { repo?: string }) => d.repo && handleRepoClick(d.repo)}
              >
                {data.map((d) => (
                  <Cell key={d.repo} fill={COLORS.bar} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
