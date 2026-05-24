import { Skeleton } from 'antd';

export function LeaderboardSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="leaderboard-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="leaderboard-skeleton__row">
          <Skeleton.Avatar active size={32} shape="square" style={{ borderRadius: 8 }} />
          <div className="leaderboard-skeleton__lines">
            <Skeleton.Input active size="small" style={{ width: '60%' }} />
            <Skeleton.Input active size="small" style={{ width: '40%' }} />
          </div>
          <Skeleton.Input active size="small" style={{ width: 64 }} />
        </div>
      ))}
    </div>
  );
}
