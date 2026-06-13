import { useMemo } from 'react';
import { Card, Tooltip, Typography } from 'antd';
import { Clock } from 'lucide-react';
import type { HourlyStats } from '@/entities/stats';
import type { AsyncState } from '@/shared/api';
import { AsyncContent, EmptyState } from '@/shared/ui';
import { formatNumber } from '@/shared/lib';
import {
  buildHourlyGrid,
  intensityLevel,
  WEEKDAY_LABELS,
} from '../lib/build-hourly-grid';
import { HOURLY_CELL, HOURLY_COLOR_SCALE, HOURLY_GAP } from '../config/colors';

interface HourlyHeatmapProps {
  state: AsyncState<HourlyStats>;
  /** Подпись в шапке: командный / по автору. */
  title?: string;
}

// Подписи часов — каждые 3 часа, чтобы не сливалось.
const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21];

/**
 * Скелетон сетки 7×24 точь-в-точь по размерам реального heatmap — карточка
 * держит высоту, страница не прыгает при загрузке / смене команды.
 */
function HourlySkeleton() {
  return (
    <div className="hourly" aria-hidden>
      <div className="hourly__scroll">
        <div
          className="hourly__hours"
          style={{
            marginLeft: 28,
            gridTemplateColumns: `repeat(24, ${HOURLY_CELL}px)`,
            gap: HOURLY_GAP,
          }}
        />
        {Array.from({ length: 7 }).map((_, weekday) => (
          <div className="hourly__row" key={weekday}>
            <span className="hourly__day-label">{WEEKDAY_LABELS[weekday]}</span>
            <div
              className="hourly__cells"
              style={{
                gridTemplateColumns: `repeat(24, ${HOURLY_CELL}px)`,
                gridAutoRows: `${HOURLY_CELL}px`,
                gap: HOURLY_GAP,
              }}
            >
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="hourly__cell hourly__cell--skeleton" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HourlyHeatmap({ state, title = 'Активность по часам' }: HourlyHeatmapProps) {
  const grid = useMemo(() => buildHourlyGrid(state.data), [state.data]);

  const peakLabel = grid.peak
    ? `${WEEKDAY_LABELS[grid.peak.weekday]} ${String(grid.peak.hour).padStart(2, '0')}:00 · ${formatNumber(grid.peak.commits)} коммитов`
    : null;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Clock size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            {title}
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          {peakLabel ? `Пик: ${peakLabel}` : 'День недели × час суток'}
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        <AsyncContent
          status={state.status}
          isEmpty={grid.totalCommits === 0}
          hasData={grid.totalCommits > 0}
          error={state.error}
          errorTitle="Не удалось загрузить почасовую активность"
          skeleton={<HourlySkeleton />}
          empty={
            <EmptyState title="Нет активности" description="За выбранный период коммитов нет." />
          }
        >
          <div className="hourly">
            <div className="hourly__scroll">
              {/* шкала часов сверху */}
              <div
                className="hourly__hours"
                style={{
                  marginLeft: 28,
                  gridTemplateColumns: `repeat(24, ${HOURLY_CELL}px)`,
                  gap: HOURLY_GAP,
                }}
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <span key={h} className="hourly__hour-label" style={{ gridColumn: h + 1 }}>
                    {HOUR_TICKS.includes(h) ? h : ''}
                  </span>
                ))}
              </div>

              {grid.rows.map((row, weekday) => (
                <div className="hourly__row" key={weekday}>
                  <span className="hourly__day-label">{WEEKDAY_LABELS[weekday]}</span>
                  <div
                    className="hourly__cells"
                    style={{
                      gridTemplateColumns: `repeat(24, ${HOURLY_CELL}px)`,
                      gridAutoRows: `${HOURLY_CELL}px`,
                      gap: HOURLY_GAP,
                    }}
                  >
                    {row.map((cell) => {
                      const bg = HOURLY_COLOR_SCALE[intensityLevel(cell.commits, grid.maxCommits)];
                      const node = (
                        <div
                          className="hourly__cell"
                          style={{ backgroundColor: bg }}
                          aria-label={`${WEEKDAY_LABELS[weekday]} ${cell.hour}:00 — ${cell.commits}`}
                        />
                      );
                      if (cell.commits === 0) return <div key={cell.hour}>{node}</div>;
                      return (
                        <Tooltip
                          key={cell.hour}
                          mouseEnterDelay={0.1}
                          destroyTooltipOnHide
                          title={
                            <div className="heatmap-tooltip">
                              <div className="heatmap-tooltip__title">
                                {WEEKDAY_LABELS[weekday]}, {String(cell.hour).padStart(2, '0')}:00
                              </div>
                              <div className="heatmap-tooltip__row">
                                <span>Коммитов</span>
                                <span>{formatNumber(cell.commits)}</span>
                              </div>
                              {cell.addedLines > 0 && (
                                <div className="heatmap-tooltip__row">
                                  <span>Добавлено</span>
                                  <span>{formatNumber(cell.addedLines)}</span>
                                </div>
                              )}
                            </div>
                          }
                        >
                          {node}
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}

              <footer className="heatmap-legend" style={{ marginLeft: 28 }}>
                <span className="heatmap-legend__caption">Меньше</span>
                {HOURLY_COLOR_SCALE.map((color, i) => (
                  <span key={i} className="heatmap-legend__cell" style={{ background: color }} />
                ))}
                <span className="heatmap-legend__caption">Больше</span>
              </footer>
            </div>
          </div>
        </AsyncContent>
      </div>
    </Card>
  );
}
