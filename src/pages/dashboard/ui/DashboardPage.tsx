import { useCallback, useEffect, useMemo } from 'react';
import { Col, Row } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { PageHeader, PageSection } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { ALL_TEAMS, useTeamScope, useTeamScopeFilter } from '@/features/team-scope';
import {
  aggregateAuthors,
  selectDashboardSections,
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
  const scope = useTeamScope();
  const teamEnabled = scope !== ALL_TEAMS;

  const { state, prev } = useDashboardStore(
    useShallow((s) => ({ state: s.state, prev: s.prev })),
  );
  const fetchDashboard = useDashboardStore((s) => s.fetch);

  useEffect(() => {
    void fetchDashboard({ from: range.from, to: range.to });
  }, [range.from, range.to, fetchDashboard]);

  useApiErrorNotification(state.error, 'Не удалось загрузить дашборд');

  const allItems = state.data?.items ?? [];
  /**
   * Фильтр команды применяется ДО агрегации. Все производные —
   * totals в карточках, top/outsiders, таблица — считаются от уже
   * отфильтрованного списка. Так выбор команды консистентно влияет
   * на каждое число на странице.
   */
  const filteredItems = useTeamScopeFilter<AuthorActivity>(allItems, (a) => a.team);
  // Предыдущий период — для PoP-дельт. Фильтруем тем же скопом команды.
  const prevItems = useTeamScopeFilter<AuthorActivity>(prev.data?.items, (a) => a.team);

  const totals = useMemo(() => aggregateAuthors(filteredItems), [filteredItems]);
  const prevTotals = useMemo(
    () => (prev.data ? aggregateAuthors(prevItems) : null),
    [prev.data, prevItems],
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
    const totalAll = state.data?.totalElements ?? allItems.length;
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
    state.data?.totalElements,
    allItems.length,
    filteredItems.length,
    prevTotals,
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
              status={state.status}
              error={state.error}
              onRetry={retry}
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
              status={state.status}
              error={state.error}
              onRetry={retry}
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
