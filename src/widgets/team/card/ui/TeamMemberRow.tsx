import { useState } from 'react';
import { App, Button, Dropdown, Input } from 'antd';
import type { MenuProps } from 'antd';
import { Crown, FolderPlus, MoreHorizontal, UserMinus, UserPen } from 'lucide-react';
import { userDisplayName, type UnifiedUser } from '@/entities/user';
import { MemberIdentity } from './MemberIdentity';

interface TeamMemberRowProps {
  member: UnifiedUser;
  team: string;
  /** Список доступных команд для пункта меню «Перенести». */
  allTeams: readonly string[];
  /** Кандидат — лид этой команды? */
  isLead: boolean;
  /** Назначить этого пользователя лидом команды. */
  onAssignLead: () => Promise<void>;
  /** Перевести в другую команду (или создать новую — имя свободно). */
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

  // Promise.reject в onOk оставляет confirm открытым (стандартный UX antd).
  // Ошибка тоста показывается из caller'а (handleAssignLead/handleMoveMember
  // в TeamsPage) — у них есть try/catch вокруг store-операций.
  // Защита от случайного клика в Dropdown: лида сменить так же дёшево, как
  // и нажать «не туда». Confirm с понятной фразой «прежний будет снят».
  const confirmAssignLead = () => {
    modal.confirm({
      title: 'Сделать лидом?',
      content: `${userDisplayName(member)} станет лидом команды «${team}». Прежний лид (если был) будет снят автоматически.`,
      okText: 'Сделать лидом',
      cancelText: 'Отмена',
      onOk: handleAssignLead,
    });
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

  const promptNewTeam = () => {
    let value = '';
    modal.confirm({
      title: 'В новую команду',
      content: (
        <div style={{ marginTop: 12 }}>
          <Input
            autoFocus
            placeholder="Имя новой команды"
            onChange={(e) => {
              value = e.target.value;
            }}
          />
        </div>
      ),
      okText: 'Перенести',
      cancelText: 'Отмена',
      onOk: () => {
        const trimmed = value.trim();
        if (!trimmed) return Promise.reject(new Error('Имя команды обязательно'));
        return handleMove(trimmed);
      },
    });
  };

  const moveTargets = allTeams.filter((t) => t !== team);
  const moveItems: MenuProps['items'] = [
    ...moveTargets.map((t) => ({
      key: `move:${t}`,
      label: t,
      onClick: () => handleMove(t),
    })),
    ...(moveTargets.length > 0 ? [{ type: 'divider' as const, key: 'move-div' }] : []),
    {
      key: 'move:new',
      label: 'В новую команду…',
      icon: <FolderPlus size={14} />,
      onClick: promptNewTeam,
    },
  ];

  const menuItems: MenuProps['items'] = [
    ...(isLead
      ? []
      : [
          {
            key: 'assign-lead',
            label: 'Сделать лидом',
            icon: <Crown size={14} />,
            onClick: confirmAssignLead,
          },
        ]),
    {
      key: 'move',
      label: 'Перенести в',
      icon: <UserPen size={14} />,
      children: moveItems,
    },
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
      <MemberIdentity user={member} isLead={isLead} />

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
