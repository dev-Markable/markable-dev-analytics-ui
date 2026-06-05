import { useEffect, useMemo, useState } from 'react';
import { App, Card, Empty, Input, Segmented, Skeleton, Typography } from 'antd';
import { UsersRound } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useUsersStore, userDisplayName, type UnifiedUser } from '@/entities/user';
import { useApiErrorNotification } from '@/shared/hooks';
import { ErrorState } from '@/shared/ui';
import { TeamAssignRow } from './TeamAssignRow';

const ALL_TEAMS = '__all__';
const NO_TEAM = '__none__';

export function TeamManagementCard() {
  const state = useUsersStore(useShallow((s) => s.state));
  const fetchUsers = useUsersStore((s) => s.fetch);
  const assignTeam = useUsersStore((s) => s.assignTeam);
  const { message } = App.useApp();

  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>(ALL_TEAMS);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useApiErrorNotification(state.error, 'Не удалось загрузить список пользователей');

  const users = useMemo(() => state.data ?? [], [state.data]);

  // Существующие команды — для автодополнения и фильтра-сегментов.
  const teamOptions = useMemo(() => {
    const set = new Set<string>();
    for (const u of users) if (u.team) set.add(u.team);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...users]
      .filter((u) => {
        if (teamFilter === ALL_TEAMS) return true;
        if (teamFilter === NO_TEAM) return !u.team;
        return u.team === teamFilter;
      })
      .filter((u) => {
        if (!q) return true;
        return (
          u.email.toLowerCase().includes(q) ||
          userDisplayName(u).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => userDisplayName(a).localeCompare(userDisplayName(b)));
  }, [users, search, teamFilter]);

  const handleAssign = async (email: string, team: string | null) => {
    try {
      await assignTeam(email, team);
      void message.success(team ? `Команда: ${team}` : 'Команда снята');
    } catch {
      void message.error(`Не удалось сохранить команду для ${email}`);
    }
  };

  const isLoading = state.status === 'loading' && users.length === 0;
  const isError = state.status === 'error' && users.length === 0;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <UsersRound size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Управление командами
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Назначение команды сохраняется на сервере и используется в Performance Review.
          Команда — свободный текст (без справочника).
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {isError ? (
          <ErrorState error={state.error} onRetry={() => fetchUsers()} />
        ) : isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <>
            <div className="team-management__toolbar">
              <Input.Search
                placeholder="Поиск по имени или email"
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 280 }}
              />
              {teamOptions.length > 0 && (
                <Segmented
                  value={teamFilter}
                  onChange={(v) => setTeamFilter(v as string)}
                  options={[
                    { value: ALL_TEAMS, label: 'Все' },
                    ...teamOptions.map((t) => ({ value: t, label: t })),
                    { value: NO_TEAM, label: 'Без команды' },
                  ]}
                />
              )}
            </div>

            {filtered.length === 0 ? (
              <Empty description="Никого не нашли по фильтрам" />
            ) : (
              <div className="team-management__list">
                {filtered.map((u: UnifiedUser) => (
                  <TeamAssignRow
                    key={u.email}
                    user={u}
                    teamOptions={teamOptions}
                    onAssign={handleAssign}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
