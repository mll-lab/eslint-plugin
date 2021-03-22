import { castToBoolean } from './rules/cast-to-boolean';
import { noColorLiterals } from './rules/no-color-literals';
import { noGlobalStyles } from './rules/no-global-styles';

const rules = {
  'cast-to-boolean': castToBoolean,
  'no-color-literals': noColorLiterals,
  'no-global-styles': noGlobalStyles,
};

const recommendedRules = {
  '@mll-lab/cast-to-boolean': 'error',
  '@mll-lab/no-color-literals': 'error',
  '@mll-lab/no-global-styles': 'error',
};

export = {
  rules,
  configs: {
    recommended: {
      plugins: ['@mll-lab'],
      rules: recommendedRules,
    },
  },
};
