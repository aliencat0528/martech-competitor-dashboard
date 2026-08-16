module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs'],
  plugins: ['@typescript-eslint'],
  rules: {
    quotes: ['error', 'single', { avoidEscape: true }],
    indent: ['error', 2, { SwitchCase: 1 }],
    'max-len': ['error', { code: 100, ignoreUrls: true, ignoreStrings: true }],
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
};
