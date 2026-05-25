import { dayjs, type Dayjs } from './dayjs';
import { toISODate } from './format';

export interface DateRange {
  from: string;
  to: string;
}

export interface DayjsRange {
  from: Dayjs;
  to: Dayjs;
}

export const lastNDays = (n: number): DateRange => ({
  from: toISODate(dayjs().subtract(n - 1, 'day')),
  to: toISODate(dayjs()),
});

export const thisMonth = (): DateRange => ({
  from: toISODate(dayjs().startOf('month')),
  to: toISODate(dayjs()),
});

export const lastMonth = (): DateRange => {
  const start = dayjs().subtract(1, 'month').startOf('month');
  const end = dayjs().subtract(1, 'month').endOf('month');
  return { from: toISODate(start), to: toISODate(end) };
};

export const thisYear = (): DateRange => ({
  from: toISODate(dayjs().startOf('year')),
  to: toISODate(dayjs()),
});

export const toDayjsRange = (r: DateRange): DayjsRange => ({
  from: dayjs(r.from),
  to: dayjs(r.to),
});

export const fromDayjsRange = (r: DayjsRange): DateRange => ({
  from: toISODate(r.from),
  to: toISODate(r.to),
});

export const rangeDays = (r: DateRange): number =>
  dayjs(r.to).diff(dayjs(r.from), 'day') + 1;

export const isValidRange = (r: DateRange): boolean =>
  dayjs(r.from).isValid() && dayjs(r.to).isValid() && !dayjs(r.to).isBefore(dayjs(r.from));
