import { useCallback, useEffect, useMemo } from 'react';
import { Col, Row } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { PageHeader, PageSection } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { useTeamFilter, useTeamFilterStore } from '@/features/team-filter';
import { useDashboardStore } from '@/entities/dashboard';
import { useSummaryStore } from '@/entities/stats';
import type { AuthorActivity } from '@/entities/user';
import { formatRange } from '@/shared/lib';
import { DASHBOARD_PAGE_SIZE } from '@/shared/config';
import { SummaryGrid } from '@/widgets/dashboard-summary';
import { LeaderboardCard } from '@/widgets/dashboard-leaderboard';
import { AuthorsTable } from '@/widgets/dashboard-authors-table';

export function DashboardPage() {
  useDocumentTitle('Дашборд');

  const range = useDateRange();
  const teamEnabled = useTeamFilterStore((s) => s.enabled);

  const { topPage, outsidersPage, tablePage } = useDashboardStore(
    useShallow((s) => ({
      topPage: s.topPage,
      outsidersPage: s.outsidersPage,
      tablePage: s.tablePage,
    })),
  );
  const summaryState = useSummaryStore(useShallow((s) => s.state));
  const fetchDashboard = useDashboardStore((s) => s.fetch);
  const goToTablePage = useDashboardStore((s) => s.goToTablePage);
  const fetchSummary = useSummaryStore((s) => s.fetch);

  useEffect(() => {
    void fetchDashboard({ from: range.from, to: range.to }, DASHBOARD_PAGE_SIZE);
    void fetchSummary({ from: range.from, to: range.to });
  }, [range.from, range.to, fetchDashboard, fetchSummary]);

  useApiErrorNotification(topPage.error, 'Не удалось загрузить дашборд');
  useApiErrorNotification(summaryState.error, 'Не удалось загрузить сводку');

  const topItems = useTeamFilter<AuthorActivity>(topPage.data?.items, (a) => a.email);
  const outsiderItems = useTeamFilter<AuthorActivity>(
    outsidersPage.data?.items,
    (a) => a.email,
  );
  const tableItems = useTeamFilter<AuthorActivity>(
    tablePage.data?.items,
    (a) => a.email,
  );

  const totalAuthors = topPage.data?.totalElements ?? null;

  const subtitle = useMemo(() => {
    const sizeNote = totalAuthors != null ? ` · ${totalAuthors} авторов всего` : '';
    const teamNote = teamEnabled ? ' · только команда' : '';
    return `${formatRange(range.from, range.to)}${sizeNote}${teamNote}`;
  }, [range.from, range.to, teamEnabled, totalAuthors]);

  const retryAll = useCallback((): void => {
    void fetchDashboard({ from: range.from, to: range.to }, DASHBOARD_PAGE_SIZE);
    void fetchSummary({ from: range.from, to: range.to });
  }, [fetchDashboard, fetchSummary, range.from, range.to]);

  const handleTablePageChange = useCallback(
    (nextPage: number, nextSize: number): void => {
      void goToTablePage({ from: range.from, to: range.to }, nextPage, nextSize);
    },
    [goToTablePage, range.from, range.to],
  );

  return (
    <>
      <PageHeader title="Дашборд" subtitle={subtitle} />

      <PageSection>
        <SummaryGrid state={summaryState} onRetry={retryAll} />
      </PageSection>

      <PageSection>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <LeaderboardCard
              title="Топ активных"
              description="Ранжирование по не-мердж коммитам"
              icon={<TrendingUp size={16} />}
              items={topItems}
              status={topPage.status}
              error={topPage.error}
              onRetry={retryAll}
              variant="top"
              range={range}
              emptyDescription={
                teamEnabled
                  ? 'В команде нет активности в этом периоде.'
                  : 'За выбранный период активность не зафиксирована.'
              }
            />
          </Col>
          <Col xs={24} xl={12}>
            <LeaderboardCard
              title="Аутсайдеры"
              description="Наименее активные авторы (минимум 1 коммит)"
              icon={<TrendingDown size={16} />}
              items={outsiderItems}
              status={outsidersPage.status}
              error={outsidersPage.error}
              onRetry={retryAll}
              variant="outsider"
              range={range}
              emptyDescription={
                teamEnabled
                  ? 'В команде нет авторов в категории аутсайдеров.'
                  : 'В периоде слишком мало авторов — все попали в топ.'
              }
            />
          </Col>
        </Row>
      </PageSection>

      <PageSection>
        <AuthorsTable
          state={tablePage}
          range={range}
          items={tableItems}
          onPageChange={handleTablePageChange}
          onRetry={retryAll}
          teamFilterEnabled={teamEnabled}
        />
      </PageSection>
    </>
  );
}
