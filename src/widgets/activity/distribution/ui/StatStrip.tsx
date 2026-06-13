import { Tooltip } from 'antd';
import type { DistributionStats } from '../lib/distribution';

interface StatStripProps {
  stats: DistributionStats;
  format: (n: number) => string;
}

interface Tile {
  label: string;
  value: number;
  hint: string;
  /** Акцентная плитка (медиана) — выделяем визуально. */
  accent?: boolean;
}

/**
 * Ряд числовых плиток под box-plot'ом: min / p25 / медиана / среднее / p75 /
 * p90 / max. Медиана и среднее рядом специально — расхождение между ними сразу
 * показывает скос распределения (mean ≫ median = тянут несколько STAR'ов).
 */
export function StatStrip({ stats, format }: StatStripProps) {
  const tiles: Tile[] = [
    { label: 'min', value: stats.min, hint: 'Минимум' },
    { label: 'p25', value: stats.q1, hint: 'Нижний квартиль — четверть команды ниже' },
    { label: 'медиана', value: stats.median, hint: 'Середина: половина выше, половина ниже', accent: true },
    { label: 'среднее', value: stats.mean, hint: 'Среднее арифметическое (чувствительно к выбросам)' },
    { label: 'p75', value: stats.q3, hint: 'Верхний квартиль — четверть команды выше' },
    { label: 'p90', value: stats.p90, hint: 'Топ-10% начинаются здесь' },
    { label: 'max', value: stats.max, hint: 'Максимум' },
  ];

  return (
    <div className="distribution-strip">
      {tiles.map((t) => (
        <Tooltip key={t.label} title={t.hint}>
          <div className={`distribution-strip__tile${t.accent ? ' distribution-strip__tile--accent' : ''}`}>
            <span className="distribution-strip__label">{t.label}</span>
            <span className="distribution-strip__value">{format(t.value)}</span>
          </div>
        </Tooltip>
      ))}
    </div>
  );
}
