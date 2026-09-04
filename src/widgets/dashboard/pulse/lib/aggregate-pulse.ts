import type { DailyStat } from '@/entities/stats';
import { dayjs, dayKind, type DateRange, type DayKind } from '@/shared/lib';

export interface PulsePoint {
  /** ISO-дата дня. */
  date: string;
  commits: number;
  addedLines: number;
  /** Сколько уникальных авторов коммитили в этот день. */
  authors: number;
  /** Рабочий / выходной / праздник — для штриховки и подписи в тултипе. */
  kind: DayKind;
}

/**
 * Дневные агрегаты (email × date × repo) → непрерывный ряд по дням периода.
 *
 * Один день приходит несколькими строками (по автору и репозиторию), поэтому
 * схлопываем: коммиты и строки суммируем, авторов считаем как уникальные email.
 *
 * Ряд достраивается нулями на весь период. Раньше в него попадали только дни,
 * пришедшие с бэка, и график получался нечестным дважды: правый край стоял на
 * последнем дне с коммитами (неделя 3–9 августа обрывалась на 7-м), а мёртвый день
 * в середине не проваливался в ноль — линия рисовалась прямой через соседей, и
 * простой выглядел плавной ложбиной на трети шкалы.
 *
 * Хвост в будущее обрезается сегодняшним днём: период, выбранный «до конца месяца»,
 * иначе даёт плоский ноль до 31-го числа и читается как обвал команды. Та же
 * логика, что в детекторе аномалий.
 */
export function aggregatePulse(daily: readonly DailyStat[], range?: DateRange): PulsePoint[] {
  const byDate = new Map<string, { commits: number; addedLines: number; authors: Set<string> }>();

  const touch = (date: string) => {
    let acc = byDate.get(date);
    if (!acc) {
      acc = { commits: 0, addedLines: 0, authors: new Set() };
      byDate.set(date, acc);
    }
    return acc;
  };

  for (const row of daily) {
    const acc = touch(row.date);
    acc.commits += row.commits;
    acc.addedLines += row.addedLines;
    acc.authors.add(row.email.toLowerCase());
  }

  if (range?.from && range.to) {
    const today = dayjs().startOf('day');
    const start = dayjs(range.from).startOf('day');
    const endRaw = dayjs(range.to).startOf('day');
    const end = endRaw.isAfter(today, 'day') ? today : endRaw;

    for (let d = start; !d.isAfter(end, 'day'); d = d.add(1, 'day')) {
      touch(d.format('YYYY-MM-DD'));
    }
  }

  return [...byDate.entries()]
    .map(([date, acc]) => ({
      date,
      commits: acc.commits,
      addedLines: acc.addedLines,
      authors: acc.authors.size,
      kind: dayKind(date),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Самый продуктивный день периода — для подписи под графиком.
 * Дни без коммитов не могут стать пиком: у пустого периода пика нет.
 */
export function peakDay(points: readonly PulsePoint[]): PulsePoint | null {
  const withCommits = points.filter((p) => p.commits > 0);
  if (withCommits.length === 0) return null;
  return withCommits.reduce((best, p) => (p.commits > best.commits ? p : best));
}

export interface NonWorkingBand {
  from: string;
  to: string;
}

/**
 * Непрерывные отрезки нерабочих дней — для фоновых полос на графике.
 *
 * Полосой, а не точкой на день: длинные каникулы читаются одним блоком, и на
 * графике сразу видно, что провал — это календарь, а не команда.
 */
export function nonWorkingBands(points: readonly PulsePoint[]): NonWorkingBand[] {
  const bands: NonWorkingBand[] = [];
  let open: NonWorkingBand | null = null;

  for (const p of points) {
    if (p.kind === 'working') {
      if (open) bands.push(open);
      open = null;
      continue;
    }
    if (open) open.to = p.date;
    else open = { from: p.date, to: p.date };
  }
  if (open) bands.push(open);

  return bands;
}
