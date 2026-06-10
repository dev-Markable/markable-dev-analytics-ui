import type { ReactNode } from 'react';
import { MetricCard } from '@/shared/ui';

interface SummaryMetricCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  trend?: ReactNode;
  loading?: boolean;
}

export function SummaryMetricCard(props: SummaryMetricCardProps) {
  return <MetricCard {...props} />;
}
