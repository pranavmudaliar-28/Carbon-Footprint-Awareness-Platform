import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/component/**/*.test.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/services/**', 'lib/constants/**', 'lib/validators/**'],
    },
  },
  resolve: {
    alias: {
      '@': rootDir.replace(/\/$/, ''),
    },
  },
});
