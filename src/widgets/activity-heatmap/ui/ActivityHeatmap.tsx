import { useMemo } from 'react';
import { Card, Typography } from 'antd';
import { CalendarRange } from 'lucide-react';
import type { DailyStat } from '@/entities/stats';
import { EmptyState } from '@/shared/ui';
import type { DateRange } from '@/shared/lib';
import { CELL_GAP, CELL_SIZE, CELL_STEP, COLOR_SCALE } from '../config/colors';
import { buildHeatmapGrid } from '../lib/build-grid';
import { HeatmapCell } from './HeatmapCell';

interface ActivityHeatmapProps {
  daily: readonly DailyStat[];
  range: DateRange;
}

const WEEKDAY_LABELS: readonly string[] = ['Пн', 'Ср', 'Пт'];

export function ActivityHeatmap({ daily, range }: ActivityHeatmapProps) {
  const grid = useMemo(() => buildHeatmapGrid(daily, range), [daily, range]);

  const hasData = grid.maxCommits > 0;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <CalendarRange size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Календарь активности
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Каждая ячейка — день. Цвет — число коммитов от всех авторов.
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {!hasData ? (
          <EmptyState
            title="Нет активности"
            description="За выбранный период коммитов нет."
          />
        ) : (
          <div className="heatmap-wrap">
            <div className="heatmap-scroll">
              <div
                className="heatmap-months"
                style={{ width: grid.columns * CELL_STEP }}
              >
                {grid.monthMarkers.map((m) => (
                  <span
                    key={`${m.column}-${m.label}`}
                    className="heatmap-months__label"
                    // Абсолютная привязка к колонке начала месяца: текст растёт
                    // вправо и не зависит от ширины grid-ячейки (label шире её).
                    style={{ left: m.column * CELL_STEP }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>
              <div className="heatmap-row">
                <div className="heatmap-weekdays">
                  {WEEKDAY_LABELS.map((d, i) => (
                    <span
                      key={d}
                      className="heatmap-weekdays__label"
                      style={{ gridRow: i * 2 + 1 }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <div
                  className="heatmap"
                  style={{
                    gridTemplateColumns: `repeat(${grid.columns}, ${CELL_SIZE}px)`,
                    gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                    gap: CELL_GAP,
                  }}
                >
                  {grid.cells.map((c) => (
                    <HeatmapCell key={c.date} day={c} maxCommits={grid.maxCommits} />
                  ))}
                </div>
              </div>
            </div>

            <footer className="heatmap-legend">
              <span className="heatmap-legend__caption">Меньше</span>
              {COLOR_SCALE.map((color, i) => (
                <span
                  key={i}
                  className="heatmap-legend__cell"
                  style={{ background: color }}
                />
              ))}
              <span className="heatmap-legend__caption">Больше</span>
            </footer>
          </div>
        )}
      </div>
    </Card>
  );
}
