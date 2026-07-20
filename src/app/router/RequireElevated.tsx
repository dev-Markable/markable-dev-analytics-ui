import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isElevated, useCurrentUser } from '@/entities/auth';
import { ROUTES } from './paths';

/**
 * Гард разделов только для ADMIN/TEAMLEAD (compare/cohorts/teams, ADR-13). Внутри
 * защищённой зоны (`RequireAuth` выше) пользователь уже загружен; MEMBER, попавший
 * сюда по прямой ссылке, уводится на дашборд. Сервер дублирует запрет (403).
 */
export function RequireElevated({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser();
  if (user && !isElevated(user.role)) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }
  return <>{children}</>;
}
