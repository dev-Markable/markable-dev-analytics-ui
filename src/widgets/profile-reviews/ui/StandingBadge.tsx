import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { Standing } from '../lib/compare';
import { formatNumber } from '@/shared/lib';

const META: Record<Standing, { label: string; cls: string; icon: typeof ArrowUp }> = {
  above: { label: 'выше среднего', cls: 'standing-badge--up', icon: ArrowUp },
  around: { label: 'на уровне команды', cls: 'standing-badge--flat', icon: Minus },
  below: { label: 'ниже среднего', cls: 'standing-badge--down', icon: ArrowDown },
};

interface StandingBadgeProps {
  standing: Standing;
  teamAvg: number;
}

export function StandingBadge({ standing, teamAvg }: StandingBadgeProps) {
  const meta = META[standing];
  const Icon = meta.icon;
  return (
    <span className={`standing-badge ${meta.cls}`}>
      <Icon size={11} strokeWidth={2.25} />
      {meta.label}
      <span className="standing-badge__avg">· ср. {formatNumber(Math.round(teamAvg))}</span>
    </span>
  );
}
