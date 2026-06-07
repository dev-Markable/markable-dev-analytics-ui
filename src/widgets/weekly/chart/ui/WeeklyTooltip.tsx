import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { formatNumber } from '@/shared/lib';
import { CHART_COLORS } from '../config/series';

const SERIES_LABELS: Record<string, string> = {
  nonMerge: 'Не-мердж',
  merge: 'Merge',
  addedLines: 'Добавлено строк',
};

const SERIES_COLORS: Record<string, string> = {
  nonMerge: CHART_COLORS.nonMerge,
  merge: CHART_COLORS.merge,
  addedLines: CHART_COLORS.addedLines,
};

export function WeeklyTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="weekly-tooltip">
      <div className="weekly-tooltip__title">{label}</div>
      <ul className="weekly-tooltip__list">
        {payload.map((entry) => {
          const key = entry.dataKey as string;
          const value = typeof entry.value === 'number' ? entry.value : null;
          return (
            <li key={key} className="weekly-tooltip__row">
              <span
                className="weekly-tooltip__swatch"
                style={{ background: SERIES_COLORS[key] ?? entry.color }}
              />
              <span className="weekly-tooltip__label">{SERIES_LABELS[key] ?? key}</span>
              <span className="weekly-tooltip__value">{formatNumber(value)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
