import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/widgets/app-layout';
import { DashboardPage } from '@/pages/dashboard';
import { ROUTES } from './paths';

// Стартовая страница — eager (всё равно грузится сразу, без лишнего lazy-водопада).
// Остальные — отдельными чанками по требованию. Страницы экспортируют named,
// поэтому маппим в { default } для React.lazy.
const WeeklyPage = lazy(() =>
  import('@/pages/weekly').then((m) => ({ default: m.WeeklyPage })),
);
const ActivityPage = lazy(() =>
  import('@/pages/activity').then((m) => ({ default: m.ActivityPage })),
);
const ComparePage = lazy(() =>
  import('@/pages/compare').then((m) => ({ default: m.ComparePage })),
);
const PerformanceReviewPage = lazy(() =>
  import('@/pages/performance-review').then((m) => ({ default: m.PerformanceReviewPage })),
);
const TeamsPage = lazy(() =>
  import('@/pages/teams').then((m) => ({ default: m.TeamsPage })),
);
const ProfilePage = lazy(() =>
  import('@/pages/profile').then((m) => ({ default: m.ProfilePage })),
);
const CollectionPage = lazy(() =>
  import('@/pages/collection').then((m) => ({ default: m.CollectionPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/settings').then((m) => ({ default: m.SettingsPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })),
);

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.weekly} element={<WeeklyPage />} />
        <Route path={ROUTES.activity} element={<ActivityPage />} />
        <Route path={ROUTES.compare} element={<ComparePage />} />
        <Route path={ROUTES.performanceReview} element={<PerformanceReviewPage />} />
        <Route path={ROUTES.teams} element={<TeamsPage />} />
        <Route path={ROUTES.profileMask} element={<ProfilePage />} />
        <Route path={ROUTES.collection} element={<CollectionPage />} />
        <Route path={ROUTES.settings} element={<SettingsPage />} />
        <Route path={ROUTES.notFound} element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
