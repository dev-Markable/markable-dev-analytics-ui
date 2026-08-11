import { useMemo, useState } from 'react';
import { Modal } from 'antd';
import { Link } from 'react-router-dom';
import { Badge } from 'antd';
import { ChevronRight, EyeOff, History, TrendingDown, Users, type LucideIcon } from 'lucide-react';
import type { AuthorActivity } from '@/entities/user';
import type { ReviewAuthor } from '@/entities/stats';
import { buildProfilePath } from '@/app/router/paths';
import type { DateRange } from '@/shared/lib';
import { buildSignals, type Signal, type SignalKind, type SignalSeverity } from '../lib/build-signals';

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

interface SignalsListProps {
  current: readonly AuthorActivity[];
  previous: readonly AuthorActivity[];
  reviews: readonly ReviewAuthor[];
  range: DateRange;
  loading?: boolean;
  /** Сколько сигналов показать в колонке; остальные — по кнопке в модалке. */
  limit?: number;
}

/**
 * Лента рисков без собственной карточки-обёртки: заголовок и рамку рисует родитель.
 * Так один и тот же список встраивается и в широкий блок, и в узкую колонку.
 */
export function SignalsList({
  current,
  previous,
  reviews,
  range,
  loading,
  limit = 4,
}: SignalsListProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const signals = useMemo(
    () => buildSignals({ current, previous, reviews }),
    [current, previous, reviews],
  );

  if (loading && current.length === 0) {
    return <div className="signals__skeleton" />;
  }

  if (signals.length === 0) {
    return (
      <p className="signals__empty">
        Заметных рисков за период не найдено — активность и ревью в норме.
      </p>
    );
  }

  return (
    <>
      {/* В колонке — только первые N: высота блока остаётся постоянной, без скролла.
          Полный список открывается в модалке, где его удобно разбирать. */}
      <div className="signals__list">
        {signals.slice(0, limit).map((s) => (
          <SignalRow key={s.id} signal={s} range={range} />
        ))}
      </div>

      {signals.length > limit && (
        <button type="button" className="signals__toggle" onClick={() => setModalOpen(true)}>
          Показать все {signals.length}
        </button>
      )}

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={720}
        title={`Требует внимания · ${signals.length}`}
      >
        <div className="signals__list signals__list--modal">
          {signals.map((s) => (
            <SignalRow key={s.id} signal={s} range={range} />
          ))}
        </div>
      </Modal>
    </>
  );
}
