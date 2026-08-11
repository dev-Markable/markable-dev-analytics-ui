import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Bug, CalendarClock, GitMerge } from 'lucide-react';
import { mergedMrsQuery } from '@/entities/stats';
import { useCurrentUser } from '@/entities/auth';
import { ROUTES } from '@/app/router/paths';
import { formatNumber } from '@/shared/lib';

interface SectionLinksProps {
  range: { from: string; to: string };
  /** Имя выбранной команды или null («вся компания»). */
  team: string | null;
}

/**
 * Входы в аналитические разделы с главной.
 *
 * <b>Почему не у всех есть цифра.</b> Вмерженные MR считаются в БД — их дёшево показать
 * прямо здесь. Дефекты же тянутся live из Kaiten (минуты на команду), а таймшит —
 * персональный запрос; предзагружать их на главной нельзя, иначе дашборд будет ждать
 * внешний API. Поэтому у них — описание и переход в раздел.
 */
export function SectionLinks({ range, team }: SectionLinksProps) {
  const { data: me } = useCurrentUser();

  const mergedQ = useQuery(
    mergedMrsQuery({ from: range.from, to: range.to, team: team ?? '' }),
  );

  return (
    <div className="section-links">
      <SectionLink
        to={ROUTES.mergedMrs}
        icon={<GitMerge size={17} />}
        title="Вмерженные MR"
        value={team ? (mergedQ.data ? formatNumber(mergedQ.data.total) : '—') : null}
        hint={team ? `команда «${team}»` : 'выберите команду в фильтре'}
      />
      <SectionLink
        to={ROUTES.defects}
        icon={<Bug size={17} />}
        title="Дефекты по приоритету"
        value={null}
        hint="разбивка по периодам и доля AI-агента"
      />
      <SectionLink
        to={me ? `${ROUTES.timesheet}?email=${encodeURIComponent(me.email)}` : ROUTES.timesheet}
        icon={<CalendarClock size={17} />}
        title="Таймшит"
        value={null}
        hint={me ? 'ваши трудозатраты по дням' : 'трудозатраты по дням'}
      />
    </div>
  );
}

interface SectionLinkProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  /** Готовая цифра, если её дёшево посчитать. null — показываем только описание. */
  value: string | null;
  hint: string;
}

function SectionLink({ to, icon, title, value, hint }: SectionLinkProps) {
  return (
    <Link to={to} className="section-link">
      <span className="section-link__icon">{icon}</span>
      <span className="section-link__body">
        <span className="section-link__title">{title}</span>
        <span className="section-link__hint">{hint}</span>
      </span>
      {value !== null && <span className="section-link__value">{value}</span>}
      <ArrowUpRight size={15} className="section-link__arrow" />
    </Link>
  );
}
