import { Tag, Tooltip, Typography } from 'antd';
import { ExternalLink } from 'lucide-react';
import type { UseCaseRef } from '@/entities/performance-review';
import { STATUS_COLOR, STATUS_LABEL, TYPE_LABEL } from '../config/use-case';

interface UseCaseRowProps {
  useCase: UseCaseRef;
}

export function UseCaseRow({ useCase }: UseCaseRowProps) {
  const { id, title, url, status, type } = useCase;

  const titleNode = (
    <Typography.Text className="use-case-row__title" ellipsis={{ tooltip: title }}>
      {title}
    </Typography.Text>
  );

  return (
    <li className="use-case-row">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer noopener" className="use-case-row__link">
          {titleNode}
          <Tooltip title={`Открыть карточку #${id}`}>
            <ExternalLink size={13} className="use-case-row__link-icon" />
          </Tooltip>
        </a>
      ) : (
        titleNode
      )}

      <div className="use-case-row__meta">
        <Tag bordered={false} color={STATUS_COLOR[status]} className="use-case-row__tag">
          {STATUS_LABEL[status]}
        </Tag>
        <Tag bordered={false} className="use-case-row__tag use-case-row__tag--type">
          {TYPE_LABEL[type]}
        </Tag>
      </div>
    </li>
  );
}
