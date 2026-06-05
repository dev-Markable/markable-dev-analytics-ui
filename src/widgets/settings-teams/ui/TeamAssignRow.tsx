import { useState } from 'react';
import { AutoComplete, Button, Tooltip } from 'antd';
import { Check, X } from 'lucide-react';
import { UserAvatar, userDisplayName, type UnifiedUser } from '@/entities/user';

interface TeamAssignRowProps {
  user: UnifiedUser;
  teamOptions: string[];
  onAssign: (email: string, team: string | null) => Promise<void>;
}

export function TeamAssignRow({ user, teamOptions, onAssign }: TeamAssignRowProps) {
  const [value, setValue] = useState(user.team ?? '');
  const [saving, setSaving] = useState(false);

  const trimmed = value.trim();
  const normalized = trimmed === '' ? null : trimmed;
  const dirty = normalized !== (user.team ?? null);

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await onAssign(user.email, normalized);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => setValue(user.team ?? '');

  return (
    <div className="team-assign-row">
      <div className="team-assign-row__user">
        <UserAvatar user={user} size={32} />
        <div className="team-assign-row__meta">
          <span className="team-assign-row__name">{userDisplayName(user)}</span>
          <span className="team-assign-row__email">{user.email}</span>
        </div>
      </div>

      <div className="team-assign-row__control">
        <AutoComplete
          value={value}
          onChange={setValue}
          onSelect={(v) => setValue(v)}
          options={teamOptions.map((t) => ({ value: t }))}
          placeholder="Без команды"
          allowClear
          filterOption={(input, option) =>
            (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
          }
          style={{ width: 200 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void save();
          }}
        />
        {dirty && (
          <>
            <Tooltip title="Сохранить">
              <Button
                type="primary"
                size="small"
                icon={<Check size={14} />}
                loading={saving}
                onClick={() => void save()}
              />
            </Tooltip>
            <Tooltip title="Отменить">
              <Button size="small" icon={<X size={14} />} onClick={reset} disabled={saving} />
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
}
