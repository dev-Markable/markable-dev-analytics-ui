import { dayjs, formatNumber } from '@/shared/lib';
import type { HeatmapDay } from '../lib/build-grid';

/** Подсказка дня — общая для сетки недель и ленты дней. */
export function CellTooltip({ day }: { day: HeatmapDay }) {
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
