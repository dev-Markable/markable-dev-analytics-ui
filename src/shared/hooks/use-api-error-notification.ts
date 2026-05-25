import { useEffect, useRef } from 'react';
import { useNotification } from './use-notification';
import type { ApiError } from '@/shared/api';

export function useApiErrorNotification(error: ApiError | null, contextLabel?: string): void {
  const notification = useNotification();
  const lastShown = useRef<ApiError | null>(null);

  useEffect(() => {
    if (!error || error === lastShown.current) return;
    lastShown.current = error;
    notification.error({
      message: contextLabel ?? error.title,
      description: error.detail ?? error.message,
      placement: 'topRight',
    });
  }, [error, contextLabel, notification]);
}
