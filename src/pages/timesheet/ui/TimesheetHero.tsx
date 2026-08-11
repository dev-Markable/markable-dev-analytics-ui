import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Timesheet } from '@/entities/stats';
import { UserAvatar, usersQuery } from '@/entities/user';
import { averagePerLoggedDay, formatHours } from '../lib/hours';
import { DeveloperPicker } from './DeveloperPicker';

interface TimesheetHeroProps {
  email: string | null;
  onChange: (email: string) => void;
  locked: boolean;
  /** Нет данных (не выбран разработчик / грузится) — показываем только выбор. */
  data: Timesheet | null;
}

/**
 * Шапка таймшита: кто + сводка за период в одной строке.
 *
 * Раньше это были две зоны — карточка с одним селектом на всю ширину и ряд из трёх
 * MetricCard (у одной был hint, из-за чего ряд визуально «съезжал»). Здесь всё в одном
 * блоке: аватар и пикер слева, статистика справа — выровнено по базовой линии.
 */
export function TimesheetHero({ email, onChange, locked, data }: TimesheetHeroProps) {
  const usersQ = useQuery(usersQuery());

  const user = useMemo(
    () => (email ? (usersQ.data ?? []).find((u) => u.email === email) : undefined),
    [usersQ.data, email],
  );

  return (
    <section className="ts-hero">
      <div className="ts-hero__person">
        {user ? (
          <UserAvatar user={user} size={44} isLead={user.isLead} />
        ) : (
          <span className="ts-hero__avatar-stub" aria-hidden />
        )}
        <div className="ts-hero__ident">
          <DeveloperPicker email={email} onChange={onChange} locked={locked} />
          <span className="ts-hero__sub">
            {user ? (
              <>
                {user.team && <span className="ts-hero__team">{user.team}</span>}
                <span className="ts-hero__email">{user.email}</span>
              </>
            ) : (
              <span className="ts-hero__email">Выберите, чьи трудозатраты показать</span>
            )}
          </span>
        </div>
      </div>

      {data && (
        <div className="ts-hero__stats">
          <Stat value={`${formatHours(data.totalMinutes)}`} unit="ч" label="всего за период" />
          <Stat value={String(data.loggedDays)} label="дней со списаниями" />
          <Stat
            value={String(averagePerLoggedDay(data.totalMinutes, data.loggedDays))}
            unit="ч"
            label="в среднем за день"
          />
        </div>
      )}
    </section>
  );
}

function Stat({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <div className="ts-stat">
      <span className="ts-stat__value">
        {value}
        {unit && <span className="ts-stat__unit">{unit}</span>}
      </span>
      <span className="ts-stat__label">{label}</span>
    </div>
  );
}
