// Подключаем jest-dom matchers (toBeInTheDocument и т.п.) для UI-тестов.
// Файл подключён через vitest.config.test.setupFiles — попадает в любое окружение,
// но реально используется только в *.test.tsx (jsdom).
import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// На всякий случай явно расширяем vitest's expect — некоторые TS-конфиги
// не подхватывают типы автоматически через тройной слэш.
expect.extend(matchers);

// jsdom не реализует matchMedia (AntD Grid использует для responsive).
// Также нет ResizeObserver (Recharts/AntD виртуализированные таблицы).
// В тестах нам достаточно безопасных no-op заглушек.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
  }

  if (typeof window.ResizeObserver === 'undefined') {
    class ResizeObserverMock {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    (window as unknown as { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver =
      ResizeObserverMock;
  }
}
