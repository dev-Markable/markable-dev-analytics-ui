import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/widgets/app-layout';
import { DashboardPage } from '@/pages/dashboard';
import { WeeklyPage } from '@/pages/weekly';
import { ActivityPage } from '@/pages/activity';
import { ComparePage } from '@/pages/compare';
import { ProfilePage } from '@/pages/profile';
import { CollectionPage } from '@/pages/collection';
import { SettingsPage } from '@/pages/settings';
import { NotFoundPage } from '@/pages/not-found';
import { ROUTES } from './paths';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.weekly} element={<WeeklyPage />} />
        <Route path={ROUTES.activity} element={<ActivityPage />} />
        <Route path={ROUTES.compare} element={<ComparePage />} />
        <Route path={ROUTES.profileMask} element={<ProfilePage />} />
        <Route path={ROUTES.collection} element={<CollectionPage />} />
        <Route path={ROUTES.settings} element={<SettingsPage />} />
        <Route path={ROUTES.notFound} element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
