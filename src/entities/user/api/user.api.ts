import { apiClient } from '@/shared/api';
import type { UserProfile, UserCommitsQuery } from '../model/profile';
import type { UnifiedUser } from '../model/types';
import type { Commit } from '@/entities/commit/model/types';

export interface ProfilePeriod {
  from?: string;
  to?: string;
}

/** Список пользователей (для picker'а и управления командами). */
export async function getUsers(team?: string, signal?: AbortSignal): Promise<UnifiedUser[]> {
  const params: Record<string, string> = {};
  if (team) params.team = team;
  const { data } = await apiClient.get<UnifiedUser[]>('/users', { params, signal });
  return data;
}

/**
 * Назначить/снять команду пользователю. `team = null` — снять.
 * Мутация без signal: PUT не отменяем (может породить inconsistent state).
 */
export async function setUserTeam(email: string, team: string | null): Promise<UnifiedUser> {
  const { data } = await apiClient.put<UnifiedUser>(
    `/users/${encodeURIComponent(email)}/team`,
    { team },
  );
  return data;
}

export async function getProfile(
  email: string,
  period?: ProfilePeriod,
  signal?: AbortSignal,
): Promise<UserProfile> {
  const params: Record<string, string> = {};
  if (period?.from) params.from = period.from;
  if (period?.to) params.to = period.to;
  const { data } = await apiClient.get<UserProfile>(
    `/users/${encodeURIComponent(email)}/profile`,
    { params, signal },
  );
  return data;
}

export async function getUserCommits(
  email: string,
  query: UserCommitsQuery = {},
  signal?: AbortSignal,
): Promise<Commit[]> {
  const params: Record<string, string> = {};
  if (query.from) params.from = query.from;
  if (query.to) params.to = query.to;
  if (query.page != null) params.page = String(query.page);
  if (query.size != null) params.size = String(query.size);
  const { data } = await apiClient.get<Commit[]>(
    `/users/${encodeURIComponent(email)}/commits`,
    { params, signal },
  );
  return data;
}
