import { memo } from 'react';
import { Tooltip } from 'antd';
import { CELL_SIZE, COLOR_SCALE, OUT_OF_RANGE_COLOR, colorIndex } from '../config/colors';
import { CellTooltip } from './CellTooltip';
import type { HeatmapDay } from '../lib/build-grid';

interface HeatmapCellProps {
  day: HeatmapDay;
  maxCommits: number;
  /** Сегодняшний день получает контур — точку «мы здесь» на длинной сетке. */
  isToday?: boolean;
  onSelect?: (date: string) => void;
}

export const HeatmapCell = memo(function HeatmapCell({
  day,
  maxCommits,
  isToday,
  onSelect,
}: HeatmapCellProps) {
  const bg = day.outOfRange
    ? OUT_OF_RANGE_COLOR
    : (COLOR_SCALE[colorIndex(day.commits, maxCommits)] ?? COLOR_SCALE[0]);

  // Кликабельны только дни в диапазоне с активностью — иначе drill будет пустой.
  const clickable = !day.outOfRange && day.commits > 0 && Boolean(onSelect);

  const cell = (
    <div
      className={`heatmap__cell${day.outOfRange ? ' heatmap__cell--muted' : ''}${
        clickable ? ' heatmap__cell--clickable' : ''
      }${isToday && !day.outOfRange ? ' heatmap__cell--today' : ''}`}
      style={{
        gridColumn: day.column + 1,
        gridRow: day.weekday + 1,
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: bg,
      }}
      aria-label={`${day.date}: ${day.commits} коммитов`}
      onClick={clickable ? () => onSelect?.(day.date) : undefined}
    />
  );

  // Tooltips только на ячейках в пределах диапазона, чтобы не плодить пустые подсказки
  if (day.outOfRange) return cell;
  return (
    <Tooltip
      title={<CellTooltip day={day} />}
      mouseEnterDelay={0.1}
      placement="top"
      destroyTooltipOnHide
    >
      {cell}
    </Tooltip>
  );
});
