module.exports = {
  extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  env: {
    browser: true,
  },
  rules: {
    'no-plusplus': 0,
    'no-restricted-syntax': 0,
    'no-continue': 0,
    'import/extensions': 0,
    'object-curly-newline': 0,
    'operator-linebreak': 0,
    'keyword-spacing': 0,
    'lines-between-class-members': [2, 'always', { exceptAfterSingleLine: true }],
  },
};
