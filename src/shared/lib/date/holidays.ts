import { dayjs, type Dayjs } from './dayjs';

/**
 * Производственный календарь РФ: выходные, праздники и переносы.
 *
 * Нужен метрикам, которые считают «рабочие дни» (простой разработчика, темп коммитов):
 * по календарным дням новогодние каникулы или майские выглядят как двухнедельный простой
 * у всей команды.
 *
 * Устроен в три слоя:
 * 1. Суббота и воскресенье — выходные.
 * 2. {@link FIXED_HOLIDAYS} — нерабочие праздничные дни из ст. 112 ТК РФ. Они не меняются
 *    год от года, поэтому заданы как «месяц-день».
 * 3. {@link YEAR_OVERRIDES} — переносы конкретного года (постановление Правительства):
 *    какие выходные стали рабочими и какие дни добавлены к каникулам.
 *
 * Слой 3 — единственное, что требует обновления раз в год. Пока он пуст для года,
 * работает общее правило ст. 112 ТК РФ: праздник, попавший на выходной, переносится
 * на следующий рабочий день (см. {@link shiftedHolidays}).
 */

/** Нерабочие праздничные дни (ст. 112 ТК РФ), формат `MM-DD`. */
const FIXED_HOLIDAYS: readonly string[] = [
  '01-01', // Новогодние каникулы
  '01-02',
  '01-03',
  '01-04',
  '01-05',
  '01-06',
  '01-07', // Рождество Христово
  '01-08',
  '02-23', // День защитника Отечества
  '03-08', // Международный женский день
  '05-01', // Праздник Весны и Труда
  '05-09', // День Победы
  '06-12', // День России
  '11-04', // День народного единства
];

interface YearOverride {
  /** Дополнительные нерабочие дни этого года (переносы, длинные выходные), `YYYY-MM-DD`. */
  holidays?: readonly string[];
  /** Выходные, объявленные рабочими (перенесённые субботы), `YYYY-MM-DD`. */
  workdays?: readonly string[];
}

/**
 * Переносы по годам. Источник — постановление Правительства РФ о переносе выходных
 * дней, публикуется ежегодно (обычно летом на следующий год).
 *
 * ⚠️ Требует обновления раз в год. Пока года нет в справочнике, применяется общее
 * правило переноса из ст. 112 ТК РФ — оно покрывает основной случай (праздник на
 * выходном), но не «удлинённые» каникулы и не рабочие субботы.
 */
const YEAR_OVERRIDES: Readonly<Record<number, YearOverride>> = {
  // Пример заполнения (значения сверяйте с постановлением на нужный год):
  // 2026: {
  //   holidays: ['2026-01-09', '2026-05-11'],
  //   workdays: ['2026-04-25'],
  // },
};

const isoOf = (d: Dayjs): string => d.format('YYYY-MM-DD');
const isWeekend = (d: Dayjs): boolean => d.day() === 0 || d.day() === 6;

/** Праздник по календарю ст. 112 (без учёта переносов). */
const isFixedHoliday = (d: Dayjs): boolean => FIXED_HOLIDAYS.includes(d.format('MM-DD'));

/**
 * Переносы по общему правилу ст. 112 ТК РФ: если праздничный день выпал на выходной,
 * выходным становится следующий рабочий день. Считается для конкретного года и
 * кэшируется — функция вызывается в цикле по дням периода.
 */
const shiftedCache = new Map<number, ReadonlySet<string>>();

function shiftedHolidays(year: number): ReadonlySet<string> {
  const cached = shiftedCache.get(year);
  if (cached) return cached;

  const shifted = new Set<string>();
  for (const md of FIXED_HOLIDAYS) {
    const holiday = dayjs(`${year}-${md}`);
    if (!holiday.isValid() || !isWeekend(holiday)) continue;

    // Ищем ближайший день, который не выходной, не праздник и ещё не занят переносом.
    let next = holiday.add(1, 'day');
    while (isWeekend(next) || isFixedHoliday(next) || shifted.has(isoOf(next))) {
      next = next.add(1, 'day');
    }
    shifted.add(isoOf(next));
  }

  shiftedCache.set(year, shifted);
  return shifted;
}

/**
 * Рабочий ли день по производственному календарю РФ.
 *
 * Порядок проверок: явные переносы года важнее общих правил — объявленная рабочей
 * суббота остаётся рабочей, даже если это выходной по календарю.
 */
export function isWorkingDay(date: Dayjs | string): boolean {
  const d = dayjs(date);
  const iso = isoOf(d);
  const override = YEAR_OVERRIDES[d.year()];

  if (override?.workdays?.includes(iso)) return true;
  if (override?.holidays?.includes(iso)) return false;
  if (isWeekend(d) || isFixedHoliday(d)) return false;
  return !shiftedHolidays(d.year()).has(iso);
}

/**
 * Количество рабочих дней в интервале включительно.
 * Интервал «задом наперёд» даёт 0 — вызывающему не нужно проверять порядок дат.
 */
export function countWorkingDays(from: Dayjs | string, to: Dayjs | string): number {
  const start = dayjs(from).startOf('day');
  const end = dayjs(to).startOf('day');
  if (end.isBefore(start)) return 0;

  let count = 0;
  for (let d = start; !d.isAfter(end, 'day'); d = d.add(1, 'day')) {
    if (isWorkingDay(d)) count += 1;
  }
  return count;
}
