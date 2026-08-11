import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

/** Положение метрики относительно команды. ±15% вокруг среднего — «на уровне». */
export type Standing = 'above' | 'around' | 'below';

const STANDING_META: Record<Standing, { label: string; cls: string; icon: typeof ArrowUp }> = {
  above: { label: 'выше среднего', cls: 'stat-tile__standing--up', icon: ArrowUp },
  around: { label: 'на уровне команды', cls: 'stat-tile__standing--flat', icon: Minus },
  below: { label: 'ниже среднего', cls: 'stat-tile__standing--down', icon: ArrowDown },
};

export interface StatTileComparison {
  standing: Standing;
  /** Готовая подпись среднего — «14», «12.4%», «38 строк». Формат знает вызывающий. */
  avgLabel: string;
}

interface StatTileProps {
  value: ReactNode;
  label: string;
  hint?: ReactNode;
  /** Сравнение с командой. Без него плитка — просто цифра. */
  comparison?: StatTileComparison;
}

/**
 * Плитка метрики: цифра, подпись, пояснение и (опционально) положение относительно
 * команды.
 *
 * Единый примитив для «Кода» и «Ревью» в профиле: раньше эти два блока стояли друг
 * под другом с разной вёрсткой плиток — ревью со своей разметкой, код через
 * MetricCard (иконка в углу, лейбл сверху). На одной странице это читалось как
 * два разных дизайна.
 *
 * Цифра без сравнения мало что сообщает: «80.8% тестового кода» — это хорошо или
 * плохо? Поэтому бейдж — часть примитива, а не украшение поверх него.
 */
export function StatTile({ value, label, hint, comparison }: StatTileProps) {
  return (
    <div className="stat-tile">
      <div className="stat-tile__head">
        <span className="stat-tile__value">{value}</span>
        <span className="stat-tile__label">{label}</span>
      </div>
      {hint && <span className="stat-tile__hint">{hint}</span>}
      {comparison && <StandingBadge {...comparison} />}
    </div>
  );
}

function StandingBadge({ standing, avgLabel }: StatTileComparison) {
  const meta = STANDING_META[standing];
  const Icon = meta.icon;
  return (
    <span className={`stat-tile__standing ${meta.cls}`}>
      <Icon size={11} strokeWidth={2.25} />
      {meta.label}
      <span className="stat-tile__standing-avg">· ср. {avgLabel}</span>
    </span>
  );
}
