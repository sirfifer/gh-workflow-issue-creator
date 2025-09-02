import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html'],
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
      include: ['src/**/*.ts'],
    },
  },
});
