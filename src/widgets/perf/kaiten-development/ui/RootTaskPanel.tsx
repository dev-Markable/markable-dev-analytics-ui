import { Badge, Typography } from 'antd';
import { ExternalLink, FileQuestion, FolderOpen } from 'lucide-react';
import type { RootTask } from '@/entities/performance-review';
import { UseCaseRow } from './UseCaseRow';

interface RootTaskHeaderProps {
  root: RootTask;
  /** Синтетическое ведро «Без корневой задачи» (root.id === null). */
  synthetic: boolean;
}

export function RootTaskHeader({ root, synthetic }: RootTaskHeaderProps) {
  const Icon = synthetic ? FileQuestion : FolderOpen;

  return (
    <div className="root-task__header">
      <span className="root-task__icon">
        <Icon size={16} />
      </span>
      <div className="root-task__title-wrap">
        {root.url && !synthetic ? (
          <a
            href={root.url}
            target="_blank"
            rel="noreferrer noopener"
            className="root-task__title-link"
            onClick={(e) => e.stopPropagation()}
          >
            <Typography.Text strong ellipsis={{ tooltip: root.title }} className="root-task__title">
              {root.title}
            </Typography.Text>
            <ExternalLink size={13} className="root-task__title-icon" />
          </a>
        ) : (
          <Typography.Text strong ellipsis={{ tooltip: root.title }} className="root-task__title">
            {root.title}
          </Typography.Text>
        )}
      </div>
      <Badge
        count={root.useCases.length}
        showZero
        overflowCount={999}
        style={{ backgroundColor: 'var(--ant-color-fill-secondary)', color: 'var(--ant-color-text)' }}
      />
    </div>
  );
}

export function RootTaskBody({ root }: { root: RootTask }) {
  if (root.useCases.length === 0) {
    return (
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        Внутри пусто.
      </Typography.Text>
    );
  }
  return (
    <ul className="root-task__use-cases">
      {root.useCases.map((u) => (
        <UseCaseRow key={u.id} useCase={u} />
      ))}
    </ul>
  );
}
