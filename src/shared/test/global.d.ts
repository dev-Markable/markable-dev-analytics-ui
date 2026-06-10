/// <reference types="@testing-library/jest-dom" />
/// <reference types="@testing-library/jest-dom/vitest" />

// Триггер-точка типов jest-dom для Vitest. Файл попадает в include
// tsconfig.test.json и augment'ит глобальный `expect` matcher'ами
// (`toBeInTheDocument`, `toHaveClass`, и т.п.).
export {};
