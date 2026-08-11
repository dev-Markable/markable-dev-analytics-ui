import { useMemo } from 'react';
import { Collapse } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { ExportButton, PageHeader, PageSection } from '@/shared/ui';
import { PulseCard } from '@/widgets/dashboard/pulse';
import { MyWeekCard } from '@/widgets/dashboard/my-week';
import { OverviewCard } from '@/widgets/dashboard/overview';
import { SectionLinks } from '@/widgets/dashboard/sections';
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
import { dailyQuery, reviewsQuery, type ReviewAuthor } from '@/entities/stats';
import { formatRange, pctChange } from '@/shared/lib';
import { DASHBOARD_PAGE_SIZE } from '@/shared/config';
import { RankingBoard } from '@/widgets/dashboard/leaderboard';
import { AuthorsTable, useAuthorsCsvExport } from '@/widgets/dashboard/authors-table';

export function DashboardPage() {
  useDocumentTitle('Дашборд');

  const range = useDateRange();
  const scope = useTeamScope();
  const teamEnabled = scope !== ALL_TEAMS;

  const dashboardQ = useQuery(dashboardQuery({ from: range.from, to: range.to }));
  const prevQ = useQuery(dashboardPrevQuery({ from: range.from, to: range.to }));
  // Ревью — только для ленты «Требует внимания» (MR без ревью, концентрация).
  const reviewsQ = useQuery(reviewsQuery({ from: range.from, to: range.to }));
  // Пульс — дневной ряд. Команду фильтрует БД: у daily нет enrichment, клиентом не отфильтровать.
  const dailyQ = useQuery(
    dailyQuery({ from: range.from, to: range.to, team: teamEnabled ? scope : undefined }),
  );

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
  // Ревью-авторы под тем же скопом — для сигналов.
  const reviewAuthors = useTeamScopeFilter<ReviewAuthor>(reviewsQ.data?.authors, (a) => a.team);

  const totals = useMemo(() => aggregateAuthors(filteredItems), [filteredItems]);
  const prevTotals = useMemo(
    () => (prevQ.data ? aggregateAuthors(prevItems) : null),
    [prevQ.data, prevItems],
  );

  // Дельта коммитов к предыдущему периоду — крупная метрика пульса.
  const exportAuthorsCsv = useAuthorsCsvExport(filteredItems, range);

  const commitsDeltaPct = useMemo(
    () => (prevTotals ? pctChange(totals.totalCommits, prevTotals.totalCommits) : null),
    [totals.totalCommits, prevTotals],
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
        <PulseCard
          daily={dailyQ.data ?? []}
          totalCommits={totals.totalCommits}
          deltaPct={commitsDeltaPct}
          loading={isLoadingInitial || (dailyQ.isPending && !dailyQ.data)}
        />
      </PageSection>

      {/* Персональный срез — сразу под пульсом: «что у команды» → «что у меня». */}
      <PageSection>
        <MyWeekCard items={filteredItems} reviews={reviewAuthors} range={range} />
      </PageSection>

      {/* Сводка периода + риски одним блоком: цифры без дублей с пульсом,
          лента рисков — компактной колонкой справа. */}
      <PageSection>
        <OverviewCard
          totals={totals}
          prevTotals={prevTotals}
          items={filteredItems}
          previous={prevItems}
          daily={dailyQ.data ?? []}
          reviews={reviewAuthors}
          range={range}
          loading={isLoadingInitial}
        />
      </PageSection>

      {/* Единый рейтинг: лидеры и отстающие одним списком — раньше это были две
          карточки в ряд, и «Аутсайдеры» почти всегда пустовали. */}
      <PageSection>
        <RankingBoard
          top={topItems}
          outsiders={outsiderItems}
          status={status}
          error={error}
          onRetry={() => void dashboardQ.refetch()}
          range={range}
          teamFilterEnabled={teamEnabled}
          daily={dailyQ.data ?? []}
          emptyDescription={
            teamEnabled
              ? `В команде «${scope}» нет активности в этом периоде.`
              : 'За выбранный период активность не зафиксирована.'
          }
        />
      </PageSection>

      {/* Входы в аналитические разделы — внизу, как «куда пойти дальше». */}
      <PageSection>
        <SectionLinks range={range} team={teamEnabled ? scope : null} />
      </PageSection>

      {/* Полный список дублирует лидерборд выше, поэтому по умолчанию свёрнут:
          лидерборд отвечает на «кто выделяется», таблица — на «покажи всех». */}
      <PageSection>
        <Collapse
          ghost
          className="dashboard-authors-collapse"
          items={[
            {
              key: 'authors',
              label: (
                <span className="dashboard-authors-collapse__label">
                  <Users size={15} />
                  Все разработчики
                  <span className="dashboard-authors-collapse__count">{filteredItems.length}</span>
                </span>
              ),
              // Клик по кнопке не должен сворачивать блок — гасим всплытие.
              extra: filteredItems.length > 0 && (
                <span
                  onClick={(e) => e.stopPropagation()}
                  role="presentation"
                  className="dashboard-authors-collapse__extra"
                >
                  <ExportButton size="small" onExportCsv={exportAuthorsCsv} />
                </span>
              ),
              children: (
                <AuthorsTable
                  items={filteredItems}
                  range={range}
                  loading={isLoading}
                  teamFilterEnabled={teamEnabled}
                />
              ),
            },
          ]}
        />
      </PageSection>
    </>
  );
}
