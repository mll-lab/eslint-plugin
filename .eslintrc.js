module.exports = {
  extends: '@mll-lab/eslint-config',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    'import/no-unresolved': 'off',
    // Disable old rule name that doesn't exist in newer eslint-plugin-unused-imports
    'unused-imports/no-unused-imports-ts': 'off',
  },
};
