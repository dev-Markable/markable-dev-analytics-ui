import { useEffect, useMemo } from 'react';
import { Select } from 'antd';
import { Users } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTeamsStore } from '@/entities/team';
import { ALL_TEAMS, NO_TEAM, useTeamScopeStore } from '../model/team-scope.store';

/** Глобальный пикер команды в топбаре. Имена команд — из /teams. */
export function TeamScopePicker() {
  const scope = useTeamScopeStore((s) => s.scope);
  const setScope = useTeamScopeStore((s) => s.setScope);

  const state = useTeamsStore(useShallow((s) => s.state));
  const fetchTeams = useTeamsStore((s) => s.fetch);

  useEffect(() => {
    void fetchTeams();
  }, [fetchTeams]);

  const options = useMemo(() => {
    const teams = state.data ?? [];
    const sorted = [...teams].sort((a, b) => a.name.localeCompare(b.name));
    return [
      { value: ALL_TEAMS, label: 'Вся компания' },
      ...sorted.map((t) => ({ value: t.name, label: t.name })),
      { value: NO_TEAM, label: 'Без команды' },
    ];
  }, [state.data]);

  return (
    <Select
      value={scope}
      onChange={setScope}
      options={options}
      loading={state.status === 'loading' && !state.data}
      size="middle"
      variant="filled"
      suffixIcon={<Users size={14} />}
      style={{ minWidth: 180 }}
      popupMatchSelectWidth={false}
    />
  );
}
