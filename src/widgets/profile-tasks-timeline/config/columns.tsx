import type { ColumnsType } from 'antd/es/table';
import { Typography } from 'antd';
import { formatNumber, formatRelative } from '@/shared/lib';
import { TaskTitle } from '../ui/TaskTitle';
import type { TaskGroup } from '../lib/group-commits';

export function buildTaskColumns(): ColumnsType<TaskGroup> {
  return [
    {
      key: 'task',
      title: 'Задача',
      render: (_, record) => <TaskTitle record={record} />,
    },
    {
      key: 'commits',
      title: 'Коммитов',
      align: 'right',
      width: 110,
      render: (_, record) => (
        <span className="authors-table__num">{formatNumber(record.totalCommits)}</span>
      ),
    },
    {
      key: 'lines',
      title: 'Изменено',
      align: 'right',
      width: 160,
      render: (_, record) => (
        <span className="authors-table__num" style={{ whiteSpace: 'nowrap' }}>
          <span style={{ color: 'var(--ant-color-success)' }}>
            +{formatNumber(record.totalAddedLines)}
          </span>
          <span style={{ color: 'var(--ant-color-text-tertiary)', margin: '0 4px' }}>/</span>
          <span style={{ color: 'var(--ant-color-text-secondary)' }}>
            −{formatNumber(record.totalDeletedLines)}
          </span>
        </span>
      ),
    },
    {
      key: 'tests',
      title: 'Тестов',
      align: 'right',
      width: 90,
      render: (_, record) => (
        <span className="authors-table__num authors-table__num--secondary">
          {formatNumber(record.totalTestAddedLines)}
        </span>
      ),
    },
    {
      key: 'last',
      title: 'Последний коммит',
      align: 'right',
      width: 160,
      render: (_, record) => (
        <Typography.Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
          {record.lastCommitAt ? formatRelative(record.lastCommitAt) : '—'}
        </Typography.Text>
      ),
    },
  ];
}
