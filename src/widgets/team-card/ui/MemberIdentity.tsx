import { Tooltip, Typography } from 'antd';
import { Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserAvatar, userDisplayName, type UnifiedUser } from '@/entities/user';
import { buildProfilePath } from '@/app/router/paths';

interface MemberIdentityProps {
  user: UnifiedUser;
  /** Является ли участник лидом — рисует корону-бейдж и mark в имени. */
  isLead?: boolean;
}

/**
 * Общая «левая часть» строки участника на странице /teams.
 * Используется в TeamMemberRow и UnassignedSection.UnassignedRow.
 * Кликабельна — ведёт на профиль.
 */
export function MemberIdentity({ user, isLead = false }: MemberIdentityProps) {
  return (
    <Link to={buildProfilePath(user.email)} className="team-member__user">
      <UserAvatar user={user} size={32} isLead={isLead} />
      <span className="team-member__identity">
        <Typography.Text strong className="team-member__name">
          {userDisplayName(user)}
          {isLead && (
            <Tooltip title="Лид команды">
              <span className="team-member__lead-mark">
                <Crown size={12} />
              </span>
            </Tooltip>
          )}
        </Typography.Text>
        <Typography.Text type="secondary" className="team-member__email">
          {user.email}
        </Typography.Text>
      </span>
    </Link>
  );
}
