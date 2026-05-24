import { Table } from 'antd';
import type { TableProps } from 'antd';
import type { ApiError, AsyncStatus } from '@/shared/api';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';
import { SkeletonTable } from '../SkeletonTable';

export interface DataTableProps<T> extends Omit<TableProps<T>, 'dataSource' | 'loading'> {
  data: readonly T[] | null;
  status: AsyncStatus;
  error?: ApiError | null;
  onRetry?: () => void | Promise<void>;
  emptyTitle?: string;
  emptyDescription?: string;
  skeletonRows?: number;
}

export function DataTable<T extends object>({
  data,
  status,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  skeletonRows,
  columns,
  rowKey,
  ...rest
}: DataTableProps<T>) {
  const isInitialLoading = status === 'loading' && (!data || data.length === 0);

  if (isInitialLoading) {
    return <SkeletonTable rows={skeletonRows ?? 6} columns={columns?.length ?? 4} />;
  }

  if (status === 'error' && (!data || data.length === 0)) {
    return <ErrorState error={error ?? null} onRetry={onRetry} />;
  }

  if (status === 'success' && (!data || data.length === 0)) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <Table<T>
      dataSource={(data as T[]) ?? []}
      loading={status === 'loading'}
      columns={columns}
      rowKey={rowKey}
      pagination={false}
      size="middle"
      {...rest}
    />
  );
}
