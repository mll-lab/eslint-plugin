import { noColorLiterals } from '../../src/rules/no-color-literals';
import { createRuleTester } from '../test-utils';

createRuleTester().run('no-color-literals', noColorLiterals, {
  valid: [],
  invalid: [
    {
      code: 'const color = "#000";',
      errors: [{ messageId: 'noColorLiterals' }],
    },
  ],
});
