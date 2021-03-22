import { castToBoolean } from '../../src/rules/cast-to-boolean';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

ruleTester.run('cast-to-boolean', castToBoolean, {
  valid: [
    {
      code: 'Boolean(3)',
    },
  ],

  invalid: [
    {
      code: '!!3',
      errors: [{ messageId: 'castToBoolean' }],
      output: 'Boolean(3)',
    },
  ],
});
