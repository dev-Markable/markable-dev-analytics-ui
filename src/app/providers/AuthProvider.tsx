import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onUnauthorized } from '@/shared/api';
import { CURRENT_USER_KEY } from '@/entities/auth';

/**
 * Подписывает приложение на глобальный 401: при истечении сессии (любой запрос) сбрасываем
 * текущего пользователя в кэше — гард `RequireAuth` тут же уводит на `/login`. Должен быть
 * внутри `QueryProvider`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    onUnauthorized(() => queryClient.setQueryData(CURRENT_USER_KEY, null));
    return () => onUnauthorized(null);
  }, [queryClient]);

  return <>{children}</>;
}
