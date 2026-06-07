import type { ReactNode } from 'react';
import type { ApiError, AsyncStatus } from '@/shared/api';
import { ErrorState } from '../ErrorState';

interface AsyncContentProps {
  status: AsyncStatus;
  /** Нечего показывать (после фильтров) → рисуем `empty`. */
  isEmpty: boolean;
  /**
   * Есть ли загруженные данные «под капотом». Управляет тем, рисовать ли
   * skeleton/error при `loading`/`error`, или сразу контент (stale-while-
   * revalidate). По умолчанию = `!isEmpty`; ReviewsCard передаёт явно, т.к.
   * у него `isEmpty` считается после фильтра команды, а данные есть.
   */
  hasData?: boolean;
  /**
   * Передан (даже `null`) → на ошибке без данных показываем `ErrorState`.
   * Не передан → ошибка падает в `empty` (виджеты без error-UI, напр. профиль).
   */
  error?: ApiError | Error | null;
  onRetry?: () => void | Promise<void>;
  errorTitle?: ReactNode;
  /** Что рисовать при первичной загрузке (SkeletonTable / LoadingState / кастом). */
  skeleton: ReactNode;
  empty: ReactNode;
  children: ReactNode;
}

/**
 * Единая логика precedence для async-UI карточек: первичная загрузка → ошибка
 * → пусто → контент. Заменяет ручную триаду `isInitialLoading/isError/isEmpty`
 * и хрупкий guard `!a && !b && !c && (...)`, который дублировался по виджетам
 * с мелкими расхождениями. Скелетон и empty — слоты, т.к. они у виджетов разные.
 */
export function AsyncContent({
  status,
  isEmpty,
  hasData = !isEmpty,
  error,
  onRetry,
  errorTitle,
  skeleton,
  empty,
  children,
}: AsyncContentProps) {
  if (status === 'loading' && !hasData) return <>{skeleton}</>;
  if (status === 'error' && !hasData && error !== undefined) {
    return <ErrorState error={error} onRetry={onRetry} title={errorTitle} />;
  }
  if (isEmpty) return <>{empty}</>;
  return <>{children}</>;
}
