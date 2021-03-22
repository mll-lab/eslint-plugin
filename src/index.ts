import { castToBoolean } from './rules/cast-to-boolean';
import { noColorLiterals } from './rules/no-color-literals';

const rules = {
  'cast-to-boolean': castToBoolean,
  'no-color-literals': noColorLiterals,
};

const recommendedRules = {
  '@mll-lab/cast-to-boolean': 'error',
  '@mll-lab/no-color-literals': 'error',
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
