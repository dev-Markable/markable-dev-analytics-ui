import { useCallback, useMemo } from 'react';
import { App, Col, Row, Skeleton } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader, PageSection, ErrorState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { setTeamLead, teamsQuery, teamsQueryKey } from '@/entities/team';
import { setUserTeam, usersQuery } from '@/entities/user';
import { useApiError } from '@/shared/api';
import { TeamCard, UnassignedSection } from '@/widgets/team-card';

export function TeamsPage() {
  useDocumentTitle('Команды');
  const { message } = App.useApp();
  const qc = useQueryClient();

  const teamsQ = useQuery(teamsQuery());
  const usersQ = useQuery(usersQuery());

  const teamsError = useApiError(teamsQ.error);
  useApiErrorNotification(teamsError, 'Не удалось загрузить команды');

  const teams = useMemo(() => {
    const arr = teamsQ.data ?? [];
    return [...arr].sort((a, b) => a.name.localeCompare(b.name));
  }, [teamsQ.data]);

  const teamNames = useMemo(() => teams.map((t) => t.name), [teams]);

  const unassignedUsers = useMemo(() => {
    const users = usersQ.data ?? [];
    return [...users]
      .filter((u) => !u.team)
      .sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email));
  }, [usersQ.data]);

  /**
   * Стратегия мутаций: после успеха invalidate `['teams']` и `['users']` —
   * TanStack сам пересчитает их свежими запросами. Дешевле и проще, чем
   * вручную поддерживать оптимистик-кэш каждой команды.
   *
   * Гонки между быстрыми кликами защищены raceGuard внутри useTeamsStore;
   * после migrate'а — TanStack гарантирует, что только последняя «свежая»
   * query запишется (предыдущие отменятся через AbortController).
   */
  const assignLead = useMutation({
    mutationFn: ({ team, email }: { team: string; email: string | null }) =>
      setTeamLead(team, email),
    onSuccess: (_, { email }) => {
      void qc.invalidateQueries({ queryKey: teamsQueryKey });
      void qc.invalidateQueries({ queryKey: ['users'] });
      void message.success(email ? 'Лид назначен' : 'Лид снят');
    },
    onError: () => {
      void message.error('Не удалось обновить лида');
    },
  });

  const assignTeam = useMutation({
    mutationFn: ({ email, team }: { email: string; team: string | null }) =>
      setUserTeam(email, team),
    onSuccess: (_, { team }) => {
      void qc.invalidateQueries({ queryKey: teamsQueryKey });
      void qc.invalidateQueries({ queryKey: ['users'] });
      void message.success(team ? `Перенесён в «${team}»` : 'Исключён из команды');
    },
    onError: () => {
      void message.error('Не удалось обновить команду');
    },
  });

  const handleAssignLead = useCallback(
    async (team: string, email: string | null): Promise<void> => {
      await assignLead.mutateAsync({ team, email });
    },
    [assignLead],
  );

  const handleMoveMember = useCallback(
    async (email: string, team: string | null): Promise<void> => {
      await assignTeam.mutateAsync({ email, team });
    },
    [assignTeam],
  );

  const handleAssignToTeam = useCallback(
    async (email: string, team: string): Promise<void> => {
      await assignTeam.mutateAsync({ email, team });
    },
    [assignTeam],
  );

  const isInitialLoading =
    (teamsQ.isPending && !teamsQ.data) || (usersQ.isPending && !usersQ.data);
  const isError = teamsQ.isError && !teamsQ.data;

  return (
    <>
      <PageHeader
        title="Команды"
        subtitle="Состав команд и лиды. Имена команд — свободный текст; новая команда появляется автоматически при назначении первого участника."
      />

      {isError ? (
        <ErrorState error={teamsError} onRetry={() => void teamsQ.refetch()} />
      ) : isInitialLoading ? (
        <PageSection>
          <Skeleton active paragraph={{ rows: 8 }} />
        </PageSection>
      ) : (
        <>
          <PageSection>
            <Row gutter={[16, 16]}>
              {teams.map((t) => (
                <Col key={t.name} xs={24} xl={12}>
                  <TeamCard
                    team={t}
                    allTeams={teamNames}
                    onAssignLead={handleAssignLead}
                    onMoveMember={handleMoveMember}
                  />
                </Col>
              ))}
            </Row>
          </PageSection>

          <PageSection>
            <UnassignedSection
              users={unassignedUsers}
              teamOptions={teamNames}
              onAssign={handleAssignToTeam}
            />
          </PageSection>
        </>
      )}
    </>
  );
}
