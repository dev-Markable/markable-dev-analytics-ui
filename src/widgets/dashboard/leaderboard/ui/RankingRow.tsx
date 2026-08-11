import { Link } from 'react-router-dom';
import { buildProfilePath } from '@/app/router/paths';
import {
  ActivityBadge,
  UserAvatar,
  authorAsUser,
  userDisplayName,
  type AuthorActivity,
} from '@/entities/user';
import { TeamChip } from '@/entities/team';
import type { DateRange } from '@/shared/lib';
import { formatNumber } from '@/shared/lib';
import { RankBadge } from './RankBadge';
import { AnomalyBadges } from './AnomalyBadges';
import type { Anomaly } from '../lib/detect-anomalies';

interface RankingRowProps {
  rank: number;
  data: AuthorActivity;
  range: DateRange;
  variant: 'top' | 'outsider';
  /** Команда уже в глобальном фильтре — не повторяем чип в каждой строке. */
  hideTeam: boolean;
  /** Аномалии активности этого автора (простой/спад/мало тестов). */
  anomalies?: readonly Anomaly[];
}

/**
 * Строка рейтинга: позиция, разработчик, коммиты и строки кода.
 *
 * Порядок в списке уже отражает вклад, поэтому дополнительной визуализации масштаба
 * (полосы/заливки) здесь нет — она добавляла шум, не добавляя смысла.
 */
export function RankingRow({ rank, data, range, variant, hideTeam, anomalies }: RankingRowProps) {
  const user = authorAsUser(data);

  return (
    <Link
      to={buildProfilePath(data.email, range)}
      className={`ranking-row ranking-row--${variant}`}
      aria-label={`Профиль ${data.email}`}
    >
      <RankBadge rank={rank} variant={variant} />

      <UserAvatar user={user} size={34} isLead={data.isLead} />

      <span className="ranking-row__identity">
        <span className="ranking-row__name-line">
          <span className="ranking-row__name">{userDisplayName(user)}</span>
          {data.activity && <ActivityBadge activity={data.activity} compact />}
          {anomalies && anomalies.length > 0 && <AnomalyBadges anomalies={anomalies} />}
          {!hideTeam && <TeamChip team={data.team} compact />}
        </span>
        <span className="ranking-row__email">{data.email}</span>
      </span>

      <span className="ranking-row__commits">
        <span className="ranking-row__commits-value">{formatNumber(data.nonMergeCommits)}</span>
        <span className="ranking-row__commits-label">
          {data.mergeCommits > 0 ? `коммитов · +${data.mergeCommits} merge` : 'коммитов'}
        </span>
      </span>

      <span className="ranking-row__lines">
        <span className="ranking-row__added">+{formatNumber(data.addedLines)}</span>
        <span className="ranking-row__deleted">−{formatNumber(data.deletedLines)}</span>
      </span>
    </Link>
  );
}
