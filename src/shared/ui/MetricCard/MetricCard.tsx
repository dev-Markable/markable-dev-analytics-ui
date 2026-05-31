import type { ReactNode } from 'react';
import { Card, Skeleton, Typography } from 'antd';

interface MetricCardProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  trend?: ReactNode;
  hint?: ReactNode;
  /** Мини-график тренда под значением (обычно <Sparkline />). */
  sparkline?: ReactNode;
  loading?: boolean;
}

export function MetricCard({
  label,
  value,
  icon,
  trend,
  hint,
  sparkline,
  loading,
}: MetricCardProps) {
  return (
    <Card className="metric-card" variant="borderless">
      <div className="metric-card__head">
        <Typography.Text type="secondary" className="metric-card__label">
          {label}
        </Typography.Text>
        {icon && <span className="metric-card__icon">{icon}</span>}
      </div>
      <div className="metric-card__value">
        {loading ? <Skeleton.Input active size="large" style={{ width: 120 }} /> : value}
      </div>
      {(trend || hint) && !loading && (
        <div className="metric-card__foot">
          {trend}
          {hint && (
            <Typography.Text type="secondary" className="metric-card__hint">
              {hint}
            </Typography.Text>
          )}
        </div>
      )}
      {sparkline && !loading && <div className="metric-card__spark">{sparkline}</div>}
    </Card>
  );
}
