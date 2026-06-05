import { useCallback, useEffect, useMemo } from 'react';
import { Col, Row } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { PageHeader, PageSection, ErrorState, LoadingState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { useDailyStore, useHourlyStore, useReviewsStore } from '@/entities/stats';
import { useDashboardStore } from '@/entities/dashboard';
import { useUsersStore } from '@/entities/user';
import { ALL_TEAMS, matchesScope, useTeamScope } from '@/features/team-scope';
import { formatRange, rangeDays } from '@/shared/lib';
import { ActivitySummary } from '@/widgets/activity-summary';
import { ActivityHeatmap } from '@/widgets/activity-heatmap';
import { HourlyHeatmap } from '@/widgets/activity-hourly';
import { ReposChart } from '@/widgets/activity-repos';
import { ContributorsList } from '@/widgets/activity-contributors';
import { BusFactorCard } from '@/widgets/activity-bus-factor';
import { ReviewsCard } from '@/widgets/activity-reviews';
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

  // Hourly — командный агрегат (без авторской разбивки), поэтому клиентский
  // фильтр скопа к нему не применяется: показываем паттерн всей команды по времени.
  const hourlyData = useHourlyStore((s) => s.state.data);
  const fetchHourly = useHourlyStore((s) => s.fetch);

  // Ревью-метрики (B2) — есть авторская разбивка, скоп применяется внутри виджета.
  const reviewsState = useReviewsStore(useShallow((s) => s.state));
  const fetchReviews = useReviewsStore((s) => s.fetch);

  // /users — fallback по team/isLead для разработчиков, которые не попали в
  // топ-500 /dashboard (либо сменили email). Без него ContributorActivity.team
  // у таких авторов будет null, и фильтр по команде их потеряет.
  const usersData = useUsersStore((s) => s.state.data);
  const fetchUsers = useUsersStore((s) => s.fetch);

  const scope = useTeamScope();
  const teamEnabled = scope !== ALL_TEAMS;

  useEffect(() => {
    void fetchDaily({ from: range.from, to: range.to });
    void fetchDashboard({ from: range.from, to: range.to });
    void fetchHourly({ from: range.from, to: range.to });
    void fetchReviews({ from: range.from, to: range.to });
  }, [range.from, range.to, fetchDaily, fetchDashboard, fetchHourly, fetchReviews]);

  useEffect(() => {
    // Не зависит от периода — грузим один раз, переживает повторные монтирования.
    void fetchUsers();
  }, [fetchUsers]);

  useApiErrorNotification(dailyState.error, 'Не удалось загрузить активность');

  const retry = useCallback((): void => {
    void fetchDaily({ from: range.from, to: range.to });
    void fetchDashboard({ from: range.from, to: range.to });
  }, [fetchDaily, fetchDashboard, range.from, range.to]);

  const rawDaily = useMemo(() => dailyState.data ?? [], [dailyState.data]);

  /**
   * email (lowercase) → displayName + avatarUrl + team + isLead.
   *
   * Источник 1: /dashboard items (AuthorSummary с team/isLead) — основной,
   *   потому что у dashboard есть displayName/avatarUrl и сортировка top-500.
   * Источник 2 (fallback): /users — заполняет team/isLead для разработчиков,
   *   которые не попали в dashboard (вне топ-500, либо без активности
   *   за период). avatar/name из /users добираем тоже, если в dashboard'е их нет.
   *
   * Используется в ContributorsList (UI) и здесь же — для фильтрации daily
   * по скопу команды (у DailyStat нет team напрямую).
   */
  const enrichmentByEmail = useMemo<ReadonlyMap<string, AuthorEnrichment>>(() => {
    const map = new Map<string, AuthorEnrichment>();
    // Сначала users — даём dashboard перетереть точнее заполненные поля сверху.
    if (usersData) {
      for (const u of usersData) {
        map.set(u.email.toLowerCase(), {
          displayName: u.name ?? null,
          avatarUrl: u.avatarUrl ?? null,
          team: u.team ?? null,
          isLead: u.isLead,
        });
      }
    }
    if (dashboardData) {
      for (const a of dashboardData.items) {
        map.set(a.email.toLowerCase(), {
          displayName: a.displayName ?? null,
          avatarUrl: a.avatarUrl ?? null,
          team: a.team ?? null,
          isLead: a.isLead,
        });
      }
    }
    return map;
  }, [dashboardData, usersData]);

  const daily = useMemo(() => {
    if (!teamEnabled) return rawDaily;
    return rawDaily.filter((d) => {
      const enrich = enrichmentByEmail.get(d.email.toLowerCase());
      return matchesScope(enrich?.team ?? null, scope);
    });
  }, [rawDaily, teamEnabled, scope, enrichmentByEmail]);

  const isInitialLoading = dailyState.status === 'loading' && rawDaily.length === 0;
  const isInitialError = dailyState.status === 'error' && rawDaily.length === 0;

  const daysInRange = useMemo(() => rangeDays(range), [range]);

  const subtitle = useMemo(() => {
    const teamNote = teamEnabled ? ` · команда «${scope}»` : '';
    return `${formatRange(range.from, range.to)} · ${daysInRange} ${daysInRange === 1 ? 'день' : 'дней'}${teamNote}`;
  }, [range.from, range.to, daysInRange, teamEnabled, scope]);

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
        <Row gutter={[16, 16]} align="stretch">
          <Col xs={24} xl={12}>
            <ActivityHeatmap daily={daily} range={range} />
          </Col>
          <Col xs={24} xl={12}>
            <HourlyHeatmap data={hourlyData} title="Активность по часам · команда" />
          </Col>
        </Row>
      </PageSection>

      <PageSection>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={9}>
            <ReposChart daily={daily} />
          </Col>
          <Col xs={24} xl={15}>
            <ContributorsList
              daily={daily}
              range={range}
              enrichmentByEmail={enrichmentByEmail}
            />
          </Col>
        </Row>
      </PageSection>

      <PageSection>
        <BusFactorCard daily={daily} />
      </PageSection>

      <PageSection>
        <ReviewsCard state={reviewsState} range={range} onRetry={retry} />
      </PageSection>
    </>
  );
}
