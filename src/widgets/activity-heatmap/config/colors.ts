/**
 * Цветовая шкала heatmap. 5 уровней интенсивности через `color-mix`,
 * чтобы автоматически адаптироваться к light/dark теме (через primary token).
 */
export const COLOR_SCALE: readonly string[] = [
  'var(--ant-color-fill-tertiary)',
  'color-mix(in srgb, var(--ant-color-primary) 22%, transparent)',
  'color-mix(in srgb, var(--ant-color-primary) 45%, transparent)',
  'color-mix(in srgb, var(--ant-color-primary) 70%, transparent)',
  'var(--ant-color-primary)',
];

export const OUT_OF_RANGE_COLOR = 'transparent';

export const CELL_SIZE = 13;
export const CELL_GAP = 3;

/**
 * Маппит количество коммитов в индекс цветовой шкалы (0..4).
 */
export function colorIndex(commits: number, max: number): number {
  if (commits === 0 || max === 0) return 0;
  const normalized = commits / max;
  if (normalized <= 0.25) return 1;
  if (normalized <= 0.5) return 2;
  if (normalized <= 0.75) return 3;
  return 4;
}
