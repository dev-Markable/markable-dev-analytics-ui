/** Палитра для серий сравнения — до 3 авторов, контрастные оттенки. */
export const COMPARE_SERIES_COLORS: readonly string[] = [
  'var(--ant-color-primary)',
  'var(--ant-color-success)',
  'var(--ant-color-warning)',
];

export const colorForIndex = (i: number): string =>
  COMPARE_SERIES_COLORS[i % COMPARE_SERIES_COLORS.length] ?? COMPARE_SERIES_COLORS[0]!;
