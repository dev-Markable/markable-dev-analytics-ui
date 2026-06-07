import { Card, Tooltip, Typography } from 'antd';
import { Code2, FlaskConical } from 'lucide-react';
import type { PerformanceMetrics } from '@/entities/performance-review';
import { formatNumber } from '@/shared/lib';
import { PerfMetricTile } from '@/widgets/perf/metric-tile';
import { testRatio } from '../lib/test-ratio';

interface CodeSummaryCardProps {
  metrics: PerformanceMetrics;
}

export function CodeSummaryCard({ metrics }: CodeSummaryCardProps) {
  const added = metrics.addedLines.current;
  const deleted = metrics.deletedLines.current;
  const tests = metrics.testAddedLines.current;
  const total = added + deleted;
  const addedPct = total > 0 ? (added / total) * 100 : 0;
  const deletedPct = total > 0 ? (deleted / total) * 100 : 0;
  const testPct = testRatio(tests, added);

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Code2 size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Код
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Объём коммитов и строк за период.
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        <div className="perf-pair">
          <PerfMetricTile
            label="Коммиты"
            metric={metrics.commits}
            size="lg"
            hint={`без merge: ${formatNumber(metrics.nonMergeCommits.current)}`}
          />
          <PerfMetricTile
            label="Добавлено строк"
            metric={metrics.addedLines}
            size="lg"
            accent="primary"
          />
        </div>

        {total > 0 && (
          <div className="code-summary__split">
            <Typography.Text type="secondary" className="code-summary__split-label">
              Распределение изменённых строк
            </Typography.Text>
            <div className="code-summary__bar" role="img" aria-label="Добавлено / удалено">
              {addedPct > 0 && (
                <Tooltip title={`Добавлено: ${formatNumber(added)}`}>
                  <span
                    className="code-summary__seg code-summary__seg--added"
                    style={{ width: `${addedPct}%` }}
                  >
                    {addedPct >= 12 && `+${formatNumber(added)}`}
                  </span>
                </Tooltip>
              )}
              {deletedPct > 0 && (
                <Tooltip title={`Удалено: ${formatNumber(deleted)}`}>
                  <span
                    className="code-summary__seg code-summary__seg--deleted"
                    style={{ width: `${deletedPct}%` }}
                  >
                    {deletedPct >= 12 && `−${formatNumber(deleted)}`}
                  </span>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        <div className="code-summary__tests">
          <FlaskConical size={14} />
          <Typography.Text className="code-summary__tests-label">
            Тестовый код
          </Typography.Text>
          <Typography.Text strong className="code-summary__tests-value">
            {formatNumber(tests)} строк
          </Typography.Text>
          {testPct != null && (
            <Typography.Text type="secondary" className="code-summary__tests-hint">
              {testPct}% от добавленного
            </Typography.Text>
          )}
        </div>
      </div>
    </Card>
  );
}
