import { Tag } from 'antd';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

type Trend = 'up' | 'down' | 'flat';

const trendOf = (value: number): Trend => (value > 0 ? 'up' : value < 0 ? 'down' : 'flat');

const TONE: Record<Trend, string> = {
  up: 'success',
  down: 'error',
  flat: 'default',
};

const IconFor: Record<Trend, typeof ArrowUpRight> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
};

interface DeltaBadgeProps {
  value: number;
  format?: (n: number) => string;
}

export function DeltaBadge({ value, format }: DeltaBadgeProps) {
  const trend = trendOf(value);
  const Icon = IconFor[trend];
  const display = format ? format(value) : String(value);
  return (
    <Tag color={TONE[trend]} bordered={false} className="delta-badge">
      <Icon size={12} strokeWidth={2.25} />
      <span>{display}</span>
    </Tag>
  );
}
