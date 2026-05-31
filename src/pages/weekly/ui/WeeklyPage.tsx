import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Card, Typography } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { LineChart } from 'lucide-react';
import { PageHeader, PageSection, EmptyState, ErrorState, ExportButton, LoadingState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification, useNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { applyTeamFilterToWeekly, useWeeklyStore } from '@/entities/stats';
import { useTeamFilterStore, useTeamMembersStore } from '@/features/team-filter';
import type { AsyncState } from '@/shared/api';
import type { WeeklyStat } from '@/entities/stats';
import { downloadSvgAsPng, formatRange } from '@/shared/lib';
import { WeeklyChart } from '@/widgets/weekly-chart';
import { WeeklyTable } from '@/widgets/weekly-table';

export function WeeklyPage() {
  useDocumentTitle('Недели');

  const range = useDateRange();
  const state = useWeeklyStore(useShallow((s) => s.state));
  const fetchWeekly = useWeeklyStore((s) => s.fetch);

  const teamEnabled = useTeamFilterStore((s) => s.enabled);
  const members = useTeamMembersStore((s) => s.members);
  const notification = useNotification();
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetchWeekly({ from: range.from, to: range.to });
  }, [range.from, range.to, fetchWeekly]);

  useApiErrorNotification(state.error, 'Не удалось загрузить недельную статистику');

  const retry = useCallback(
    (): void => void fetchWeekly({ from: range.from, to: range.to }),
    [fetchWeekly, range.from, range.to],
  );

  /**
   * Если team-filter включён, пересчитываем per-week totals из
   * отфильтрованных авторов. WeeklyChart и WeeklyTable получают
   * уже консистентные с фильтром числа.
   */
  const filteredState = useMemo<AsyncState<WeeklyStat[]>>(() => {
    if (!teamEnabled || !state.data) return state;
    const memberSet = new Set(members.map((m) => m.toLowerCase()));
    const isMember = (email: string): boolean => memberSet.has(email.toLowerCase());
    const filtered = applyTeamFilterToWeekly(state.data, isMember);
    return { ...state, data: filtered };
  }, [state, teamEnabled, members]);

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

  const isInitialLoading = state.status === 'loading' && weeks.length === 0;
  const isError = state.status === 'error' && weeks.length === 0;
  const isEmpty = state.status === 'success' && weeks.length === 0;

  const subtitle = useMemo(() => {
    const note = weeks.length > 0 ? ` · ${weeks.length} недель` : '';
    const teamNote = teamEnabled ? ' · только команда' : '';
    return `${formatRange(range.from, range.to)}${note}${teamNote}`;
  }, [range.from, range.to, weeks.length, teamEnabled]);

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
            {isError && <ErrorState error={state.error} onRetry={retry} />}
            {isEmpty && (
              <EmptyState
                title="Нет данных"
                description={
                  teamEnabled
                    ? 'В команде нет активности в выбранном периоде.'
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

