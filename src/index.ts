import { noColorLiterals } from './rules/no-color-literals';

const rules = {
  'no-color-literals': noColorLiterals,
};

const recommendedRules = {
  'mll-lab/no-color-literals': 'error',
};

export default {
  rules,
  configs: {
    recommended: {
      plugins: ['mll-lab'],
      rules: recommendedRules,
    },
  },
};
