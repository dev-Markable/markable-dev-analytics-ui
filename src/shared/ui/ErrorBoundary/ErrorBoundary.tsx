import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Result } from 'antd';
import { RefreshCw, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  /** Дочернее дерево, которое мы охраняем от падений. */
  children: ReactNode;
  /**
   * Ключ-инвалидатор: при изменении сбрасывается захваченная ошибка.
   * На уровне страниц передаём `location.pathname` — переход на другой маршрут
   * автоматически даёт пользователю «свежее» дерево.
   */
  resetKey?: string;
  /** Кастомный fallback. По умолчанию — AntD Result с двумя кнопками. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Локальный ErrorBoundary без сторонних зависимостей. React всё ещё умеет
 * ловить runtime-ошибки только через class-component — это намеренно
 * единственный classовый файл в проекте.
 *
 * Что делает:
 * - Ловит ошибки рендера/lifecycle'ов в дочернем поддереве.
 * - Логирует в console.error (Sentry/иной reporter подключается тут).
 * - Показывает дружелюбный fallback с двумя действиями: «Повторить»
 *   (сбрасывает state и реререндерит детей) и «Перезагрузить страницу»
 *   (полный reload, страховка на упорные баги).
 * - При смене `resetKey` (обычно — `pathname`) ошибка автоматически
 *   сбрасывается, чтобы переход на другую страницу не оставлял фолбэк.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Подключение Sentry / reporter'а делается здесь — без условной зависимости.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  override componentDidUpdate(prev: ErrorBoundaryProps): void {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    return (
      <Result
        status="error"
        title="Что-то пошло не так"
        subTitle={error.message || 'Неизвестная ошибка рендера.'}
        extra={[
          <Button key="retry" type="primary" icon={<RotateCcw size={14} />} onClick={this.reset}>
            Повторить
          </Button>,
          <Button
            key="reload"
            icon={<RefreshCw size={14} />}
            onClick={() => window.location.reload()}
          >
            Перезагрузить страницу
          </Button>,
        ]}
      />
    );
  }
}
