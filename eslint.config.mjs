import eslint from '@eslint/js';
import astro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**'],
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommended,

  ...astro.configs.recommended,

  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],

    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
];
