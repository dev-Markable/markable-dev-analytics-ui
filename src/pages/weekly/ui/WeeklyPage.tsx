import { useCallback, useMemo, useRef } from 'react';
import { Card, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { LineChart } from 'lucide-react';
import { PageHeader, PageSection, EmptyState, ErrorState, ExportButton, LoadingState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification, useNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { applyTeamFilterToWeekly, weeklyQuery } from '@/entities/stats';
import { ALL_TEAMS, matchesScope, useTeamScope } from '@/features/team-scope';
import { queryToAsyncState, useApiError } from '@/shared/api';
import type { AsyncState } from '@/shared/api';
import type { WeeklyStat } from '@/entities/stats';
import { downloadSvgAsPng, formatRange } from '@/shared/lib';
import { WeeklyChart } from '@/widgets/weekly/chart';
import { WeeklyTable } from '@/widgets/weekly/table';

export function WeeklyPage() {
  useDocumentTitle('Недели');

  const range = useDateRange();
  const weeklyQ = useQuery(weeklyQuery({ from: range.from, to: range.to }));

  const scope = useTeamScope();
  const teamEnabled = scope !== ALL_TEAMS;
  const notification = useNotification();
  const chartRef = useRef<HTMLDivElement>(null);

  const error = useApiError(weeklyQ.error);
  useApiErrorNotification(error, 'Не удалось загрузить недельную статистику');

  const retry = useCallback((): void => void weeklyQ.refetch(), [weeklyQ]);

  // Базовый AsyncState из query — далее, при необходимости, фильтруем по скопу.
  const baseState = useMemo<AsyncState<WeeklyStat[]>>(() => queryToAsyncState(weeklyQ), [weeklyQ]);

  /**
   * Если выбран конкретный скоп команды, пересчитываем per-week totals
   * из отфильтрованных авторов. WeeklyChart и WeeklyTable получают
   * уже консистентные с фильтром числа.
   */
  const filteredState = useMemo<AsyncState<WeeklyStat[]>>(() => {
    if (!teamEnabled || !baseState.data) return baseState;
    const filtered = applyTeamFilterToWeekly(baseState.data, (a) => matchesScope(a.team, scope));
    return { ...baseState, data: filtered };
  }, [baseState, teamEnabled, scope]);

  const weeks = filteredState.data ?? [];

  const handleExportPng = useCallback(async () => {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;
    try {
      await downloadSvgAsPng(svg as SVGSVGElement, `devpulse-недели_${range.from}_${range.to}.png`);
    } catch {
      notification.error({ message: 'Не удалось экспортировать график' });
    }
  }, [range.from, range.to, notification]);

  const isInitialLoading = baseState.status === 'loading' && weeks.length === 0;
  const isError = baseState.status === 'error' && weeks.length === 0;
  const isEmpty = baseState.status === 'success' && weeks.length === 0;

  const subtitle = useMemo(() => {
    const note = weeks.length > 0 ? ` · ${weeks.length} недель` : '';
    const teamNote = teamEnabled ? ` · команда «${scope}»` : '';
    return `${formatRange(range.from, range.to)}${note}${teamNote}`;
  }, [range.from, range.to, weeks.length, teamEnabled, scope]);

  return (
    <>
      <PageHeader title="Недельная статистика" subtitle={subtitle} />

      <PageSection>
        <Card variant="borderless" className="leaderboard-card">
          <header className="leaderboard-card__header">
            <div className="leaderboard-card__title">
              <span className="leaderboard-card__icon">
                <LineChart size={16} />
              </span>
              <Typography.Title level={4} className="leaderboard-card__title-text">
                Динамика по неделям
              </Typography.Title>
            </div>
            <Typography.Text type="secondary" className="leaderboard-card__description">
              Коммиты (столбцы) и добавленные строки (линия)
            </Typography.Text>
            {!isInitialLoading && !isError && !isEmpty && (
              <div className="leaderboard-card__actions">
                <ExportButton size="small" onExportPng={handleExportPng} />
              </div>
            )}
          </header>

          <div className="leaderboard-card__body" ref={chartRef}>
            {isInitialLoading && <LoadingState label="Загружаем недели" />}
            {isError && <ErrorState error={error} onRetry={retry} />}
            {isEmpty && (
              <EmptyState
                title="Нет данных"
                description={
                  teamEnabled
                    ? `В команде «${scope}» нет активности в выбранном периоде.`
                    : 'Выберите период с хотя бы одной активной неделей.'
                }
              />
            )}
            {!isInitialLoading && !isError && !isEmpty && <WeeklyChart data={weeks} />}
          </div>
        </Card>
      </PageSection>

      <PageSection>
        <WeeklyTable state={filteredState} range={range} onRetry={retry} />
      </PageSection>
    </>
  );
}
