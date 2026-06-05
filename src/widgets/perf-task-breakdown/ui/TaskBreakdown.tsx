import { Card, Typography } from 'antd';
import { Bug, Code } from 'lucide-react';
import type { TaskStatusCounts, TaskTypeBreakdown } from '@/entities/performance-review';
import { formatNumber } from '@/shared/lib';

interface TaskBreakdownProps {
  breakdown: TaskTypeBreakdown;
}

interface RowProps {
  icon: React.ReactNode;
  label: string;
  counts: TaskStatusCounts;
  color: string;
}

function Row({ icon, label, counts, color }: RowProps) {
  const total = counts.total || 1;
  const inProgressPct = (counts.inProgress / total) * 100;
  const donePct = (counts.done / total) * 100;
  // Остальное (total − inProgress − done) — прочие статусы (бэклог/новые).
  const otherPct = Math.max(0, 100 - inProgressPct - donePct);

  return (
    <div className="task-breakdown__row">
      <div className="task-breakdown__head">
        <span className="task-breakdown__label">
          {icon}
          {label}
        </span>
        <Typography.Text type="secondary" className="task-breakdown__total">
          {formatNumber(counts.total)} всего
        </Typography.Text>
      </div>
      <div className="task-breakdown__bar" role="img" aria-label={`${label}: ${counts.inProgress} в работе, ${counts.done} закрыто`}>
        {counts.done > 0 && (
          <span
            className="task-breakdown__seg"
            style={{ width: `${donePct}%`, background: 'var(--ant-color-success)' }}
          />
        )}
        {counts.inProgress > 0 && (
          <span
            className="task-breakdown__seg"
            style={{ width: `${inProgressPct}%`, background: color }}
          />
        )}
        {otherPct > 0 && (
          <span
            className="task-breakdown__seg"
            style={{ width: `${otherPct}%`, background: 'var(--ant-color-fill-tertiary)' }}
          />
        )}
      </div>
      <div className="task-breakdown__legend">
        <span>
          <i style={{ background: 'var(--ant-color-success)' }} /> закрыто {counts.done}
        </span>
        <span>
          <i style={{ background: color }} /> в работе {counts.inProgress}
        </span>
        {otherPct > 0 && (
          <span>
            <i style={{ background: 'var(--ant-color-fill-tertiary)' }} /> прочее{' '}
            {counts.total - counts.inProgress - counts.done}
          </span>
        )}
      </div>
    </div>
  );
}

export function TaskBreakdown({ breakdown }: TaskBreakdownProps) {
  const empty = breakdown.defect.total === 0 && breakdown.development.total === 0;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Bug size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Задачи Kaiten
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          По текущему состоянию карточек: дефекты и задачи на разработку
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {empty ? (
          <Typography.Text type="secondary">
            За период нет карточек Kaiten у этого человека.
          </Typography.Text>
        ) : (
          <div className="task-breakdown">
            <Row
              icon={<Bug size={14} />}
              label="Дефекты"
              counts={breakdown.defect}
              color="var(--ant-color-error)"
            />
            <Row
              icon={<Code size={14} />}
              label="Разработка"
              counts={breakdown.development}
              color="var(--ant-color-primary)"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
