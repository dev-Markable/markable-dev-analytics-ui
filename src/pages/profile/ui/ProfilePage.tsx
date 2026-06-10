import { useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, PageSection, ErrorState, LoadingState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { ALL_TEAMS, filterByScope, useTeamScope } from '@/features/team-scope';
import { profileQuery, userDisplayName } from '@/entities/user';
import { reviewsQuery } from '@/entities/stats';
import { queryToAsyncState, useApiError } from '@/shared/api';
import type { AsyncState } from '@/shared/api';
import type { ReviewStats } from '@/entities/stats';
import { formatRange } from '@/shared/lib';
import { ROUTES } from '@/app/router/paths';
import { ProfileHeader } from '@/widgets/profile/header';
import { ProfileSummary } from '@/widgets/profile/summary';
import { ProfileActivity } from '@/widgets/profile/activity';
import { ProfileReviews } from '@/widgets/profile/reviews';
import { TasksTimeline } from '@/widgets/profile/tasks-timeline';

export function ProfilePage() {
  const { email: emailParam } = useParams<{ email: string }>();
  const email = emailParam ? decodeURIComponent(emailParam) : null;
  const navigate = useNavigate();

  const range = useDateRange();
  const scope = useTeamScope();

  const profileQ = useQuery(profileQuery(email, { from: range.from, to: range.to }));
  // Ревью-метрики (вариант A): тянем командный /stats/reviews, виджет находит
  // строку автора и сравнивает со средним. TanStack сам кэширует тот же ключ —
  // если юзер пришёл с Activity за тот же период, повторного запроса нет.
  const reviewsQ = useQuery(reviewsQuery({ from: range.from, to: range.to }));

  const profile = profileQ.data ?? null;
  const isFreshData = profile?.user.email === email;

  useDocumentTitle(
    isFreshData && profile ? `Профиль · ${userDisplayName(profile.user)}` : email ?? 'Профиль',
  );

  const profileError = useApiError(profileQ.error);
  useApiErrorNotification(profileError, 'Не удалось загрузить профиль');

  const retry = useCallback(() => {
    void profileQ.refetch();
  }, [profileQ]);

  const handleBack = (): void => navigate(-1);

  const backButton = (
    <Button icon={<ArrowLeft size={14} />} onClick={handleBack}>
      Назад
    </Button>
  );

  /**
   * Если в топбаре выбрана конкретная команда, ревью-сравнение должно
   * считаться внутри неё, а не по всей компании. Через alwaysKeep
   * субъект профиля проходит фильтр независимо от скопа — иначе виджет
   * не найдёт строку автора и вернёт null.
   */
  const subjectEmail = profile?.user.email ?? null;
  const scopedReviewsState = useMemo<AsyncState<ReviewStats>>(() => {
    const baseState = queryToAsyncState(reviewsQ);
    if (scope === ALL_TEAMS || !baseState.data) return baseState;
    const filteredAuthors = filterByScope(
      baseState.data.authors,
      scope,
      (a) => a.team,
      (a) => subjectEmail != null && a.email.toLowerCase() === subjectEmail.toLowerCase(),
    );
    return { ...baseState, data: { ...baseState.data, authors: filteredAuthors } };
  }, [reviewsQ, scope, subjectEmail]);

  const subtitle = useMemo(() => {
    if (!email) return null;
    const base = `${email} · ${formatRange(range.from, range.to)}`;
    if (isFreshData && profile) {
      return `${base} · ${profile.commits.length} коммитов · ${profile.cards.length} карточек`;
    }
    return base;
  }, [email, range.from, range.to, profile, isFreshData]);

  if (!email) {
    return (
      <>
        <PageHeader title="Профиль не выбран" subtitle="URL не содержит email" />
        <ErrorState
          error={null}
          title="Email не указан"
          onRetry={() => navigate(ROUTES.dashboard)}
        />
      </>
    );
  }

  if (profileQ.isPending && !isFreshData) {
    return (
      <>
        <PageHeader title={email} subtitle={subtitle} extra={backButton} />
        <LoadingState label="Загружаем профиль" />
      </>
    );
  }

  if (profileQ.isError && !isFreshData) {
    const is404 = profileError?.isNotFound;
    return (
      <>
        <PageHeader title={email} subtitle={subtitle} extra={backButton} />
        <ErrorState
          error={profileError}
          title={is404 ? 'Пользователь не найден' : 'Не удалось загрузить профиль'}
          onRetry={is404 ? undefined : retry}
        />
      </>
    );
  }

  if (!profile || !isFreshData) {
    return (
      <>
        <PageHeader title={email} subtitle={subtitle} extra={backButton} />
        <LoadingState label="Загружаем профиль" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={userDisplayName(profile.user)}
        subtitle={subtitle}
        extra={backButton}
      />

      <PageSection>
        <ProfileHeader user={profile.user} />
      </PageSection>

      <PageSection>
        <ProfileSummary summary={profile.summary} cards={profile.cards} />
      </PageSection>

      <PageSection>
        <ProfileActivity commits={profile.commits} range={range} />
      </PageSection>

      <PageSection>
        <ProfileReviews state={scopedReviewsState} email={profile.user.email} />
      </PageSection>

      <PageSection>
        <TasksTimeline
          commits={profile.commits}
          cards={profile.cards}
          email={profile.user.email}
        />
      </PageSection>
    </>
  );
}
