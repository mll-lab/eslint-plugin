module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  plugins: ['@typescript-eslint', 'import', 'unused-imports'],
  rules: {
    '@typescript-eslint/array-type': ['error', { default: 'generic' }],
    '@typescript-eslint/ban-types': 'error',
    '@typescript-eslint/method-signature-style': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'class', format: ['PascalCase'] },
      { selector: 'enumMember', format: ['UPPER_CASE'] },
    ],
    '@typescript-eslint/no-redeclare': 'error',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { ignoreRestSiblings: true },
    ],
    'arrow-body-style': ['error', 'as-needed'],
    camelcase: 'off',
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'consistent-return': 'off', // Not necessary with TypeScript
    'func-names': ['error', 'always'],
    'import/extensions': ['error', 'never'],
    'import/imports-first': 'error',
    'import/newline-after-import': 'error',
    'import/no-extraneous-dependencies': 'off',
    'import/no-named-as-default': 'error',
    'import/no-unresolved': 'off', // We do not use webpack in every project
    'import/no-webpack-loader-syntax': 'off',
    'import/order': [
      'error',
      { 'newlines-between': 'always', alphabetize: { order: 'asc' } },
    ],
    'import/prefer-default-export': 'off',
    'max-len': 'off',
    'newline-per-chained-call': 'off',
    'no-confusing-arrow': 'off',
    'no-console': 'error',
    'no-nested-ternary': 'error',
    'no-param-reassign': ['error', { props: false }],
    'no-redeclare': 'off',
    'no-shadow': 'off',
    'no-underscore-dangle': [
      2,
      { allow: ['__typename', '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] },
    ],
    'no-unused-vars': 'off', // Replaced by @typescript-eslint/no-unused-vars
    'no-use-before-define': 'off',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'require-yield': 'off',
    'unused-imports/no-unused-imports-ts': 'error',
  },
};
