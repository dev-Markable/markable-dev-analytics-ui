import { ApiError, apiClient } from '@/shared/api';
import type { CurrentUser } from '../model/types';

/** Вход по GitLab PAT. 401 — невалидный токен, 403 — нет доступа к проектам (пробрасываются). */
export async function login(token: string): Promise<CurrentUser> {
  const { data } = await apiClient.post<CurrentUser>('/auth/login', { token });
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
