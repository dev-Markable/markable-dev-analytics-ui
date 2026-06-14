import { memo } from 'react';
import { Link } from 'react-router-dom';
import { UserAvatar } from '@/entities/user';
import { buildProfilePath } from '@/app/router/paths';
import type { CohortDeveloper } from '@/entities/cohort';
import { formatCompact, type DateRange } from '@/shared/lib';
import { intensityLevel } from '../lib/intensity';
import { totalCommits } from '../lib/sort';

interface MatrixRowProps {
  dev: CohortDeveloper;
  months: readonly string[];
  max: number;
  template: string;
  range?: DateRange;
}

export const MatrixRow = memo(function MatrixRow({ dev, months, max, template, range }: MatrixRowProps) {
  const user = {
    email: dev.email,
    name: dev.displayName ?? null,
    username: null,
    avatarUrl: dev.avatarUrl ?? null,
  };
  // Контекст сортировки в строке: команда / стаж (firstActive) / сумма коммитов —
  // чтобы эффект «по команде / по стажу / по активности» был виден глазом.
  const meta = [
    dev.team ?? null,
    `с ${dev.firstActive}`,
    `Σ ${formatCompact(totalCommits(dev))}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="matrix__row" style={{ gridTemplateColumns: template }}>
      <Link
        to={buildProfilePath(dev.email, range ?? null)}
        className="matrix__namecell"
        title={dev.team ? `${dev.email} · ${dev.team}` : dev.email}
      >
        <UserAvatar user={user} size={22} />
        <span className="matrix__identity">
          <span className="matrix__name">{dev.displayName ?? dev.email}</span>
          <span className="matrix__meta">{meta}</span>
        </span>
      </Link>
      {dev.cells.map((c, i) => (
        <div
          key={i}
          className={`matrix__cell matrix__cell--l${intensityLevel(c, max)}`}
          title={`${months[i]} · ${c} коммит(ов)`}
        />
      ))}
    </div>
  );
});
