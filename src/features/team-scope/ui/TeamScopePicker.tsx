import { useEffect, useMemo } from 'react';
import { App, Select } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { teamsQuery } from '@/entities/team';
import { ALL_TEAMS, NO_TEAM, useTeamScopeStore } from '../model/team-scope.store';

const SPECIAL_VALUES: ReadonlySet<string> = new Set([ALL_TEAMS, NO_TEAM]);

/** Глобальный пикер команды в топбаре. Имена команд — из /teams. */
export function TeamScopePicker() {
  const { message } = App.useApp();
  const scope = useTeamScopeStore((s) => s.scope);
  const setScope = useTeamScopeStore((s) => s.setScope);

  const teamsQ = useQuery(teamsQuery());

  const teams = useMemo(() => teamsQ.data ?? [], [teamsQ.data]);
  const teamNames = useMemo(() => new Set(teams.map((t) => t.name)), [teams]);

  // Если в persisted-store сохранена команда, которой больше нет на бэке
  // (переименовали/удалили), мягко сбрасываемся в ALL_TEAMS, чтобы фильтр
  // не возвращал пустой список молча. Не трогаем стор, пока список не загружен.
  useEffect(() => {
    if (!teamsQ.isSuccess) return;
    if (SPECIAL_VALUES.has(scope)) return;
    if (teamNames.has(scope)) return;
    setScope(ALL_TEAMS);
    void message.info(`Команда «${scope}» не найдена, фильтр сброшен`);
  }, [teamsQ.isSuccess, scope, teamNames, setScope, message]);

  const options = useMemo(() => {
    const sorted = [...teams].sort((a, b) => a.name.localeCompare(b.name));
    return [
      { value: ALL_TEAMS, label: 'Вся компания' },
      ...sorted.map((t) => ({ value: t.name, label: t.name })),
      { value: NO_TEAM, label: 'Без команды' },
    ];
  }, [teams]);

  return (
    <Select
      value={scope}
      onChange={setScope}
      options={options}
      loading={teamsQ.isPending && !teamsQ.data}
      size="middle"
      variant="filled"
      suffixIcon={<Users size={14} />}
      style={{ minWidth: 180 }}
      popupMatchSelectWidth={false}
    />
  );
}
