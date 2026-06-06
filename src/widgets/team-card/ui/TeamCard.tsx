import { Card, Empty, Typography } from 'antd';
import { Users } from 'lucide-react';
import type { Team } from '@/entities/team';
import { TeamMemberRow } from './TeamMemberRow';

interface TeamCardProps {
  team: Team;
  /** Список всех команд (для пункта меню «Перенести в»). */
  allTeams: readonly string[];
  onAssignLead: (team: string, email: string | null) => Promise<void>;
  onMoveMember: (email: string, team: string | null) => Promise<void>;
}

export function TeamCard({ team, allTeams, onAssignLead, onMoveMember }: TeamCardProps) {
  // Сортируем: лид — наверх, далее по имени.
  const sortedMembers = [...team.members].sort((a, b) => {
    const aLead = a.email === team.lead?.email ? 0 : 1;
    const bLead = b.email === team.lead?.email ? 0 : 1;
    if (aLead !== bLead) return aLead - bLead;
    return (a.name ?? a.email).localeCompare(b.name ?? b.email);
  });

  return (
    <Card variant="borderless" className="leaderboard-card team-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Users size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            {team.name}
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          {team.members.length}{' '}
          {team.members.length === 1 ? 'участник' : 'участников'}
          {team.lead ? (
            <>
              {' · лид: '}
              <strong>{team.lead.name ?? team.lead.email}</strong>
            </>
          ) : (
            ' · лид не назначен'
          )}
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body team-card__members">
        {sortedMembers.length === 0 ? (
          <Empty description="В команде нет участников" />
        ) : (
          sortedMembers.map((m) => (
            <TeamMemberRow
              key={m.email}
              member={m}
              team={team.name}
              allTeams={allTeams}
              isLead={m.email === team.lead?.email}
              onAssignLead={() => onAssignLead(team.name, m.email)}
              onMoveToTeam={(next) => onMoveMember(m.email, next)}
            />
          ))
        )}
      </div>
    </Card>
  );
}
