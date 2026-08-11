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
 * Все три карточки одинаковы по строению — это навигация, а не метрики: цифры
 * дашборда живут блоком выше. Раньше у «Вмерженных MR» стояла крупная цифра, а у
 * двух соседей на её месте была пустота, и ряд выглядел рваным.
 *
 * <b>Почему цифра только у одного.</b> Вмерженные MR считаются в БД — их дёшево
 * показать прямо здесь, поэтому счётчик ушёл в подпись. Дефекты тянутся live из
 * Kaiten (минуты на команду), таймшит — персональный запрос к тому же внешнему API;
 * предзагружать их на главной нельзя, иначе дашборд будет ждать Kaiten.
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
        hint={
          team ? (
            <>
              <span className="section-link__count">
                {mergedQ.data ? formatNumber(mergedQ.data.total) : '—'}
              </span>{' '}
              за период · команда «{team}»
            </>
          ) : (
            'выберите команду в фильтре'
          )
        }
      />
      <SectionLink
        to={ROUTES.defects}
        icon={<Bug size={17} />}
        title="Дефекты по приоритету"
        hint="разбивка по периодам и доля AI-агента"
      />
      <SectionLink
        to={me ? `${ROUTES.timesheet}?email=${encodeURIComponent(me.email)}` : ROUTES.timesheet}
        icon={<CalendarClock size={17} />}
        title="Таймшит"
        hint={me ? 'ваши трудозатраты по дням' : 'трудозатраты по дням'}
      />
    </div>
  );
}

interface SectionLinkProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  hint: React.ReactNode;
}

function SectionLink({ to, icon, title, hint }: SectionLinkProps) {
  return (
    <Link to={to} className="section-link">
      <span className="section-link__icon">{icon}</span>
      <span className="section-link__body">
        <span className="section-link__title">{title}</span>
        <span className="section-link__hint">{hint}</span>
      </span>
      <ArrowUpRight size={15} className="section-link__arrow" />
    </Link>
  );
}
