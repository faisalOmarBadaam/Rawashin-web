import { createRequire } from 'module'

import js from '@eslint/js'
import next from '@next/eslint-plugin-next'
import importPlugin from 'eslint-plugin-import'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const require = createRequire(import.meta.url)

let prettierConfig = null
try {
  prettierConfig = require('eslint-config-prettier')
} catch {
  prettierConfig = null
}

export default [
  // Ignore patterns
  {
    ignores: ['next-env.d.ts', '.next/**', 'node_modules/**'],
  },

  // Base JS rules
  js.configs.recommended,

  // Next.js core web vitals
  next.flatConfig.coreWebVitals,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // Prettier compatibility (loaded if eslint-config-prettier is installed)
  ...(prettierConfig ? [prettierConfig] : []),

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        node: {},
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // ==== React / Next ====

      'react/display-name': 'off',
      'react/no-children-prop': 'off',
      'react/react-in-jsx-scope': 'off',
      '@next/next/no-img-element': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@next/next/no-assign-module-variable': 'warn',

      // ==== React Hooks ====
      'react-hooks/exhaustive-deps': 'off',

      // ==== TypeScript ====
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      'no-console': ['warn', { allow: ['warn', 'error'] }],

      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',

      // ==== JS Safety (templates legacy) ====
      'no-extra-boolean-cast': 'off',
      'no-case-declarations': 'off',

      // ==== Import ====
      'import/no-named-as-default': 'off',
      'import/newline-after-import': ['error', { count: 1 }],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            ['internal', 'parent', 'sibling', 'index'],
            ['object', 'unknown'],
          ],
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: 'next/**', group: 'external', position: 'before' },
            { pattern: '~/**', group: 'external', position: 'before' },
            { pattern: '@/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['react', 'type'],
          'newlines-between': 'always-and-inside-groups',
        },
      ],
    },
  },

  // Overrides
  {
    files: ['*.ts', '*.tsx', 'src/iconify-bundle/*'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['src/scripts/**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]
