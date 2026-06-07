import type { ReactNode } from 'react';
import { Card, Typography } from 'antd';

interface SectionCardProps {
  title: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  /** Правый верхний угол шапки — обычно ExportButton. Рендерится только если передан. */
  actions?: ReactNode;
  /** Доп. класс на body (напр. `authors-table` для табличных карточек). */
  bodyClassName?: string;
  children: ReactNode;
}

/**
 * Оболочка доменной карточки: шапка (иконка + заголовок + описание + actions)
 * и body. Раньше эта разметка дублировалась 1:1 в leaderboard/authors/weekly/
 * reviews-виджетах. CSS-классы (`leaderboard-card*`) живут в глобальном
 * `shared.css` — имя историческое, по факту это generic-секция.
 */
export function SectionCard({
  title,
  icon,
  description,
  actions,
  bodyClassName,
  children,
}: SectionCardProps) {
  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          {icon && <span className="leaderboard-card__icon">{icon}</span>}
          <Typography.Title level={4} className="leaderboard-card__title-text">
            {title}
          </Typography.Title>
        </div>
        {description && (
          <Typography.Text type="secondary" className="leaderboard-card__description">
            {description}
          </Typography.Text>
        )}
        {actions && <div className="leaderboard-card__actions">{actions}</div>}
      </header>

      <div className={`leaderboard-card__body${bodyClassName ? ` ${bodyClassName}` : ''}`}>
        {children}
      </div>
    </Card>
  );
}
