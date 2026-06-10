import { Typography } from 'antd';
import type { ReactNode } from 'react';
import type { CycleTime } from '@/entities/performance-review';
import { formatDays } from '../lib/format-days';

interface CycleTimeSectionProps {
  title: string;
  icon: ReactNode;
  cycle: CycleTime;
}

/** Одна секция «N карточек / медиана / среднее». Скрывает себя пустой текстом. */
export function CycleTimeSection({ title, icon, cycle }: CycleTimeSectionProps) {
  const { medianDays, meanDays, count } = cycle;
  const isEmpty = count === 0 || (medianDays == null && meanDays == null);

  return (
    <div className="cycle-time-section">
      <div className="cycle-time-section__head">
        <span className="cycle-time-section__icon">{icon}</span>
        <Typography.Text strong className="cycle-time-section__title">
          {title}
        </Typography.Text>
        {!isEmpty && (
          <Typography.Text type="secondary" className="cycle-time-section__count">
            по {count} {count === 1 ? 'карточке' : 'карточкам'}
          </Typography.Text>
        )}
      </div>

      {isEmpty ? (
        <Typography.Text type="secondary" className="cycle-time-section__empty">
          Нет данных за период.
        </Typography.Text>
      ) : (
        <div className="cycle-time-section__values">
          <div className="cycle-time-section__metric cycle-time-section__metric--primary">
            <span className="cycle-time-section__label">Медиана</span>
            <span className="cycle-time-section__value">{formatDays(medianDays)}</span>
          </div>
          <div className="cycle-time-section__metric">
            <span className="cycle-time-section__label">Среднее</span>
            <span className="cycle-time-section__value">{formatDays(meanDays)}</span>
            <span className="cycle-time-section__hint">подвержено выбросам</span>
          </div>
        </div>
      )}
    </div>
  );
}
