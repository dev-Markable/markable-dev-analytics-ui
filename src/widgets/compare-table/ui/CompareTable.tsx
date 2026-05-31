import { Card, Typography } from 'antd';
import { Table2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildProfilePath } from '@/app/router/paths';
import {
  UserAvatar,
  authorAsUser,
  userDisplayName,
  type AuthorActivity,
} from '@/entities/user';
import type { DateRange } from '@/shared/lib';
import { COMPARE_ROWS, leaderEmail } from '../lib/rows';

interface CompareTableProps {
  authors: readonly AuthorActivity[];
  range: DateRange;
}

export function CompareTable({ authors, range }: CompareTableProps) {
  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Table2 size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Метрики
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Лидер по строке выделен
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        <div className="compare-table__scroll">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-table__metric-head">Метрика</th>
                {authors.map((a) => {
                  const user = authorAsUser(a);
                  return (
                    <th key={a.email} className="compare-table__author-head">
                      <Link
                        to={buildProfilePath(a.email, range)}
                        className="compare-table__author"
                      >
                        <UserAvatar user={user} size={28} />
                        <span className="compare-table__author-name">
                          {userDisplayName(user)}
                        </span>
                      </Link>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => {
                const leader = leaderEmail(row, authors);
                return (
                  <tr key={row.key}>
                    <td className="compare-table__metric">{row.label}</td>
                    {authors.map((a) => (
                      <td
                        key={a.email}
                        className={`compare-table__value${
                          leader === a.email ? ' compare-table__value--leader' : ''
                        }`}
                      >
                        {row.display(a)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
