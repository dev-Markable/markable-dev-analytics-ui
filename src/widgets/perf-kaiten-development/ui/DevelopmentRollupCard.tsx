import { Card, Collapse, Typography } from 'antd';
import { Layers } from 'lucide-react';
import type { DevelopmentRollup } from '@/entities/performance-review';
import { formatNumber } from '@/shared/lib';
import { RootTaskBody, RootTaskHeader } from './RootTaskPanel';

interface DevelopmentRollupCardProps {
  rollup: DevelopmentRollup;
}

const SYNTHETIC_KEY = '__synthetic__';

export function DevelopmentRollupCard({ rollup }: DevelopmentRollupCardProps) {
  const { useCaseCount, rootTaskCount, roots } = rollup;
  const isEmpty = useCaseCount === 0;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Layers size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Разработка по корневой задаче
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          {isEmpty ? (
            <>За период нет карточек разработки или задач у этого человека.</>
          ) : (
            <>
              <strong>{formatNumber(useCaseCount)}</strong> юскейсов в{' '}
              <strong>{formatNumber(rootTaskCount)}</strong> корневых задачах.
            </>
          )}
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {!isEmpty && (
          <Collapse
            accordion
            ghost
            className="root-task__collapse"
            items={roots.map((root) => {
              const synthetic = root.id == null;
              return {
                key: synthetic ? SYNTHETIC_KEY : String(root.id),
                label: <RootTaskHeader root={root} synthetic={synthetic} />,
                children: <RootTaskBody root={root} />,
              };
            })}
          />
        )}
      </div>
    </Card>
  );
}
