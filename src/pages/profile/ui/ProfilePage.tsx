import { useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, PageSection, ErrorState, LoadingState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { useProfileStore, userDisplayName } from '@/entities/user';
import { formatRange } from '@/shared/lib';
import { ROUTES } from '@/app/router/paths';
import { ProfileHeader } from '@/widgets/profile-header';
import { ProfileSummary } from '@/widgets/profile-summary';
import { ProfileActivity } from '@/widgets/profile-activity';
import { TasksTimeline } from '@/widgets/profile-tasks-timeline';

export function ProfilePage() {
  const { email: emailParam } = useParams<{ email: string }>();
  const email = emailParam ? decodeURIComponent(emailParam) : null;
  const navigate = useNavigate();

  const range = useDateRange();
  const state = useProfileStore(useShallow((s) => s.state));
  const fetchProfile = useProfileStore((s) => s.fetch);

  const profile = state.data;
  const isFreshData = profile?.user.email === email;

  useDocumentTitle(
    isFreshData && profile ? `Профиль · ${userDisplayName(profile.user)}` : email ?? 'Профиль',
  );

  useEffect(() => {
    if (!email) return;
    void fetchProfile(email, { from: range.from, to: range.to });
  }, [email, range.from, range.to, fetchProfile]);

  useApiErrorNotification(state.error, 'Не удалось загрузить профиль');

  const retry = useCallback(() => {
    if (!email) return;
    void fetchProfile(email, { from: range.from, to: range.to });
  }, [email, fetchProfile, range.from, range.to]);

  const handleBack = (): void => navigate(-1);

  const backButton = (
    <Button icon={<ArrowLeft size={14} />} onClick={handleBack}>
      Назад
    </Button>
  );

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

  if (state.status === 'loading' && !isFreshData) {
    return (
      <>
        <PageHeader title={email} subtitle={subtitle} extra={backButton} />
        <LoadingState label="Загружаем профиль" />
      </>
    );
  }

  if (state.status === 'error' && !isFreshData) {
    const is404 = state.error?.isNotFound;
    return (
      <>
        <PageHeader title={email} subtitle={subtitle} extra={backButton} />
        <ErrorState
          error={state.error}
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
        <TasksTimeline
          commits={profile.commits}
          cards={profile.cards}
          email={profile.user.email}
        />
      </PageSection>
    </>
  );
}
