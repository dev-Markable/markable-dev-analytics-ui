import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { Typography } from 'antd';
import { buildProfilePath } from '@/app/router/paths';
import {
  ActivityBadge,
  UserAvatar,
  authorAsUser,
  userDisplayName,
  type AuthorActivity,
} from '@/entities/user';
import { TeamChip } from '@/entities/team';
import { formatNumber } from '@/shared/lib';
import type { DateRange } from '@/shared/lib';

export interface BuildColumnsOptions {
  range: DateRange;
  /** Абсолютный ранг первого ряда на текущей странице (page * size + 1). */
  startRank: number;
}

export const buildAuthorsColumns = ({
  range,
  startRank,
}: BuildColumnsOptions): ColumnsType<AuthorActivity> => [
  {
    key: 'rank',
    title: '#',
    width: 56,
    render: (_value, _record, index) => (
      <span className="authors-table__rank">{startRank + index}</span>
    ),
  },
  {
    key: 'author',
    title: 'Автор',
    dataIndex: 'email',
    render: (_value, record) => {
      const user = authorAsUser(record);
      return (
        <Link
          to={buildProfilePath(record.email, range)}
          className="authors-table__author"
          aria-label={`Профиль ${record.email}`}
        >
          <UserAvatar user={user} size={32} isLead={record.isLead} />
          <span className="authors-table__identity">
            <Typography.Text className="authors-table__name">
              {userDisplayName(user)}
            </Typography.Text>
            <Typography.Text className="authors-table__email">
              {record.email}
            </Typography.Text>
          </span>
        </Link>
      );
    },
  },
  {
    key: 'team',
    title: 'Команда',
    dataIndex: 'team',
    width: 160,
    render: (_value, record) => <TeamChip team={record.team} />,
  },
  {
    key: 'activity',
    title: 'Активность',
    width: 150,
    render: (_value, record) =>
      record.activity ? <ActivityBadge activity={record.activity} /> : null,
  },
  {
    key: 'commits',
    title: 'Коммитов',
    dataIndex: 'nonMergeCommits',
    align: 'right',
    width: 140,
    render: (_value, record) => (
      <span className="authors-table__num">
        {formatNumber(record.nonMergeCommits)}
        {record.mergeCommits > 0 && (
          <span className="authors-table__merge-hint">+{record.mergeCommits} merge</span>
        )}
      </span>
    ),
  },
  {
    key: 'added',
    title: 'Добавлено',
    dataIndex: 'addedLines',
    align: 'right',
    width: 120,
    render: (value: number) => <span className="authors-table__num">{formatNumber(value)}</span>,
  },
  {
    key: 'deleted',
    title: 'Удалено',
    dataIndex: 'deletedLines',
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
    dataIndex: 'testAddedLines',
    align: 'right',
    width: 100,
    render: (value: number) => (
      <span className="authors-table__num authors-table__num--secondary">
        {formatNumber(value)}
      </span>
    ),
  },
];
