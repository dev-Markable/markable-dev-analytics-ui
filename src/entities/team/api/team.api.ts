import { apiClient } from '@/shared/api';
import type { Team } from '../model/types';

/** Список всех команд с лидом и участниками. */
export async function getTeams(signal?: AbortSignal): Promise<Team[]> {
  const { data } = await apiClient.get<Team[]>('/teams', { signal });
  return data;
}

/**
 * Назначить/снять лида команды.
 * Бэк держит инвариант «один лид»: новый лид добавляется в команду и/или
 * перевешивает прежнего; `email = null` — снять лида с команды.
 */
export async function setTeamLead(team: string, email: string | null): Promise<Team> {
  const { data } = await apiClient.put<Team>('/teams/lead', { team, email });
  return data;
}
