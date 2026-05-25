import type { ReactElement } from 'react';
import { Tag, Tooltip } from 'antd';
import { Activity, PauseCircle, Sparkles, Zap } from 'lucide-react';
import type { ActivityCategory, ActivityScore } from '../model/types';

interface CategoryMeta {
  label: string;
  color: string;
  icon: ReactElement;
}

const CATEGORY_META: Record<ActivityCategory, CategoryMeta> = {
  INACTIVE: {
    label: 'Неактивен',
    color: 'default',
    icon: <PauseCircle size={12} strokeWidth={2} />,
  },
  BELOW_AVERAGE: {
    label: 'Ниже среднего',
    color: 'warning',
    icon: <Activity size={12} strokeWidth={2} />,
  },
  ACTIVE: {
    label: 'Активен',
    color: 'success',
    icon: <Zap size={12} strokeWidth={2} />,
  },
  STAR: {
    label: 'Топ',
    color: 'processing',
    icon: <Sparkles size={12} strokeWidth={2} />,
  },
};

function ScoreTooltipContent({ activity }: { activity: ActivityScore }) {
  const meta = CATEGORY_META[activity.category];
  return (
    <div className="activity-tooltip">
      <div className="activity-tooltip__title">
        {meta.label} · {activity.score.toFixed(2)}
      </div>
      <div className="activity-tooltip__row">
        <span>Объём</span>
        <span>{activity.volumeFactor.toFixed(2)}</span>
      </div>
      <div className="activity-tooltip__row">
        <span>Качество</span>
        <span>{activity.qualityFactor.toFixed(2)}</span>
      </div>
      <div className="activity-tooltip__row">
        <span>Avg строк/коммит</span>
        <span>{activity.avgLinesPerCommit.toFixed(1)}</span>
      </div>
      <div className="activity-tooltip__hint">1.0 ≈ норма команды</div>
    </div>
  );
}

interface ActivityBadgeProps {
  activity: ActivityScore;
  /** В compact-режиме показываем только иконку + score, без label. */
  compact?: boolean;
}

export function ActivityBadge({ activity, compact = false }: ActivityBadgeProps) {
  const meta = CATEGORY_META[activity.category];
  return (
    <Tooltip
      title={<ScoreTooltipContent activity={activity} />}
      mouseEnterDelay={0.2}
      placement="top"
    >
      <Tag color={meta.color} bordered={false} className="activity-badge">
        <span className="activity-badge__inner">
          {meta.icon}
          {!compact && <span className="activity-badge__label">{meta.label}</span>}
          <span className="activity-badge__score">{activity.score.toFixed(2)}</span>
        </span>
      </Tag>
    </Tooltip>
  );
}
