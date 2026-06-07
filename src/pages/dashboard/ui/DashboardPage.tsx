import { useMemo } from 'react';
import { Col, Row } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { PageHeader, PageSection } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useApiError } from '@/shared/api';
import { useDateRange } from '@/features/date-range-filter';
import { ALL_TEAMS, useTeamScope, useTeamScopeFilter } from '@/features/team-scope';
import {
  aggregateAuthors,
  selectDashboardSections,
  dashboardQuery,
  dashboardPrevQuery,
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
  const scope = useTeamScope();
  const teamEnabled = scope !== ALL_TEAMS;

  const dashboardQ = useQuery(dashboardQuery({ from: range.from, to: range.to }));
  const prevQ = useQuery(dashboardPrevQuery({ from: range.from, to: range.to }));

  const error = useApiError(dashboardQ.error);
  useApiErrorNotification(error, 'Не удалось загрузить дашборд');

  const allItems = dashboardQ.data?.items ?? [];
  /**
   * Фильтр команды применяется ДО агрегации. Все производные —
   * totals в карточках, top/outsiders, таблица — считаются от уже
   * отфильтрованного списка. Так выбор команды консистентно влияет
   * на каждое число на странице.
   */
  const filteredItems = useTeamScopeFilter<AuthorActivity>(allItems, (a) => a.team);
  // Предыдущий период — для PoP-дельт. Фильтруем тем же скопом команды.
  const prevItems = useTeamScopeFilter<AuthorActivity>(prevQ.data?.items, (a) => a.team);

  const totals = useMemo(() => aggregateAuthors(filteredItems), [filteredItems]);
  const prevTotals = useMemo(
    () => (prevQ.data ? aggregateAuthors(prevItems) : null),
    [prevQ.data, prevItems],
  );

  /**
   * Top и outsiders — дизъюнктные множества по `activity.category`:
   * top = ACTIVE/STAR (или без activity), outsiders = INACTIVE/BELOW_AVERAGE.
   * Один и тот же автор не может попасть в оба блока.
   */
  const { top: topItems, outsiders: outsiderItems } = useMemo(
    () => selectDashboardSections(filteredItems, DASHBOARD_PAGE_SIZE),
    [filteredItems],
  );

  const subtitle = useMemo(() => {
    const totalAll = dashboardQ.data?.totalElements ?? allItems.length;
    const filteredCount = filteredItems.length;
    const countNote = teamEnabled
      ? ` · ${scope}: ${filteredCount} из ${totalAll}`
      : ` · ${totalAll} авторов`;
    const deltaNote = prevTotals ? ' · ↕ к пред. периоду' : '';
    return `${formatRange(range.from, range.to)}${countNote}${deltaNote}`;
  }, [
    range.from,
    range.to,
    scope,
    teamEnabled,
    dashboardQ.data?.totalElements,
    allItems.length,
    filteredItems.length,
    prevTotals,
  ]);

  // Адаптация TanStack Query → нашему контракту для LeaderboardCard.
  const status: 'idle' | 'loading' | 'success' | 'error' = dashboardQ.isPending
    ? 'loading'
    : dashboardQ.isError
      ? 'error'
      : dashboardQ.isSuccess
        ? 'success'
        : 'idle';
  const isLoading = dashboardQ.isFetching;
  const isLoadingInitial = isLoading && allItems.length === 0;

  return (
    <>
      <PageHeader title="Дашборд" subtitle={subtitle} />

      <PageSection>
        <SummaryGrid totals={totals} prevTotals={prevTotals} loading={isLoadingInitial} />
      </PageSection>

      <PageSection>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <LeaderboardCard
              title="Топ активных"
              description="Категория Активен или Топ, по убыванию score"
              icon={<TrendingUp size={16} />}
              items={topItems}
              status={status}
              error={error}
              onRetry={() => void dashboardQ.refetch()}
              variant="top"
              range={range}
              emptyDescription={
                teamEnabled
                  ? `В команде «${scope}» нет активности в этом периоде.`
                  : 'За выбранный период активность не зафиксирована.'
              }
            />
          </Col>
          <Col xs={24} xl={12}>
            <LeaderboardCard
              title="Аутсайдеры"
              description="Категория Неактивен или Ниже среднего"
              icon={<TrendingDown size={16} />}
              items={outsiderItems}
              status={status}
              error={error}
              onRetry={() => void dashboardQ.refetch()}
              variant="outsider"
              range={range}
              emptyDescription={
                teamEnabled
                  ? `Все в команде «${scope}» — Активен или Топ.`
                  : 'Все авторы — Активен или Топ. Никто не попал в Неактивен/Ниже среднего.'
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
