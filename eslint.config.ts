import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import parser from '@typescript-eslint/parser'
import globals from 'globals'
import tseslint, { ConfigArray } from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['node_modules', 'dist'],
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/*.d.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      ts: tseslint.plugin,
      '@stylistic': stylistic,
    },
    rules: {
      'curly': ['warn', 'multi-or-nest'],
      'object-shorthand': ['warn', 'always'],
      'eqeqeq': ['warn', 'always'],
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      '@stylistic/max-len': ['warn', 100],
      '@stylistic/indent': ['warn', 2],
      '@stylistic/semi': ['warn', 'never'],
      '@stylistic/quotes': ['warn', 'single'],
      '@stylistic/comma-dangle': ['warn', 'always-multiline'],
      '@stylistic/arrow-parens': ['warn', 'as-needed'],
      '@stylistic/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
      '@stylistic/multiline-ternary': ['off'],
      '@stylistic/no-multiple-empty-lines': ['off'],
      '@stylistic/space-before-function-paren': ['warn', 'never'],
      '@stylistic/object-curly-spacing': ['warn', 'always'],
      '@stylistic/eol-last': ['warn', 'always'],
      '@stylistic/space-infix-ops': ['warn'],
      '@stylistic/space-before-blocks': ['warn', 'always'],
      '@stylistic/keyword-spacing': ['warn'],
      '@stylistic/arrow-spacing': ['warn'],
      '@stylistic/key-spacing': ['warn', { 'mode': 'minimum' }],
      '@stylistic/comma-spacing': ['warn'],
      '@stylistic/no-trailing-spaces': ['warn'],
      '@stylistic/type-annotation-spacing': ['warn'],
      '@stylistic/member-delimiter-style': [
        'warn',
        {
          multiline: { delimiter: 'none' },
          singleline: { delimiter: 'comma', requireLast: false },
        },
      ],
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
) as ConfigArray
