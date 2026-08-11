import { Tooltip } from 'antd';
import { dayjs, formatNumber } from '@/shared/lib';
import { COLOR_SCALE, colorIndex } from '../config/colors';
import type { StripDay } from '../lib/build-grid';
import { CellTooltip } from './CellTooltip';

interface DayStripProps {
  days: readonly StripDay[];
  maxCommits: number;
  onSelect: (date: string) => void;
}

/**
 * Лента дней короткого периода: подпись дня недели, число, ячейка и коммиты.
 *
 * Заменяет сетку недель там, где та вырождается в одну колонку. Цветовая шкала —
 * та же, что у сетки, поэтому легенда под карточкой работает для обоих видов.
 */
export function DayStrip({ days, maxCommits, onSelect }: DayStripProps) {
  return (
    <div className="day-strip">
      {days.map((day) => {
        const clickable = day.commits > 0;
        const bg = COLOR_SCALE[colorIndex(day.commits, maxCommits)] ?? COLOR_SCALE[0];
        const d = dayjs(day.date);

        return (
          <Tooltip
            key={day.date}
            title={<CellTooltip day={day} />}
            mouseEnterDelay={0.1}
            placement="top"
            destroyTooltipOnHide
          >
            <button
              type="button"
              className={`day-strip__day${day.kind !== 'working' ? ' day-strip__day--off' : ''}${
                clickable ? ' day-strip__day--clickable' : ''
              }`}
              onClick={clickable ? () => onSelect(day.date) : undefined}
              disabled={!clickable}
              aria-label={`${d.format('D MMMM')}: ${day.commits} коммитов`}
            >
              <span className="day-strip__weekday">{d.format('dd')}</span>
              <span className="day-strip__num">{d.date()}</span>
              <span className="day-strip__cell" style={{ backgroundColor: bg }} />
              <span className="day-strip__commits">
                {day.commits > 0 ? formatNumber(day.commits) : '—'}
              </span>
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
