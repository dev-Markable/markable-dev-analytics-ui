import type { ColumnsType } from 'antd/es/table';
import { Typography } from 'antd';
import { weekFullLabel, type WeeklyStat } from '@/entities/stats';
import { formatNumber } from '@/shared/lib';

export const buildWeeklyColumns = (): ColumnsType<WeeklyStat> => [
  {
    key: 'week',
    title: 'Неделя',
    render: (_value, record) => (
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <Typography.Text strong style={{ fontSize: 14 }}>
          {weekFullLabel(record)}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {record.authors.length} {record.authors.length === 1 ? 'автор' : 'авторов'}
        </Typography.Text>
      </div>
    ),
  },
  {
    key: 'commits',
    title: 'Коммитов',
    dataIndex: 'totalCommits',
    align: 'right',
    width: 140,
    render: (_value, record) => {
      const nonMerge = record.totalCommits - record.totalMergeCommits;
      return (
        <span className="authors-table__num">
          {formatNumber(nonMerge)}
          {record.totalMergeCommits > 0 && (
            <span className="authors-table__merge-hint">+{record.totalMergeCommits} merge</span>
          )}
        </span>
      );
    },
  },
  {
    key: 'added',
    title: 'Добавлено',
    dataIndex: 'totalAddedLines',
    align: 'right',
    width: 120,
    render: (value: number) => <span className="authors-table__num">{formatNumber(value)}</span>,
  },
  {
    key: 'deleted',
    title: 'Удалено',
    dataIndex: 'totalDeletedLines',
    align: 'right',
    width: 120,
    render: (value: number) => (
      <span className="authors-table__num authors-table__num--secondary">
        {formatNumber(value)}
      </span>
    ),
  },
  {
    key: 'test',
    title: 'Тестов',
    dataIndex: 'totalTestAddedLines',
    align: 'right',
    width: 100,
    render: (value: number) => (
      <span className="authors-table__num authors-table__num--secondary">
        {formatNumber(value)}
      </span>
    ),
  },
];
