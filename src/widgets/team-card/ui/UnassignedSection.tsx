import { useState } from 'react';
import { App, AutoComplete, Button, Card, Empty, Typography } from 'antd';
import { UserPlus, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserAvatar, userDisplayName, type UnifiedUser } from '@/entities/user';
import { buildProfilePath } from '@/app/router/paths';

interface UnassignedSectionProps {
  users: readonly UnifiedUser[];
  /** Существующие команды — для подсказок в AutoComplete. */
  teamOptions: readonly string[];
  onAssign: (email: string, team: string) => Promise<void>;
}

function UnassignedRow({
  user,
  teamOptions,
  onAssign,
}: {
  user: UnifiedUser;
  teamOptions: readonly string[];
  onAssign: (email: string, team: string) => Promise<void>;
}) {
  const { message } = App.useApp();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const team = value.trim();
    if (!team) return;
    setSaving(true);
    try {
      await onAssign(user.email, team);
      setValue('');
    } catch {
      void message.error(`Не удалось добавить ${user.email}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="team-member">
      <Link to={buildProfilePath(user.email)} className="team-member__user">
        <UserAvatar user={user} size={32} />
        <span className="team-member__identity">
          <Typography.Text strong className="team-member__name">
            {userDisplayName(user)}
          </Typography.Text>
          <Typography.Text type="secondary" className="team-member__email">
            {user.email}
          </Typography.Text>
        </span>
      </Link>

      <div className="team-member__assign">
        <AutoComplete
          value={value}
          onChange={setValue}
          options={teamOptions.map((t) => ({ value: t }))}
          placeholder="Имя команды"
          style={{ width: 180 }}
          filterOption={(input, option) =>
            (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') void save();
          }}
        />
        <Button
          type="primary"
          size="small"
          icon={<UserPlus size={14} />}
          loading={saving}
          disabled={value.trim().length === 0}
          onClick={() => void save()}
        >
          Добавить
        </Button>
      </div>
    </div>
  );
}

export function UnassignedSection({ users, teamOptions, onAssign }: UnassignedSectionProps) {
  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <UserX size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Без команды
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          {users.length} {users.length === 1 ? 'разработчик' : 'разработчиков'} без привязки.
          Введите имя существующей команды или создайте новую.
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body team-card__members">
        {users.length === 0 ? (
          <Empty description="Все разработчики привязаны к командам" />
        ) : (
          users.map((u) => (
            <UnassignedRow
              key={u.email}
              user={u}
              teamOptions={teamOptions}
              onAssign={onAssign}
            />
          ))
        )}
      </div>
    </Card>
  );
}
