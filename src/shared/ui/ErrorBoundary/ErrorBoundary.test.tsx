import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

/** Управляемый бомба-компонент: бросает по флагу. */
function Boom({ shouldBoom, message = 'boom' }: { shouldBoom: boolean; message?: string }) {
  if (shouldBoom) throw new Error(message);
  return <div>OK</div>;
}

describe('<ErrorBoundary>', () => {
  // Глушим console.error от componentDidCatch — он шумит, но мы знаем что
  // ловим. Spy позволяет ассертить что лог всё-таки был.
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('детей рендерит, когда нет ошибки', () => {
    render(
      <ErrorBoundary>
        <Boom shouldBoom={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('при падении показывает fallback с сообщением и логирует', () => {
    render(
      <ErrorBoundary>
        <Boom shouldBoom message="взрыв" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();
    expect(screen.getByText('взрыв')).toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('кнопка «Повторить» сбрасывает state — если дети больше не падают, рендерятся снова', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Boom shouldBoom message="fail" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();

    // Сначала «исправляем» детей (родитель перестал передавать падение),
    rerender(
      <ErrorBoundary>
        <Boom shouldBoom={false} />
      </ErrorBoundary>,
    );
    // Boundary всё ещё хранит ошибку, кнопка сбросит.
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('смена resetKey сбрасывает ошибку автоматически', () => {
    const { rerender } = render(
      <ErrorBoundary resetKey="/a">
        <Boom shouldBoom message="fail" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();

    act(() => {
      rerender(
        <ErrorBoundary resetKey="/b">
          <Boom shouldBoom={false} />
        </ErrorBoundary>,
      );
    });

    expect(screen.getByText('OK')).toBeInTheDocument();
  });
});
