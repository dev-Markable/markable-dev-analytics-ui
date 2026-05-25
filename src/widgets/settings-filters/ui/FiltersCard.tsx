import { Card, Switch, Typography } from 'antd';
import { Users } from 'lucide-react';
import { useTeamFilterStore, useTeamMembersStore } from '@/features/team-filter';
import { TeamMembersEditor } from './TeamMembersEditor';

export function FiltersCard() {
  const enabled = useTeamFilterStore((s) => s.enabled);
  const toggle = useTeamFilterStore((s) => s.toggle);
  const memberCount = useTeamMembersStore((s) => s.members.length);

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Users size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Команда и фильтрация
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Глобальный фильтр «только команда» применяется на дашборде, недельках и активности
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        <div className="settings-row">
          <div className="settings-row__main">
            <Typography.Text strong style={{ fontSize: 14 }}>
              Только команда
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Скрывает авторов, которых нет в списке ниже
            </Typography.Text>
          </div>
          <div className="settings-row__control">
            <Switch checked={enabled} onChange={toggle} />
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-row settings-row--column">
          <div className="settings-row__main">
            <Typography.Text strong style={{ fontSize: 14 }}>
              Члены команды
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {memberCount}{' '}
              {memberCount === 1 ? 'email в списке' : 'email-ов в списке'}. Изменения
              сохраняются в браузере (localStorage).
            </Typography.Text>
          </div>
          <TeamMembersEditor />
        </div>
      </div>
    </Card>
  );
}
