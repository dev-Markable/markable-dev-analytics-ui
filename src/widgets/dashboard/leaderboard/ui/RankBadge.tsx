interface RankBadgeProps {
  rank: number;
  variant?: 'top' | 'outsider';
}

const TOP_GRADIENTS: Record<number, string> = {
  1: 'linear-gradient(135deg, #f7c945 0%, #f59e0b 100%)',
  2: 'linear-gradient(135deg, #d0d5dd 0%, #98a2b3 100%)',
  3: 'linear-gradient(135deg, #d59461 0%, #a85f2e 100%)',
};

export function RankBadge({ rank, variant = 'top' }: RankBadgeProps) {
  const gradient = variant === 'top' ? TOP_GRADIENTS[rank] : undefined;
  const isMedal = Boolean(gradient);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 8,
        background: gradient ?? 'var(--ant-color-bg-layout)',
        color: isMedal ? '#fff' : 'var(--ant-color-text-secondary)',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        flexShrink: 0,
      }}
    >
      {rank}
    </span>
  );
}
