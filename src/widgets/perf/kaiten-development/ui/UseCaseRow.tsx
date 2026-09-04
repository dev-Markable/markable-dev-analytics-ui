import { ExternalLink } from 'lucide-react';
import type { UseCaseRef } from '@/entities/performance-review';
import { STATUS_LABEL, TYPE_LABEL } from '../config/use-case';

interface UseCaseRowProps {
  useCase: UseCaseRef;
}

export function UseCaseRow({ useCase }: UseCaseRowProps) {
  const { id, title, url, status, type } = useCase;

  const body = (
    <>
      {/* Статус точкой, а не цветным тегом: в списке из пяти строк пять
          одинаковых зелёных плашек читались как украшение. */}
      <span
        className={`use-case-row__dot use-case-row__dot--${status.toLowerCase()}`}
        title={STATUS_LABEL[status]}
      />
      <span className="use-case-row__title">{title}</span>
      <span className="use-case-row__type">{TYPE_LABEL[type]}</span>
      <span className="use-case-row__status">{STATUS_LABEL[status]}</span>
      {url && <ExternalLink size={12} className="use-case-row__link-icon" />}
    </>
  );

  return (
    <li className="use-case-row">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="use-case-row__link"
          title={`Открыть карточку #${id}`}
        >
          {body}
        </a>
      ) : (
        <span className="use-case-row__link">{body}</span>
      )}
    </li>
  );
}
