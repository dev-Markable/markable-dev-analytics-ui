import { queryOptions } from '@tanstack/react-query';
import { getTeams } from './team.api';

/** Ключ списка команд — используется и для invalidate после мутаций. */
export const teamsQueryKey = ['teams'] as const;

export const teamsQuery = () =>
  queryOptions({
    queryKey: teamsQueryKey,
    queryFn: ({ signal }) => getTeams(signal),
  });
