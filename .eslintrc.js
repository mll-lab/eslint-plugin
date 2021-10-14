module.exports = {
  extends: '@mll-lab/eslint-config',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    'import/no-unresolved': 'off',
  },
};
