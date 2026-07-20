import { ApiError, apiClient } from '@/shared/api';
import type { AuthConfig, CurrentUser } from '../model/types';

/**
 * Старт OAuth2-входа — backend-редирект на КОРНЕ (вне /api/v2), поэтому полный путь, а не
 * через apiClient. Браузер уходит сюда по window.location; в dev проксируется vite (/oauth2).
 */
export const OAUTH_LOGIN_URL = '/oauth2/authorization/gitlab';

/** Вход по GitLab PAT. 401 — невалидный токен, 403 — нет доступа к проектам (пробрасываются). */
export async function login(token: string): Promise<CurrentUser> {
  const { data } = await apiClient.post<CurrentUser>('/auth/login', { token });
  return data;
}

/** Доступен ли вход через GitLab OAuth (настроена ли регистрация на бэке). */
export async function getAuthConfig(): Promise<AuthConfig> {
  const { data } = await apiClient.get<AuthConfig>('/auth/config');
  return data;
}

/** Текущий пользователь. Нет сессии (`401`) → `null` (не ошибка) — на этом строится гард. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const { data } = await apiClient.get<CurrentUser>('/auth/me');
    return data;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
