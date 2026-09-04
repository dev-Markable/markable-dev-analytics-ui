import { useMemo } from 'react';
import { Select, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { UserAvatar, userDisplayName, usersQuery } from '@/entities/user';
import { matchesScope, useTeamScope } from '@/features/team-scope';

interface DeveloperPickerProps {
  email: string | null;
  onChange: (email: string) => void;
  /** MEMBER видит только свой таймшит (RBAC) — выбор заблокирован. */
  locked?: boolean;
}

/**
 * Пикер разработчика для таймшита: список из `/users`, отфильтрованный глобальным
 * скопом команды (как в Performance Review — локального дубля фильтра нет).
 */
export function DeveloperPicker({ email, onChange, locked = false }: DeveloperPickerProps) {
  const usersQ = useQuery(usersQuery());
  const scope = useTeamScope();

  const options = useMemo(
    () =>
      [...(usersQ.data ?? [])]
        .filter((u) => matchesScope(u.team ?? null, scope))
        .sort((a, b) => userDisplayName(a).localeCompare(userDisplayName(b)))
        .map((u) => ({ value: u.email, label: userDisplayName(u), user: u })),
    [usersQ.data, scope],
  );

  return (
    <Select
      showSearch
      value={email ?? undefined}
      onChange={onChange}
      options={options}
      disabled={locked}
      loading={usersQ.isPending}
      placeholder="Выберите разработчика"
      variant="borderless"
      style={{ minWidth: 240 }}
      filterOption={(input, option) => {
        const u = option?.user;
        if (!u) return false;
        const haystack = `${userDisplayName(u)} ${u.email} ${u.team ?? ''}`.toLowerCase();
        return haystack.includes(input.toLowerCase());
      }}
      optionRender={({ data }) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <UserAvatar user={data.user} size={22} />
          <span>{data.label}</span>
          {data.user.team && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {data.user.team}
            </Typography.Text>
          )}
        </span>
      )}
    />
  );
}
