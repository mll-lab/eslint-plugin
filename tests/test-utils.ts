import { resolve } from 'path';

import { TSESLint } from '@typescript-eslint/experimental-utils';

export function createRuleTester(
  parserOptions: Partial<TSESLint.ParserOptions> = {},
): TSESLint.RuleTester {
  return new TSESLint.RuleTester({
    parser: resolve('./node_modules/@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      ...parserOptions,
    },
  });
}
