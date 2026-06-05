import { useState } from 'react';
import { App, Button, Dropdown, Tooltip, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { Crown, MoreHorizontal, UserMinus, UserPen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserAvatar, userDisplayName } from '@/entities/user';
import type { Schemas } from '@/shared/api/schema';
import { buildProfilePath } from '@/app/router/paths';

type UserProfile = Schemas['UserProfile'];

interface TeamMemberRowProps {
  member: UserProfile;
  team: string;
  /** Список доступных команд для пункта меню «Перенести». */
  allTeams: readonly string[];
  /** Кандидат — лид этой команды? */
  isLead: boolean;
  /** Назначить этого пользователя лидом команды. */
  onAssignLead: () => Promise<void>;
  /** Перевести в другую команду. */
  onMoveToTeam: (team: string | null) => Promise<void>;
}

export function TeamMemberRow({
  member,
  team,
  allTeams,
  isLead,
  onAssignLead,
  onMoveToTeam,
}: TeamMemberRowProps) {
  const { modal } = App.useApp();
  const [busy, setBusy] = useState(false);

  const handleAssignLead = async () => {
    setBusy(true);
    try {
      await onAssignLead();
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async (next: string | null) => {
    setBusy(true);
    try {
      await onMoveToTeam(next);
    } finally {
      setBusy(false);
    }
  };

  const confirmExclude = () => {
    modal.confirm({
      title: 'Исключить из команды?',
      content: `${userDisplayName(member)} будет помечен как «без команды».`,
      okText: 'Исключить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: () => handleMove(null),
    });
  };

  const moveTargets = allTeams.filter((t) => t !== team);
  const moveItems: MenuProps['items'] = moveTargets.map((t) => ({
    key: `move:${t}`,
    label: t,
    onClick: () => handleMove(t),
  }));

  const menuItems: MenuProps['items'] = [
    ...(isLead
      ? []
      : [
          {
            key: 'assign-lead',
            label: 'Сделать лидом',
            icon: <Crown size={14} />,
            onClick: handleAssignLead,
          },
        ]),
    ...(moveItems.length > 0
      ? [
          {
            key: 'move',
            label: 'Перенести в',
            icon: <UserPen size={14} />,
            children: moveItems,
          },
        ]
      : []),
    { type: 'divider' as const },
    {
      key: 'exclude',
      label: 'Исключить из команды',
      icon: <UserMinus size={14} />,
      danger: true,
      onClick: confirmExclude,
    },
  ];

  return (
    <div className="team-member">
      <Link to={buildProfilePath(member.email)} className="team-member__user">
        <UserAvatar user={member} size={32} isLead={isLead} />
        <span className="team-member__identity">
          <Typography.Text strong className="team-member__name">
            {userDisplayName(member)}
            {isLead && (
              <Tooltip title="Лид команды">
                <span className="team-member__lead-mark">
                  <Crown size={12} />
                </span>
              </Tooltip>
            )}
          </Typography.Text>
          <Typography.Text type="secondary" className="team-member__email">
            {member.email}
          </Typography.Text>
        </span>
      </Link>

      <Dropdown
        menu={{ items: menuItems }}
        trigger={['click']}
        placement="bottomRight"
        disabled={busy}
      >
        <Button
          type="text"
          size="small"
          icon={<MoreHorizontal size={16} />}
          aria-label="Действия"
          loading={busy}
        />
      </Dropdown>
    </div>
  );
}
