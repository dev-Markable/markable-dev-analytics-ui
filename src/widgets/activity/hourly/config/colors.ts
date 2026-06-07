/**
 * Шкала интенсивности hourly-heatmap. Через color-mix → темо-адаптивная.
 * Уровни 0..4 (см. intensityLevel).
 */
export const HOURLY_COLOR_SCALE: readonly string[] = [
  'var(--ant-color-fill-tertiary)',
  'color-mix(in srgb, var(--ant-color-primary) 22%, transparent)',
  'color-mix(in srgb, var(--ant-color-primary) 45%, transparent)',
  'color-mix(in srgb, var(--ant-color-primary) 70%, transparent)',
  'var(--ant-color-primary)',
];

export const HOURLY_CELL = 16;
export const HOURLY_GAP = 3;
