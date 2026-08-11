import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GitCommit, MessageSquare, Plus, Trophy } from 'lucide-react';
import type { AuthorActivity } from '@/entities/user';
import { UserAvatar, authorAsUser, userDisplayName } from '@/entities/user';
import type { ReviewAuthor } from '@/entities/stats';
import { useCurrentUser } from '@/entities/auth';
import { ActivityBadge } from '@/entities/user';
import { buildProfilePath } from '@/app/router/paths';
import { formatNumber } from '@/shared/lib';
import { findMyWeek } from '../lib/find-me';

interface MyWeekCardProps {
  items: readonly AuthorActivity[];
  reviews: readonly ReviewAuthor[];
  range: { from: string; to: string };
}

/**
 * Персональный срез вошедшего пользователя за период.
 *
 * Дашборд по умолчанию — отчёт «про других»; этот блок отвечает на вопрос «а что у меня».
 * Скрывается целиком, если пользователь не коммитил в периоде: показывать нули было бы
 * демотивирующим шумом (отпуск, новичок, другой стек).
 */
export function MyWeekCard({ items, reviews, range }: MyWeekCardProps) {
  const { data: me } = useCurrentUser();
  const mine = useMemo(
    () => findMyWeek(me?.email, items, reviews),
    [me?.email, items, reviews],
  );

  if (!mine) return null;

  const { me: author, rank, total, reviewsGiven, commentsGiven } = mine;
  // AuthorActivity держит имя в displayName, а не в name: без конвертации
  // userDisplayName падал на email — самая личная карточка дашборда здоровалась
  // с человеком его почтой. UserAvatar по той же причине рисовал инициалы из email.
  const user = authorAsUser(author);

  return (
    <section className="my-week">
      <div className="my-week__person">
        <UserAvatar user={user} size={46} isLead={author.isLead} />
        <div className="my-week__ident">
          <span className="my-week__eyebrow">Ваш период</span>
          <Link to={buildProfilePath(author.email, range)} className="my-week__name">
            {userDisplayName(user)}
          </Link>
        </div>
      </div>

      <div className="my-week__stats">
        <Stat icon={<GitCommit size={14} />} value={formatNumber(author.commits)} label="коммитов" />
        <Stat
          icon={<Plus size={14} />}
          value={formatNumber(author.addedLines)}
          label="строк добавлено"
        />
        <Stat icon={<MessageSquare size={14} />} value={formatNumber(reviewsGiven)} label="ревью дано" />
        <Stat
          icon={<Trophy size={14} />}
          value={`#${rank}`}
          label={`из ${total} в рейтинге`}
          accent
        />
      </div>

      {author.activity && (
        <div className="my-week__badge">
          <ActivityBadge activity={author.activity} />
          {commentsGiven > 0 && (
            <span className="my-week__comments">{formatNumber(commentsGiven)} комментариев к MR</span>
          )}
        </div>
      )}
    </section>
  );
}

interface StatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent?: boolean;
}

function Stat({ icon, value, label, accent }: StatProps) {
  return (
    <div className={`my-week__stat${accent ? ' my-week__stat--accent' : ''}`}>
      <span className="my-week__stat-value">{value}</span>
      {/* Иконка ушла в строку подписи: рядом со значением она сдвигала число вправо,
          и подпись под ним оказывалась не на одной вертикали. */}
      <span className="my-week__stat-label">
        <span className="my-week__stat-icon">{icon}</span>
        {label}
      </span>
    </div>
  );
}
