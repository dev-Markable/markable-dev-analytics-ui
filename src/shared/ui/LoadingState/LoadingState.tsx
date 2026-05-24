import { Spin, Typography } from 'antd';

interface LoadingStateProps {
  label?: string;
  fullPage?: boolean;
}

export function LoadingState({ label, fullPage }: LoadingStateProps) {
  return (
    <div className={`loading-state${fullPage ? ' loading-state--full' : ''}`}>
      <Spin size="large" />
      {label && (
        <Typography.Text type="secondary" className="loading-state__label">
          {label}
        </Typography.Text>
      )}
    </div>
  );
}
