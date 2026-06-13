import { memo } from 'react';
import { Tooltip } from 'antd';
import { dayjs } from '@/shared/lib';
import { formatNumber } from '@/shared/lib';
import { CELL_SIZE, COLOR_SCALE, OUT_OF_RANGE_COLOR, colorIndex } from '../config/colors';
import type { HeatmapDay } from '../lib/build-grid';

interface HeatmapCellProps {
  day: HeatmapDay;
  maxCommits: number;
  onSelect?: (date: string) => void;
}

function CellTooltip({ day }: { day: HeatmapDay }) {
  const dateLabel = dayjs(day.date).format('dddd, D MMMM YYYY');
  if (day.commits === 0) {
    return (
      <div className="heatmap-tooltip">
        <div className="heatmap-tooltip__title">{dateLabel}</div>
        <div className="heatmap-tooltip__sub">Нет коммитов</div>
      </div>
    );
  }
  return (
    <div className="heatmap-tooltip">
      <div className="heatmap-tooltip__title">{dateLabel}</div>
      <div className="heatmap-tooltip__row">
        <span>Коммитов</span>
        <span>
          {formatNumber(day.commits)}
          {day.mergeCommits > 0 && ` (+${day.mergeCommits} merge)`}
        </span>
      </div>
      <div className="heatmap-tooltip__row">
        <span>Авторов / репо</span>
        <span>
          {day.authors} · {day.repos}
        </span>
      </div>
      <div className="heatmap-tooltip__row">
        <span>Строк</span>
        <span>
          +{formatNumber(day.addedLines)} / −{formatNumber(day.deletedLines)}
        </span>
      </div>
    </div>
  );
}

export const HeatmapCell = memo(function HeatmapCell({
  day,
  maxCommits,
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
      }`}
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
