import type { ReactNode } from 'react';
import { Space, Typography } from 'antd';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
}

export function PageHeader({ title, subtitle, extra }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__main">
        <Typography.Title level={2} className="page-header__title">
          {title}
        </Typography.Title>
        {subtitle && (
          <Typography.Text type="secondary" className="page-header__subtitle">
            {subtitle}
          </Typography.Text>
        )}
      </div>
      {extra && <Space size={12}>{extra}</Space>}
    </header>
  );
}
