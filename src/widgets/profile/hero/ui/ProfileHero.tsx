import { Tooltip } from 'antd';
import { Crown } from 'lucide-react';
import { UserAvatar, userDisplayName, type AuthorSummary, type UnifiedUser } from '@/entities/user';
import { formatNumber } from '@/shared/lib';

interface ProfileHeroProps {
  user: UnifiedUser;
  summary: AuthorSummary;
  /** Карточек Kaiten в работе — третья ключевая цифра. */
  activeCards: number;
  /** Подпись периода из шапки страницы. */
  period: string;
}

/**
 * Шапка профиля: кто + ключевые цифры периода.
 *
 * Раньше имя показывалось трижды — в заголовке страницы, в карточке профиля и в её
 * подзаголовке, — а технические идентификаторы (Kaiten, GitLab) висели цветными
 * тегами наравне с командой. Здесь один блок: слева личность, справа три главные
 * метрики; идентификаторы ушли в тултип аватара, где не мешают.
 */
export function ProfileHero({ user, summary, activeCards, period }: ProfileHeroProps) {
  const name = userDisplayName(user);
  const nonMerge = summary.commits - summary.mergeCommits;

  const ids = [
    user.username ? `@${user.username}` : null,
    user.kaitenId != null ? `Kaiten #${user.kaitenId}` : null,
    user.gitlabId != null ? `GitLab #${user.gitlabId}` : null,
  ].filter(Boolean);

  return (
    <section className="profile-hero">
      <div className="profile-hero__person">
        <Tooltip title={ids.length > 0 ? ids.join(' · ') : undefined} placement="bottomLeft">
          <span className="profile-hero__avatar">
            <UserAvatar user={user} size={64} isLead={user.isLead} />
          </span>
        </Tooltip>

        <div className="profile-hero__ident">
          <h1 className="profile-hero__name">{name}</h1>
          <div className="profile-hero__meta">
            <span className="profile-hero__email">{user.email}</span>
            {user.team && (
              <span className="profile-hero__team">
                {user.isLead && <Crown size={11} />}
                {user.team}
              </span>
            )}
          </div>
          <span className="profile-hero__period">{period}</span>
        </div>
      </div>

      <div className="profile-hero__stats">
        <Stat value={formatNumber(nonMerge)} label="коммитов" hint={`+${summary.mergeCommits} merge`} />
        <Stat
          value={`+${formatNumber(summary.addedLines)}`}
          label="строк добавлено"
          hint={`−${formatNumber(summary.deletedLines)} удалено`}
          tone="added"
        />
        <Stat value={formatNumber(activeCards)} label="карточек в работе" />
      </div>
    </section>
  );
}

interface StatProps {
  value: string;
  label: string;
  hint?: string;
  tone?: 'added';
}

function Stat({ value, label, hint, tone }: StatProps) {
  return (
    <div className="profile-hero__stat">
      <span className={`profile-hero__stat-value${tone ? ` profile-hero__stat-value--${tone}` : ''}`}>
        {value}
      </span>
      <span className="profile-hero__stat-label">{label}</span>
      {hint && <span className="profile-hero__stat-hint">{hint}</span>}
    </div>
  );
}
