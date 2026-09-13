import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
    setupFiles: ['./tests/unit/setup.ts'],
    coverage: { include: ['src/content/**/*.ts', 'src/scripts/**/*.ts'] },
  },
});
