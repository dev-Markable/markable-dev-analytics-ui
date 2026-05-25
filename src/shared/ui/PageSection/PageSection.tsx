import type { ReactNode } from 'react';
import { Typography } from 'antd';

interface PageSectionProps {
  title?: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  noPadding?: boolean;
}

export function PageSection({ title, description, extra, children, noPadding }: PageSectionProps) {
  const hasHeader = Boolean(title || extra);
  return (
    <section className={`page-section${noPadding ? ' page-section--flush' : ''}`}>
      {hasHeader && (
        <header className="page-section__header">
          <div className="page-section__heading">
            {title && (
              <Typography.Title level={3} className="page-section__title">
                {title}
              </Typography.Title>
            )}
            {description && (
              <Typography.Text type="secondary" className="page-section__description">
                {description}
              </Typography.Text>
            )}
          </div>
          {extra && <div className="page-section__actions">{extra}</div>}
        </header>
      )}
      <div className="page-section__body">{children}</div>
    </section>
  );
}
