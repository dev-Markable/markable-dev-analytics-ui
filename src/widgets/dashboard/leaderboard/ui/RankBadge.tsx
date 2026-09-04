interface RankBadgeProps {
  rank: number;
  variant?: 'top' | 'outsider';
}

/** Медали только для первой тройки топа; остальные — просто номер. */
const MEDAL: Record<number, string> = { 1: 'gold', 2: 'silver', 3: 'bronze' };

/**
 * Номер позиции в лидерборде. Первая тройка — мягкий тинт медали, дальше номер без
 * подложки: плашка у каждой строки создавала лишний шум и «съедала» акцент у топ-3.
 */
export function RankBadge({ rank, variant = 'top' }: RankBadgeProps) {
  const medal = variant === 'top' ? MEDAL[rank] : undefined;

  return (
    <span className={`rank-badge${medal ? ` rank-badge--${medal}` : ''}`}>{rank}</span>
  );
}
