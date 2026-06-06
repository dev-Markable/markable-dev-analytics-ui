// Подключаем jest-dom matchers (toBeInTheDocument и т.п.) для UI-тестов.
// Файл подключён через vitest.config.test.setupFiles — попадает в любое окружение,
// но реально используется только в *.test.tsx (jsdom).
import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// На всякий случай явно расширяем vitest's expect — некоторые TS-конфиги
// не подхватывают типы автоматически через тройной слэш.
expect.extend(matchers);
