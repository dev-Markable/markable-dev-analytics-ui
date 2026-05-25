import { useCallback, useEffect, useMemo } from 'react';
import { Col, Row } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { PageHeader, PageSection, ErrorState, LoadingState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { useDailyStore } from '@/entities/stats';
import { useDashboardStore } from '@/entities/dashboard';
import { useTeamFilterStore, useTeamMembersStore } from '@/features/team-filter';
import { formatRange, rangeDays } from '@/shared/lib';
import { ActivitySummary } from '@/widgets/activity-summary';
import { ActivityHeatmap } from '@/widgets/activity-heatmap';
import { ReposChart } from '@/widgets/activity-repos';
import { ContributorsList } from '@/widgets/activity-contributors';
import type { AuthorEnrichment } from '@/widgets/activity-contributors/lib/aggregate-contributors';

export function ActivityPage() {
  useDocumentTitle('Активность');

  const range = useDateRange();
  const dailyState = useDailyStore(useShallow((s) => s.state));
  const fetchDaily = useDailyStore((s) => s.fetch);

  // /dashboard тянем параллельно — только из-за displayName/avatarUrl.
  // Daily-эндпоинт enrichment не возвращает (см. API.md).
  const dashboardData = useDashboardStore((s) => s.state.data);
  const fetchDashboard = useDashboardStore((s) => s.fetch);

  const teamEnabled = useTeamFilterStore((s) => s.enabled);
  const members = useTeamMembersStore((s) => s.members);

  useEffect(() => {
    void fetchDaily({ from: range.from, to: range.to });
    void fetchDashboard({ from: range.from, to: range.to });
  }, [range.from, range.to, fetchDaily, fetchDashboard]);

  useApiErrorNotification(dailyState.error, 'Не удалось загрузить активность');

  const retry = useCallback((): void => {
    void fetchDaily({ from: range.from, to: range.to });
    void fetchDashboard({ from: range.from, to: range.to });
  }, [fetchDaily, fetchDashboard, range.from, range.to]);

  const rawDaily = useMemo(() => dailyState.data ?? [], [dailyState.data]);

  const daily = useMemo(() => {
    if (!teamEnabled) return rawDaily;
    const memberSet = new Set(members.map((m) => m.toLowerCase()));
    return rawDaily.filter((d) => memberSet.has(d.email.toLowerCase()));
  }, [rawDaily, teamEnabled, members]);

  /**
   * email (lowercase) → displayName + avatarUrl. Используется в ContributorsList
   * для аватарок/имён. Daily-эндпоинт enrichment не отдаёт, поэтому подсасываем
   * из dashboard.items[]. Совпадение по email (нечувствительно к регистру).
   */
  const enrichmentByEmail = useMemo<ReadonlyMap<string, AuthorEnrichment>>(() => {
    const map = new Map<string, AuthorEnrichment>();
    if (!dashboardData) return map;
    for (const a of dashboardData.items) {
      map.set(a.email.toLowerCase(), {
        displayName: a.displayName,
        avatarUrl: a.avatarUrl,
      });
    }
    return map;
  }, [dashboardData]);

  const isInitialLoading = dailyState.status === 'loading' && rawDaily.length === 0;
  const isInitialError = dailyState.status === 'error' && rawDaily.length === 0;

  const daysInRange = useMemo(() => rangeDays(range), [range]);

  const subtitle = useMemo(() => {
    const teamNote = teamEnabled ? ' · только команда' : '';
    return `${formatRange(range.from, range.to)} · ${daysInRange} ${daysInRange === 1 ? 'день' : 'дней'}${teamNote}`;
  }, [range.from, range.to, daysInRange, teamEnabled]);

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
        <ErrorState error={dailyState.error} onRetry={retry} />
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
            <ContributorsList
              daily={daily}
              range={range}
              enrichmentByEmail={enrichmentByEmail}
            />
          </Col>
        </Row>
      </PageSection>
    </>
  );
}
