import { queryOptions } from '@tanstack/react-query';
import { getProfile, getUsers, type ProfilePeriod } from './user.api';

export const usersQuery = (team?: string) =>
  queryOptions({
    queryKey: ['users', team ?? null] as const,
    queryFn: ({ signal }) => getUsers(team, signal),
  });

export const profileQuery = (email: string | null, period: ProfilePeriod) =>
  queryOptions({
    queryKey: ['users', 'profile', email, period] as const,
    queryFn: ({ signal }) => getProfile(email as string, period, signal),
    enabled: Boolean(email),
  });
