import { dayjs, type Dayjs } from './dayjs';

export type DateInput = string | Date | Dayjs;

export const ISO_DATE = 'YYYY-MM-DD';
export const ISO_DATETIME = 'YYYY-MM-DDTHH:mm:ss';
export const DISPLAY_DATE = 'D MMM YYYY';
export const DISPLAY_DATETIME = 'D MMM YYYY, HH:mm';

const PLACEHOLDER = '—';

export const formatDate = (
  d: DateInput | null | undefined,
  fmt: string = DISPLAY_DATE,
): string => (d ? dayjs(d).format(fmt) : PLACEHOLDER);

export const formatDateTime = (d: DateInput | null | undefined): string =>
  d ? dayjs(d).format(DISPLAY_DATETIME) : PLACEHOLDER;

export const formatRelative = (d: DateInput | null | undefined): string => {
  if (!d) return PLACEHOLDER;
  const target = dayjs(d);
  const diffMin = dayjs().diff(target, 'minute');
  if (diffMin < 1) return 'только что';
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffHours = dayjs().diff(target, 'hour');
  if (diffHours < 24) return `${diffHours} ч назад`;
  const diffDays = dayjs().diff(target, 'day');
  if (diffDays < 7) return `${diffDays} дн назад`;
  return formatDate(d);
};

export const toISODate = (d: DateInput): string => dayjs(d).format(ISO_DATE);

export const formatRange = (from: string, to: string): string =>
  `${formatDate(from)} — ${formatDate(to)}`;
