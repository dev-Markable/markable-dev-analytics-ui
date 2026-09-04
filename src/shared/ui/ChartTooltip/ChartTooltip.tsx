import type { ReactNode } from 'react';
import './styles.css';

export interface ChartTooltipRow {
  label: ReactNode;
  value: ReactNode;
  /** Цвет-образец серии. Без него строка рисуется без квадратика. */
  swatch?: string;
  /** Второстепенная строка — приглушается (например, «из них merge»). */
  muted?: boolean;
}

interface ChartTooltipProps {
  title?: ReactNode;
  rows: readonly ChartTooltipRow[];
  /** Подпись внизу мелким шрифтом (подсказка, единицы). */
  footer?: ReactNode;
}

/**
 * Единый тултип для всех графиков приложения.
 *
 * До этого в проекте жило пять почти одинаковых реализаций (по одной в repos,
 * distribution, review-concentration, pulse и heatmap) с разной вёрсткой и стилями.
 * Здесь одна разметка и один визуальный язык: заголовок, строки «образец · подпись ·
 * значение», опциональный футер.
 */
export function ChartTooltip({ title, rows, footer }: ChartTooltipProps) {
  return (
    <div className="chart-tooltip">
      {title && <div className="chart-tooltip__title">{title}</div>}
      <ul className="chart-tooltip__list">
        {rows.map((row, i) => (
          <li
            key={i}
            className={`chart-tooltip__row${row.muted ? ' chart-tooltip__row--muted' : ''}`}
          >
            {row.swatch && (
              <span className="chart-tooltip__swatch" style={{ background: row.swatch }} />
            )}
            <span className="chart-tooltip__label">{row.label}</span>
            <span className="chart-tooltip__value">{row.value}</span>
          </li>
        ))}
      </ul>
      {footer && <div className="chart-tooltip__footer">{footer}</div>}
    </div>
  );
}
