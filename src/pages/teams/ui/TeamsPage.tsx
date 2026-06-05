import { useCallback, useEffect, useMemo } from 'react';
import { App, Col, Row, Skeleton } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { PageHeader, PageSection, ErrorState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useTeamsStore } from '@/entities/team';
import { useUsersStore } from '@/entities/user';
import { TeamCard, UnassignedSection } from '@/widgets/team-card';

export function TeamsPage() {
  useDocumentTitle('Команды');
  const { message } = App.useApp();

  const teamsState = useTeamsStore(useShallow((s) => s.state));
  const fetchTeams = useTeamsStore((s) => s.fetch);
  const assignLeadStore = useTeamsStore((s) => s.assignLead);

  const usersState = useUsersStore(useShallow((s) => s.state));
  const fetchUsers = useUsersStore((s) => s.fetch);
  const assignTeamStore = useUsersStore((s) => s.assignTeam);

  useEffect(() => {
    void fetchTeams();
    void fetchUsers();
  }, [fetchTeams, fetchUsers]);

  useApiErrorNotification(teamsState.error, 'Не удалось загрузить команды');

  const teams = useMemo(() => {
    const arr = teamsState.data ?? [];
    return [...arr].sort((a, b) => a.name.localeCompare(b.name));
  }, [teamsState.data]);

  const teamNames = useMemo(() => teams.map((t) => t.name), [teams]);

  const unassignedUsers = useMemo(() => {
    const users = usersState.data ?? [];
    return [...users]
      .filter((u) => !u.team)
      .sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email));
  }, [usersState.data]);

  /**
   * Стратегия мутаций: оптимистично обновляем то, что вернул бэк, а параллельно
   * (без await) тянем свежий список команд. Это даёт мгновенный фидбек, но
   * гарантирует консистентность для случаев, которые точечный optimistic не
   * покрывает: например, при назначении лида участник может прийти из другой
   * команды — у неё тоже состав изменился, и эту команду assignLead в кэше
   * не трогает. Refetch с force=true инвалидирует TTL-кэш.
   *
   * Гонки между быстрыми кликами защищены `raceGuard` внутри useTeamsStore.fetch
   * (только последний ответ запишется в state).
   */
  const handleAssignLead = useCallback(
    async (team: string, email: string | null) => {
      try {
        await assignLeadStore(team, email);
        void fetchTeams(true);
        void message.success(email ? 'Лид назначен' : 'Лид снят');
      } catch {
        void message.error('Не удалось обновить лида');
      }
    },
    [assignLeadStore, fetchTeams, message],
  );

  const handleMoveMember = useCallback(
    async (email: string, team: string | null) => {
      try {
        await assignTeamStore(email, team);
        // Move перевешивает участника между командами — затрагивает обе.
        void fetchTeams(true);
        void message.success(team ? `Перенесён в «${team}»` : 'Исключён из команды');
      } catch {
        void message.error('Не удалось обновить команду');
      }
    },
    [assignTeamStore, fetchTeams, message],
  );

  const handleAssignToTeam = useCallback(
    async (email: string, team: string) => {
      try {
        await assignTeamStore(email, team);
        void fetchTeams(true);
        void message.success(`Добавлен в «${team}»`);
      } catch {
        void message.error('Не удалось добавить в команду');
      }
    },
    [assignTeamStore, fetchTeams, message],
  );

  const isInitialLoading =
    (teamsState.status === 'loading' && !teamsState.data) ||
    (usersState.status === 'loading' && !usersState.data);
  const isError = teamsState.status === 'error' && !teamsState.data;

  return (
    <>
      <PageHeader
        title="Команды"
        subtitle="Состав команд и лиды. Имена команд — свободный текст; новая команда появляется автоматически при назначении первого участника."
      />

      {isError ? (
        <ErrorState error={teamsState.error} onRetry={() => fetchTeams(true)} />
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
