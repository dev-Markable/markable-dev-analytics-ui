import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'antd';
import { Bell, TrendingDown, EyeOff, Users, ChevronRight, History, type LucideIcon } from 'lucide-react';
import type { AuthorActivity } from '@/entities/user';
import type { ReviewAuthor } from '@/entities/stats';
import { SectionCard, EmptyState } from '@/shared/ui';
import { buildProfilePath } from '@/app/router/paths';
import type { DateRange } from '@/shared/lib';
import { buildSignals, type Signal, type SignalKind, type SignalSeverity } from '../lib/build-signals';

interface SignalsInboxProps {
  current: readonly AuthorActivity[];
  previous: readonly AuthorActivity[];
  reviews: readonly ReviewAuthor[];
  range: DateRange;
  loading?: boolean;
}

const KIND_ICON: Record<SignalKind, LucideIcon> = {
  'activity-drop': TrendingDown,
  'sustained-low': History,
  unreviewed: EyeOff,
  'review-concentration': Users,
};

const SEVERITY_STATUS: Record<SignalSeverity, 'error' | 'warning' | 'default'> = {
  high: 'error',
  medium: 'warning',
  info: 'default',
};

function SignalRow({ signal, range }: { signal: Signal; range: DateRange }) {
  const Icon = KIND_ICON[signal.kind];
  const body = (
    <>
      <span className={`signals__icon signals__icon--${signal.severity}`}>
        <Icon size={16} />
      </span>
      <span className="signals__text">
        <span className="signals__title">
          <Badge status={SEVERITY_STATUS[signal.severity]} />
          {signal.title}
        </span>
        <span className="signals__detail">{signal.detail}</span>
      </span>
      {signal.email && <ChevronRight size={16} className="signals__chevron" />}
    </>
  );

  return signal.email ? (
    <Link to={buildProfilePath(signal.email, range)} className="signals__row signals__row--link">
      {body}
    </Link>
  ) : (
    <div className="signals__row">{body}</div>
  );
}

/**
 * «Что требует внимания» — лента рисков, собранная на клиенте из данных дашборда
 * (текущий + предыдущий период) и ревью: падения активности, MR без ревью,
 * концентрация ревью. Деталь кликабельна и ведёт в профиль субъекта.
 */
export function SignalsInbox({ current, previous, reviews, range, loading }: SignalsInboxProps) {
  const signals = useMemo(
    () => buildSignals({ current, previous, reviews }),
    [current, previous, reviews],
  );

  const description =
    signals.length > 0
      ? `${signals.length} ${signals.length === 1 ? 'сигнал' : 'сигналов'} за период`
      : 'Риски активности и ревью за период';

  return (
    <SectionCard title="Требует внимания" icon={<Bell size={16} />} description={description}>
      {loading && current.length === 0 ? (
        <div className="signals__skeleton" />
      ) : signals.length === 0 ? (
        <EmptyState title="Всё спокойно" description="Заметных рисков за период не найдено." />
      ) : (
        <div className="signals__list">
          {signals.map((s) => (
            <SignalRow key={s.id} signal={s} range={range} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
