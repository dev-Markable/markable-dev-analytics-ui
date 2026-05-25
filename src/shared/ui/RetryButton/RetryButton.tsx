import { useState } from 'react';
import { Button } from 'antd';
import { RefreshCw } from 'lucide-react';

interface RetryButtonProps {
  onRetry: () => void | Promise<void>;
  label?: string;
}

export function RetryButton({ onRetry, label = 'Повторить' }: RetryButtonProps) {
  const [loading, setLoading] = useState(false);

  const handle = async (): Promise<void> => {
    setLoading(true);
    try {
      await onRetry();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button icon={<RefreshCw size={14} />} onClick={handle} loading={loading}>
      {label}
    </Button>
  );
}
