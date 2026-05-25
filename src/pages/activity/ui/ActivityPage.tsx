import { useCallback, useEffect, useMemo } from 'react';
import { Col, Row } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { PageHeader, PageSection, ErrorState, LoadingState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { useDailyStore } from '@/entities/stats';
import { formatRange, rangeDays } from '@/shared/lib';
import { ActivitySummary } from '@/widgets/activity-summary';
import { ActivityHeatmap } from '@/widgets/activity-heatmap';
import { ReposChart } from '@/widgets/activity-repos';
import { ContributorsList } from '@/widgets/activity-contributors';

export function ActivityPage() {
  useDocumentTitle('Активность');

  const range = useDateRange();
  const state = useDailyStore(useShallow((s) => s.state));
  const fetchDaily = useDailyStore((s) => s.fetch);

  useEffect(() => {
    void fetchDaily({ from: range.from, to: range.to });
  }, [range.from, range.to, fetchDaily]);

  useApiErrorNotification(state.error, 'Не удалось загрузить активность');

  const retry = useCallback((): void => {
    void fetchDaily({ from: range.from, to: range.to });
  }, [fetchDaily, range.from, range.to]);

  const daily = state.data ?? [];
  const isInitialLoading = state.status === 'loading' && daily.length === 0;
  const isInitialError = state.status === 'error' && daily.length === 0;

  const daysInRange = useMemo(() => rangeDays(range), [range]);

  const subtitle = `${formatRange(range.from, range.to)} · ${daysInRange} ${daysInRange === 1 ? 'день' : 'дней'}`;

  if (isInitialLoading) {
    return (
      <>
        <PageHeader title="Активность" subtitle={subtitle} />
        <LoadingState label="Загружаем daily-агрегаты" />
      </>
    );
  }

  if (isInitialError) {
    return (
      <>
        <PageHeader title="Активность" subtitle={subtitle} />
        <ErrorState error={state.error} onRetry={retry} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Активность" subtitle={subtitle} />

      <PageSection>
        <ActivitySummary daily={daily} daysInRange={daysInRange} />
      </PageSection>

      <PageSection>
        <ActivityHeatmap daily={daily} range={range} />
      </PageSection>

      <PageSection>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <ReposChart daily={daily} />
          </Col>
          <Col xs={24} xl={12}>
            <ContributorsList daily={daily} range={range} />
          </Col>
        </Row>
      </PageSection>
    </>
  );
}
