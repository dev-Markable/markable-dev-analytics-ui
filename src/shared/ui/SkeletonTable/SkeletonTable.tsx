import { Skeleton } from 'antd';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 6, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="skeleton-table">
      <div
        className="skeleton-table__head"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton.Input key={`h-${j}`} active size="small" style={{ width: '60%' }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={`r-${i}`}
          className="skeleton-table__row"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((__, j) => (
            <Skeleton.Input
              key={`c-${i}-${j}`}
              active
              size="small"
              style={{ width: j === 0 ? '90%' : '70%' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
