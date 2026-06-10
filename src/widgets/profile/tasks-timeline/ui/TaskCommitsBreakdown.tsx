import { useRef } from 'react';
import { Tag, Typography } from 'antd';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CommitMessage, type Commit } from '@/entities/commit';
import { formatDateTime, formatNumber } from '@/shared/lib';

interface TaskCommitsBreakdownProps {
  commits: readonly Commit[];
}

/**
 * Порог переключения на виртуализованный режим. Ниже — render всех строк
 * как было (на коротких списках виртуализация только мешает auto-fit высоты).
 * Выше — `@tanstack/react-virtual`: рендерим только видимые строки + overscan,
 * скролл-контейнер с фиксированной высотой.
 */
const VIRTUAL_FROM = 50;
/** Оценённая высота одной строки (px) — берётся из CSS, тут только для измерений. */
const ROW_HEIGHT = 36;
/** Максимальная высота скролл-контейнера — после которой включается прокрутка. */
const SCROLL_HEIGHT = 480;

export function TaskCommitsBreakdown({ commits }: TaskCommitsBreakdownProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const useVirtual = commits.length >= VIRTUAL_FROM;

  const virtualizer = useVirtualizer({
    count: useVirtual ? commits.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  if (commits.length === 0) {
    return (
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        В этой задаче нет коммитов за выбранный период (карточка из Kaiten без коммитов).
      </Typography.Text>
    );
  }

  if (!useVirtual) {
    return (
      <div className="task-commits">
        {commits.map((c) => (
          <CommitRow key={c.hash} commit={c} />
        ))}
      </div>
    );
  }

  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="task-commits task-commits--virtual"
      style={{ height: SCROLL_HEIGHT, overflow: 'auto' }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {items.map((v) => {
          const c = commits[v.index];
          if (!c) return null;
          return (
            <div
              key={c.hash}
              ref={virtualizer.measureElement}
              data-index={v.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${v.start}px)`,
              }}
            >
              <CommitRow commit={c} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommitRow({ commit }: { commit: Commit }) {
  return (
    <div className="task-commits__row">
      <Typography.Text type="secondary" className="task-commits__date">
        {formatDateTime(commit.commitDate)}
      </Typography.Text>
      <Tag bordered={false} className="task-commits__repo">
        {commit.repo}
      </Tag>
      <span className="task-commits__message">
        <CommitMessage commit={commit} maxLength={200} />
      </span>
      <span className="task-commits__lines">
        <span style={{ color: 'var(--ant-color-success)' }}>
          +{formatNumber(commit.addedLines)}
        </span>
        <span style={{ color: 'var(--ant-color-text-tertiary)', margin: '0 4px' }}>/</span>
        <span style={{ color: 'var(--ant-color-text-secondary)' }}>
          −{formatNumber(commit.deletedLines)}
        </span>
      </span>
    </div>
  );
}
