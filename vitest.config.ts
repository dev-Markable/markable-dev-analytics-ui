import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    // Pure-функции → node-env (быстрее, без DOM). UI-тесты (*.test.tsx)
    // переезжают в jsdom через environmentMatchGlobs ниже.
    environment: 'node',
    environmentMatchGlobs: [['**/*.test.tsx', 'jsdom']],
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/shared/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/index.ts', 'src/shared/api/schema.ts'],
    },
  },
});
