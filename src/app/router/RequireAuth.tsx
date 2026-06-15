import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/entities/auth';
import { LoadingState } from '@/shared/ui';
import { ROUTES } from './paths';

/**
 * Гард защищённых роутов (ADR-13). Пока проверяется сессия (`GET /auth/me`) — лоадер;
 * нет пользователя → редирект на `/login` (запоминаем исходный путь в `state.from`).
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState label="Проверяем сессию" />;
  }
  if (!user) {
    return (
      <Navigate
        to={ROUTES.login}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  return <>{children}</>;
}
