import { Card, Typography } from 'antd';
import { Timer } from 'lucide-react';
import type { CycleTime } from '@/entities/performance-review';
import { formatDays } from '../lib/format-days';

interface CycleTimeCardProps {
  cycle: CycleTime;
}

export function CycleTimeCard({ cycle }: CycleTimeCardProps) {
  const { medianDays, meanDays, count } = cycle;
  const isEmpty = count === 0 || (medianDays == null && meanDays == null);

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
          От первого перехода «в работу» до «готово» по закрытым в периоде карточкам.
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {isEmpty ? (
          <Typography.Text type="secondary">
            Нет данных за период — никто из карточек не дошёл «в работу → готово».
          </Typography.Text>
        ) : (
          <div className="cycle-time">
            <div className="cycle-time__primary">
              <span className="cycle-time__label">Медиана</span>
              <span className="cycle-time__value">{formatDays(medianDays)}</span>
              <span className="cycle-time__hint">
                по {count} {count === 1 ? 'карточке' : 'карточкам'}
              </span>
            </div>
            <div className="cycle-time__secondary">
              <span className="cycle-time__label">Среднее</span>
              <span className="cycle-time__value">{formatDays(meanDays)}</span>
              <span className="cycle-time__hint">подвержено выбросам</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
