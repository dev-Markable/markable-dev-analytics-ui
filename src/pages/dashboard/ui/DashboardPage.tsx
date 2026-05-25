import { useCallback, useEffect, useMemo } from 'react';
import { Col, Row } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { PageHeader, PageSection } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { useTeamFilter, useTeamFilterStore } from '@/features/team-filter';
import {
  aggregateAuthors,
  splitTopAndOutsiders,
  useDashboardStore,
} from '@/entities/dashboard';
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

  const state = useDashboardStore(useShallow((s) => s.state));
  const fetchDashboard = useDashboardStore((s) => s.fetch);

  useEffect(() => {
    void fetchDashboard({ from: range.from, to: range.to });
  }, [range.from, range.to, fetchDashboard]);

  useApiErrorNotification(state.error, 'Не удалось загрузить дашборд');

  const allItems = state.data?.items ?? [];
  /**
   * Фильтр команды применяется ДО агрегации. Все производные —
   * totals в карточках, top/outsiders, таблица — считаются от уже
   * отфильтрованного списка. Так «только команда» консистентно
   * влияет на каждое число на странице.
   */
  const filteredItems = useTeamFilter<AuthorActivity>(allItems, (a) => a.email);

  const totals = useMemo(() => aggregateAuthors(filteredItems), [filteredItems]);

  /**
   * Делим отфильтрованный (и отсортированный по activity.score desc) список
   * на топ и аутсайдеров без пересечения.
   * Для маленьких команд (len &lt; 2×N) — пополам, чтобы оба блока показывали
   * разных людей. Для больших — стандартные top-N / outsiders-N.
   */
  const { top: topItems, outsiders: outsiderItems } = useMemo(
    () => splitTopAndOutsiders(filteredItems, DASHBOARD_PAGE_SIZE),
    [filteredItems],
  );

  const subtitle = useMemo(() => {
    const totalAll = state.data?.totalElements ?? allItems.length;
    const filteredCount = filteredItems.length;
    const countNote = teamEnabled
      ? ` · команда: ${filteredCount} из ${totalAll}`
      : ` · ${totalAll} авторов`;
    return `Активные и аутсайдеры · ${formatRange(range.from, range.to)}${countNote}`;
  }, [
    range.from,
    range.to,
    teamEnabled,
    state.data?.totalElements,
    allItems.length,
    filteredItems.length,
  ]);

  const retry = useCallback(() => {
    void fetchDashboard({ from: range.from, to: range.to });
  }, [fetchDashboard, range.from, range.to]);

  const isLoading = state.status === 'loading';
  const isLoadingInitial = isLoading && allItems.length === 0;

  return (
    <>
      <PageHeader title="Дашборд" subtitle={subtitle} />

      <PageSection>
        <SummaryGrid totals={totals} loading={isLoadingInitial} />
      </PageSection>

      <PageSection>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <LeaderboardCard
              title="Топ активных"
              description="Ранжирование по не-мердж коммитам"
              icon={<TrendingUp size={16} />}
              items={topItems}
              status={state.status}
              error={state.error}
              onRetry={retry}
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
              description="Наименее активные (минимум 1 коммит)"
              icon={<TrendingDown size={16} />}
              items={outsiderItems}
              status={state.status}
              error={state.error}
              onRetry={retry}
              variant="outsider"
              range={range}
              emptyDescription={
                teamEnabled
                  ? 'В команде слишком мало авторов — все попали в топ.'
                  : 'В периоде слишком мало авторов — все попали в топ.'
              }
            />
          </Col>
        </Row>
      </PageSection>

      <PageSection>
        <AuthorsTable
          items={filteredItems}
          range={range}
          loading={isLoading}
          teamFilterEnabled={teamEnabled}
        />
      </PageSection>
    </>
  );
}
