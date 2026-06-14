import { useCallback, useMemo, useState } from 'react';
import { Col, Row } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, PageSection, ErrorState, LoadingState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { dailyQuery, hourlyQuery, reviewsQuery } from '@/entities/stats';
import { dashboardQuery } from '@/entities/dashboard';
import { usersQuery } from '@/entities/user';
import { ALL_TEAMS, matchesScope, useTeamScope } from '@/features/team-scope';
import { queryToAsyncState, useApiError } from '@/shared/api';
import { formatRange, rangeDays } from '@/shared/lib';
import { ActivitySummary } from '@/widgets/activity/summary';
import { ActivityHeatmap } from '@/widgets/activity/heatmap';
import { HourlyHeatmap } from '@/widgets/activity/hourly';
import { ReposChart } from '@/widgets/activity/repos';
import { ContributorsList } from '@/widgets/activity/contributors';
import { BusFactorCard } from '@/widgets/activity/bus-factor';
import { ReviewsCard } from '@/widgets/activity/reviews';
import { ReviewConcentrationCard } from '@/widgets/activity/review-concentration';
import { DistributionCard } from '@/widgets/activity/distribution';
import { DrillDownDrawer, type DrillContent } from '@/widgets/activity/drilldown';
import type { AuthorEnrichment } from '@/widgets/activity/contributors/lib/aggregate-contributors';

export function ActivityPage() {
  useDocumentTitle('Активность');

  const range = useDateRange();
  const scope = useTeamScope();
  const teamEnabled = scope !== ALL_TEAMS;

  // Drill-down: клик по графику кладёт сюда готовую разбивку, Drawer её рисует.
  const [drill, setDrill] = useState<DrillContent | null>(null);

  const dailyQ = useQuery(dailyQuery({ from: range.from, to: range.to }));
  // /dashboard тянем параллельно — только из-за displayName/avatarUrl.
  // Daily-эндпоинт enrichment не возвращает (см. API.md).
  const dashboardQ = useQuery(dashboardQuery({ from: range.from, to: range.to }));
  // Hourly — серверный агрегат (без авторской разбивки): скоп по команде делает
  // backend через ?team (клиентом отфильтровать нельзя — в ответе нет email/team).
  const hourlyQ = useQuery(
    hourlyQuery({ from: range.from, to: range.to, team: teamEnabled ? scope : undefined }),
  );
  // Ревью-метрики — авторская разбивка фильтруется внутри виджета.
  const reviewsQ = useQuery(reviewsQuery({ from: range.from, to: range.to }));
  // /users — fallback по team/isLead для разработчиков, которые не попали в
  // топ-500 /dashboard (либо сменили email). Без него ContributorActivity.team
  // у таких авторов будет null, и фильтр по команде их потеряет.
  const usersQ = useQuery(usersQuery());

  const dailyError = useApiError(dailyQ.error);
  useApiErrorNotification(dailyError, 'Не удалось загрузить активность');

  const retry = useCallback((): void => {
    void dailyQ.refetch();
    void dashboardQ.refetch();
  }, [dailyQ, dashboardQ]);

  const rawDaily = useMemo(() => dailyQ.data ?? [], [dailyQ.data]);

  const enrichmentByEmail = useMemo<ReadonlyMap<string, AuthorEnrichment>>(() => {
    const map = new Map<string, AuthorEnrichment>();
    if (usersQ.data) {
      for (const u of usersQ.data) {
        map.set(u.email.toLowerCase(), {
          displayName: u.name ?? null,
          avatarUrl: u.avatarUrl ?? null,
          team: u.team ?? null,
          isLead: u.isLead,
        });
      }
    }
    if (dashboardQ.data) {
      for (const a of dashboardQ.data.items) {
        map.set(a.email.toLowerCase(), {
          displayName: a.displayName ?? null,
          avatarUrl: a.avatarUrl ?? null,
          team: a.team ?? null,
          isLead: a.isLead,
        });
      }
    }
    return map;
  }, [dashboardQ.data, usersQ.data]);

  const daily = useMemo(() => {
    if (!teamEnabled) return rawDaily;
    return rawDaily.filter((d) => {
      const enrich = enrichmentByEmail.get(d.email.toLowerCase());
      return matchesScope(enrich?.team ?? null, scope);
    });
  }, [rawDaily, teamEnabled, scope, enrichmentByEmail]);

  const isInitialLoading = dailyQ.isPending && rawDaily.length === 0;
  const isInitialError = dailyQ.isError && rawDaily.length === 0;

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
        <ErrorState error={dailyError} onRetry={retry} />
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
        <DistributionCard state={queryToAsyncState(dashboardQ)} onDrill={setDrill} onRetry={retry} />
      </PageSection>

      <PageSection>
        <Row gutter={[16, 16]} align="stretch">
          <Col xs={24} xl={12}>
            <ActivityHeatmap
              daily={daily}
              range={range}
              enrichment={enrichmentByEmail}
              onDrill={setDrill}
            />
          </Col>
          <Col xs={24} xl={12}>
            <HourlyHeatmap
              state={queryToAsyncState(hourlyQ)}
              title={`Активность по часам${teamEnabled ? ` · ${scope}` : ' · все команды'}`}
            />
          </Col>
        </Row>
      </PageSection>

      <PageSection>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={9}>
            <ReposChart daily={daily} enrichment={enrichmentByEmail} onDrill={setDrill} />
          </Col>
          <Col xs={24} xl={15}>
            <ContributorsList daily={daily} range={range} enrichmentByEmail={enrichmentByEmail} />
          </Col>
        </Row>
      </PageSection>

      <PageSection>
        <BusFactorCard daily={daily} />
      </PageSection>

      <PageSection>
        <ReviewConcentrationCard state={queryToAsyncState(reviewsQ)} onRetry={retry} />
      </PageSection>

      <PageSection>
        <ReviewsCard state={queryToAsyncState(reviewsQ)} range={range} onRetry={retry} />
      </PageSection>

      <DrillDownDrawer content={drill} range={range} onClose={() => setDrill(null)} />
    </>
  );
}
