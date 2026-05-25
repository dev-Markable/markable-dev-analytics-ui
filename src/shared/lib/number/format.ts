const ruFormat = new Intl.NumberFormat('ru-RU');
const compactFormat = new Intl.NumberFormat('ru-RU', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const PLACEHOLDER = '—';

export const formatNumber = (n: number | null | undefined): string =>
  n == null ? PLACEHOLDER : ruFormat.format(n);

export const formatCompact = (n: number | null | undefined): string =>
  n == null ? PLACEHOLDER : compactFormat.format(n);

export const formatSigned = (n: number, opts?: { positiveSign?: boolean }): string => {
  if (n === 0) return '0';
  const sign = n > 0 && opts?.positiveSign ? '+' : '';
  return `${sign}${ruFormat.format(n)}`;
};

export const formatLinesDelta = (added: number, deleted: number): string =>
  `+${formatNumber(added)} / −${formatNumber(deleted)}`;

export const formatPercent = (n: number | null | undefined, digits = 0): string =>
  n == null ? PLACEHOLDER : `${n.toFixed(digits)}%`;

export const safeDiv = (a: number, b: number): number => (b === 0 ? 0 : a / b);
