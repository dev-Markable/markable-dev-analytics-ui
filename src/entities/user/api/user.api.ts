import { apiClient } from '@/shared/api';
import type { UserProfile, UserCommitsQuery } from '../model/profile';
import type { Commit } from '@/entities/commit/model/types';

export interface ProfilePeriod {
  from?: string;
  to?: string;
}

export async function getProfile(email: string, period?: ProfilePeriod): Promise<UserProfile> {
  const params: Record<string, string> = {};
  if (period?.from) params.from = period.from;
  if (period?.to) params.to = period.to;
  const { data } = await apiClient.get<UserProfile>(
    `/users/${encodeURIComponent(email)}/profile`,
    { params },
  );
  return data;
}

export async function getUserCommits(
  email: string,
  query: UserCommitsQuery = {},
): Promise<Commit[]> {
  const params: Record<string, string> = {};
  if (query.from) params.from = query.from;
  if (query.to) params.to = query.to;
  if (query.page != null) params.page = String(query.page);
  if (query.size != null) params.size = String(query.size);
  const { data } = await apiClient.get<Commit[]>(
    `/users/${encodeURIComponent(email)}/commits`,
    { params },
  );
  return data;
}
