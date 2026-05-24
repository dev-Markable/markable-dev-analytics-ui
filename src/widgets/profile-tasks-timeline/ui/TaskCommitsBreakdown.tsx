import { Tag, Typography } from 'antd';
import { CommitMessage, type Commit } from '@/entities/commit';
import { formatDateTime, formatNumber } from '@/shared/lib';

interface TaskCommitsBreakdownProps {
  commits: readonly Commit[];
}

export function TaskCommitsBreakdown({ commits }: TaskCommitsBreakdownProps) {
  if (commits.length === 0) {
    return (
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        В этой задаче нет коммитов за выбранный период (карточка из Kaiten без коммитов).
      </Typography.Text>
    );
  }

  return (
    <div className="task-commits">
      {commits.map((c) => (
        <div key={c.hash} className="task-commits__row">
          <Typography.Text type="secondary" className="task-commits__date">
            {formatDateTime(c.commitDate)}
          </Typography.Text>
          <Tag bordered={false} className="task-commits__repo">
            {c.repo}
          </Tag>
          <span className="task-commits__message">
            <CommitMessage commit={c} maxLength={200} />
          </span>
          <span className="task-commits__lines">
            <span style={{ color: 'var(--ant-color-success)' }}>+{formatNumber(c.addedLines)}</span>
            <span style={{ color: 'var(--ant-color-text-tertiary)', margin: '0 4px' }}>/</span>
            <span style={{ color: 'var(--ant-color-text-secondary)' }}>−{formatNumber(c.deletedLines)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
