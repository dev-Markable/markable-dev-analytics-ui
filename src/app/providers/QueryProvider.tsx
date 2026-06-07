import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAbortError } from '@/shared/api';

interface QueryProviderProps {
  children: ReactNode;
}

const STALE_TIME_MS = 60_000; // 1 минута — баланс свежести и числа запросов

/**
 * QueryClient — единственная глобальная точка кэша всех ресурсов.
 *
 * Дефолты:
 * - `staleTime: 60s` — повторный mount страницы за тот же ключ не дёргает
 *   сеть. Раньше это давал ручной TTL-кэш в каждом сторе.
 * - `gcTime: 5 минут` — данные вычищаются если ни один компонент не подписан.
 * - `refetchOnWindowFocus: false` — это «внутренний дашборд», не торговый
 *   тикер; не нужно дёргать каждый раз при переключении вкладок.
 * - `retry`: по умолчанию TanStack делает 3 попытки. axios-retry уже ретраит
 *   на сетевых/5xx уровнях — оставляем 0, иначе будет двойной retry.
 *   Отменённые (AbortError) тоже не ретраим.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // useState с инициализатором — QueryClient создаётся ОДИН раз на жизнь App
  // (в StrictMode это особенно важно: иначе на каждом ремаунте новый клиент,
  // и кэш не работает между навигациями).
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MS,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: (_failureCount, error) => {
              if (isAbortError(error)) return false;
              // axios-retry уже сделал свои попытки; больше не пытаемся.
              return false;
            },
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
