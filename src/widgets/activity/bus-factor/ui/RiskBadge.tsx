import { Tag } from 'antd';
import { AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { RiskLevel } from '../lib/aggregate-bus-factor';

const META: Record<RiskLevel, { label: string; color: string; icon: typeof AlertTriangle }> = {
  high: { label: 'Высокий риск', color: 'error', icon: AlertTriangle },
  medium: { label: 'Средний', color: 'warning', icon: ShieldAlert },
  low: { label: 'Низкий', color: 'success', icon: ShieldCheck },
};

export function RiskBadge({ level, busFactor }: { level: RiskLevel; busFactor: number }) {
  const meta = META[level];
  const Icon = meta.icon;
  return (
    <Tag color={meta.color} bordered={false} className="risk-badge">
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Icon size={12} strokeWidth={2} />
        {meta.label} · BF {busFactor}
      </span>
    </Tag>
  );
}
