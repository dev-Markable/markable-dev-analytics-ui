import { Tag, Tooltip } from 'antd';
import { CalendarX, FlaskConical, TrendingDown, type LucideIcon } from 'lucide-react';
import type { Anomaly, AnomalyType } from '../lib/detect-anomalies';

const ICON: Record<AnomalyType, LucideIcon> = {
  STALE: CalendarX,
  DECLINING: TrendingDown,
  LOW_TESTS: FlaskConical,
};

interface AnomalyBadgesProps {
  anomalies: readonly Anomaly[];
}

export function AnomalyBadges({ anomalies }: AnomalyBadgesProps) {
  if (anomalies.length === 0) return null;
  return (
    <span className="anomaly-badges">
      {anomalies.map((a) => {
        const Icon = ICON[a.type];
        return (
          <Tooltip key={a.type} title={a.tooltip} mouseEnterDelay={0.2}>
            <Tag
              color={a.severity === 'error' ? 'error' : 'warning'}
              bordered={false}
              className="anomaly-badge"
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Icon size={11} strokeWidth={2} />
                {a.label}
              </span>
            </Tag>
          </Tooltip>
        );
      })}
    </span>
  );
}
