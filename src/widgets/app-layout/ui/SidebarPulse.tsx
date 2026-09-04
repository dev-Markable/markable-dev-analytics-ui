import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dailyQuery } from '@/entities/stats';
import { dayjs } from '@/shared/lib';

const DAYS = 14;

/**
 * Мини-лента коммитов за последние 14 дней под брендом — фирменный мотив
 * «пульса» прямо в каркасе приложения. Считается по всей компании, без
 * командного скопа: это декоративный элемент, а не метрика для решения.
 *
 * Запрос тот же dailyQuery, что и у страниц: один маленький запрос до первого
 * дашборда, дальше отвечает кэш react-query. Без данных (ошибка, пустой месяц)
 * лента просто не рисуется — каркас не должен сигнализировать об ошибках.
 */
export function SidebarPulse() {
  const to = dayjs().format('YYYY-MM-DD');
  const from = dayjs().subtract(DAYS - 1, 'day').format('YYYY-MM-DD');
  const { data } = useQuery(dailyQuery({ from, to }));

  // daily — сырые строки (день × автор × репо), сводим в один ряд по дням.
  const byDay = useMemo(() => {
    const acc = new Map<string, number>();
    for (const row of data ?? []) {
      acc.set(row.date, (acc.get(row.date) ?? 0) + row.commits);
    }
    return [...acc.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [data]);

  const max = Math.max(0, ...byDay.map(([, commits]) => commits));
  if (byDay.length === 0 || max === 0) return null;

  return (
    <div className="app-sider__pulse" aria-hidden title={`Коммиты за последние ${DAYS} дней`}>
      {byDay.map(([date, commits]) => (
        <span
          key={date}
          className={`app-sider__pulse-bar${date === to ? ' app-sider__pulse-bar--today' : ''}`}
          style={{ height: `${Math.max(8, Math.round((commits / max) * 100))}%` }}
        />
      ))}
    </div>
  );
}
