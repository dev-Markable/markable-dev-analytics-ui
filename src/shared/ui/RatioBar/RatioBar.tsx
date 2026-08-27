export type RatioTone = 'primary' | 'success' | 'error' | 'warning' | 'muted';

export interface RatioSegment {
  key: string;
  label: string;
  value: number;
  tone: RatioTone;
  /** Подпись внутри сегмента вместо процента — например «+207 063». */
  inlineLabel?: string;
}

interface RatioBarProps {
  segments: readonly RatioSegment[];
  /** Подпись над полосой. */
  caption?: string;
  /** Показывать легенду со значениями под полосой. */
  legend?: boolean;
  /** Что писать, когда сумма нулевая. */
  emptyText?: string;
}

const share = (value: number, total: number): number => (total === 0 ? 0 : value / total);

/**
 * Полоса-соотношение: сегменты пропорциональны значениям, подпись внутри.
 *
 * Один примитив вместо трёх почти одинаковых реализаций, которые разъехались по
 * perf-review: распределение добавленных и удалённых строк, «даёт ревью vs
 * получает» и firefighting vs building. У каждой была своя вёрстка, свои цвета и
 * своё поведение на нуле.
 *
 * Процент внутри сегмента прячется, когда доля мала: цифра всё равно не поместится,
 * а обрезанный текст выглядит поломкой. Значения при этом остаются в легенде.
 */
export function RatioBar({
  segments,
  caption,
  legend = true,
  emptyText = 'Нет данных за период',
}: RatioBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return <p className="ratio-bar__empty">{emptyText}</p>;
  }

  const visible = segments.filter((s) => s.value > 0);

  return (
    <div className="ratio-bar">
      {caption && <span className="ratio-bar__caption">{caption}</span>}

      <div
        className="ratio-bar__track"
        role="img"
        aria-label={visible
          .map((s) => `${s.label} ${Math.round(share(s.value, total) * 100)}%`)
          .join(', ')}
      >
        {visible.map((segment) => {
          const pct = share(segment.value, total);
          return (
            <span
              key={segment.key}
              className={`ratio-bar__seg ratio-bar__seg--${segment.tone}`}
              style={{ flexGrow: segment.value }}
            >
              {pct >= 0.12 && (
                <span className="ratio-bar__seg-label">
                  {segment.inlineLabel ?? `${Math.round(pct * 100)}%`}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {legend && (
        <div className="ratio-bar__legend">
          {visible.map((segment) => (
            <span key={segment.key} className="ratio-bar__legend-item">
              <span className={`ratio-bar__dot ratio-bar__dot--${segment.tone}`} />
              {segment.label}
              <span className="ratio-bar__legend-value">
                {Math.round(share(segment.value, total) * 100)}%
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
