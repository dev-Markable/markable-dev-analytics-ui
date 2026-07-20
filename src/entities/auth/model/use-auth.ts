import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api';
import { getAuthConfig, getCurrentUser, login, logout } from '../api/auth.api';
import type { AuthConfig, CurrentUser } from './types';

/** Ключ кэша текущего пользователя — общий для гарда и топбара. */
export const CURRENT_USER_KEY = ['auth', 'me'] as const;

/**
 * Текущий пользователь. `data === null` → не аутентифицирован (на это смотрит гард).
 * `retry: false` — на 401 не ретраим (это не транзиентная ошибка), `staleTime: Infinity` —
 * сессия не «протухает» сама, перезапрашиваем явно (после login/logout/401).
 */
export function useCurrentUser() {
  return useQuery<CurrentUser | null, ApiError>({
    queryKey: CURRENT_USER_KEY,
    queryFn: () => getCurrentUser(),
    staleTime: Infinity,
    retry: false,
  });
}

export function useAuthConfig() {
  return useQuery<AuthConfig, ApiError>({
    queryKey: ['auth', 'config'],
    queryFn: getAuthConfig,
    staleTime: Infinity,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation<CurrentUser, ApiError, string>({
    mutationFn: (token) => login(token),
    onSuccess: (user) => qc.setQueryData(CURRENT_USER_KEY, user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, void>({
    mutationFn: () => logout(),
    onSettled: () => {
      // Выход (успех или ошибка сети) — сбрасываем пользователя и все кэши данных.
      qc.setQueryData(CURRENT_USER_KEY, null);
      qc.clear();
    },
  });
}
