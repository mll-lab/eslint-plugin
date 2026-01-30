import { TSESLint } from '@typescript-eslint/experimental-utils';

import { castToBoolean } from './rules/cast-to-boolean';
import { noColorLiterals } from './rules/no-color-literals';
import { noGlobalStyles } from './rules/no-global-styles';
import { preferLooseNullishEquality } from './rules/prefer-loose-nullish-equality';
import { preferNamedReactImports } from './rules/prefer-named-react-imports';

const rules = {
  'cast-to-boolean': castToBoolean,
  'no-color-literals': noColorLiterals,
  'no-global-styles': noGlobalStyles,
  'prefer-loose-nullish-equality': preferLooseNullishEquality,
  'prefer-named-react-imports': preferNamedReactImports,
};

const recommendedRules: Record<string, TSESLint.Linter.RuleEntry> = {
  '@mll-lab/cast-to-boolean': 'error',
  '@mll-lab/no-color-literals': 'error',
  '@mll-lab/no-global-styles': 'error',
  '@mll-lab/prefer-loose-nullish-equality': 'error',
  '@mll-lab/prefer-named-react-imports': 'error',
};

type Plugin = {
  rules: typeof rules;
  configs: {
    recommended: TSESLint.Linter.Config;
  };
};

const plugin: Plugin = {
  rules,
  configs: {
    recommended: {
      plugins: ['@mll-lab'],
      rules: recommendedRules,
    },
  },
};

export = plugin;
