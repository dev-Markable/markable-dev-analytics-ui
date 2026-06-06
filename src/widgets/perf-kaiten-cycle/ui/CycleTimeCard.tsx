import { Card, Typography } from 'antd';
import { Bug, Code, Timer } from 'lucide-react';
import type { CycleTimeBreakdown } from '@/entities/performance-review';
import { CycleTimeSection } from './CycleTimeSection';

interface CycleTimeCardProps {
  cycle: CycleTimeBreakdown;
}

export function CycleTimeCard({ cycle }: CycleTimeCardProps) {
  const { defects, development } = cycle;
  const isEmpty = defects.count === 0 && development.count === 0;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Timer size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Cycle-time
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          От первого перехода «в работу» до «готово». Дефекты и разработка считаются раздельно — длительность у них разная.
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {isEmpty ? (
          <Typography.Text type="secondary">
            Нет закрытых карточек за период — нечего показывать.
          </Typography.Text>
        ) : (
          <div className="cycle-time">
            <CycleTimeSection
              title="Дефекты"
              icon={<Bug size={14} />}
              cycle={defects}
            />
            <CycleTimeSection
              title="Разработка"
              icon={<Code size={14} />}
              cycle={development}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
