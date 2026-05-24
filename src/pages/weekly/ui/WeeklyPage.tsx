import { useCallback, useEffect, useMemo } from 'react';
import { Card, Typography } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { LineChart } from 'lucide-react';
import { PageHeader, PageSection, EmptyState, ErrorState, LoadingState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { useWeeklyStore } from '@/entities/stats';
import { formatRange } from '@/shared/lib';
import { WeeklyChart } from '@/widgets/weekly-chart';
import { WeeklyTable } from '@/widgets/weekly-table';

export function WeeklyPage() {
  useDocumentTitle('Недели');

  const range = useDateRange();
  const state = useWeeklyStore(useShallow((s) => s.state));
  const fetchWeekly = useWeeklyStore((s) => s.fetch);

  useEffect(() => {
    void fetchWeekly({ from: range.from, to: range.to });
  }, [range.from, range.to, fetchWeekly]);

  useApiErrorNotification(state.error, 'Не удалось загрузить недельную статистику');

  const retry = useCallback(
    (): void => void fetchWeekly({ from: range.from, to: range.to }),
    [fetchWeekly, range.from, range.to],
  );

  const weeks = state.data ?? [];
  const isInitialLoading = state.status === 'loading' && weeks.length === 0;
  const isError = state.status === 'error' && weeks.length === 0;
  const isEmpty = state.status === 'success' && weeks.length === 0;

  const subtitle = useMemo(() => {
    const note = weeks.length > 0 ? ` · ${weeks.length} недель` : '';
    return `${formatRange(range.from, range.to)}${note}`;
  }, [range.from, range.to, weeks.length]);

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
          </header>

          <div className="leaderboard-card__body">
            {isInitialLoading && <LoadingState label="Загружаем недели" />}
            {isError && <ErrorState error={state.error} onRetry={retry} />}
            {isEmpty && (
              <EmptyState
                title="Нет данных"
                description="Выберите период с хотя бы одной активной неделей."
              />
            )}
            {!isInitialLoading && !isError && !isEmpty && <WeeklyChart data={weeks} />}
          </div>
        </Card>
      </PageSection>

      <PageSection>
        <WeeklyTable state={state} range={range} onRetry={retry} />
      </PageSection>
    </>
  );
}
