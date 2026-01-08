import { preferLooseNullishEquality } from '../../src/rules/prefer-loose-nullish-equality';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

ruleTester.run('prefer-loose-nullish-equality', preferLooseNullishEquality, {
  valid: [
    // Already using loose equality
    { code: 'value == null' },
    { code: 'value != null' },
    { code: 'if (value == null) {}' },

    // typeof checks (intentional, should not be flagged)
    { code: "typeof value === 'undefined'" },
    { code: "typeof value !== 'undefined'" },

    // Comparing two variables (not nullish comparisons)
    { code: 'x === y' },
    { code: 'foo !== bar' },

    // Non-nullish comparisons
    { code: 'value === 0' },
    { code: 'value === ""' },
    { code: 'value === false' },
    { code: 'value !== true' },

    // Loose equality with other values (allowed)
    { code: 'value == 0' },
    { code: 'value == ""' },

    // Nullish coalescence
    { code: 'const result = value ?? defaultValue' },

    // Single strict null checks (intentional, NOT flagged)
    { code: 'value === null' },
    { code: 'value !== null' },
    { code: 'null === value' },

    // Single strict undefined checks (intentional, NOT flagged)
    { code: 'value === undefined' },
    { code: 'value !== undefined' },
    { code: 'undefined === value' },

    // Complex expressions with single checks (intentional)
    { code: 'obj.prop === null' },
    { code: 'obj.prop.nested === undefined' },
    { code: 'arr[0] === undefined' },
    { code: 'items[index] !== null' },
    { code: 'obj?.prop === null' },
    { code: 'data?.user?.name !== undefined' },
    { code: 'getValue() === null' },
    { code: 'fetchData() !== undefined' },
    { code: 'const result = value === null ? defaultValue : value' },
  ],

  invalid: [
    // Pattern 1: Combined null/undefined OR checks
    {
      code: 'value === null || value === undefined',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'value == null',
    },
    {
      code: 'value === undefined || value === null',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'value == null',
    },
    {
      code: 'null === value || undefined === value',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'value == null',
    },

    // Pattern 2: Combined null/undefined AND checks
    {
      code: 'value !== null && value !== undefined',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'value != null',
    },
    {
      code: 'value !== undefined && value !== null',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'value != null',
    },
    {
      code: 'null !== value && undefined !== value',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'value != null',
    },

    // Real-world examples: Combined checks in if statements (from MR #6439)
    {
      code: 'if (pageTitle === null || pageTitle === undefined) {}',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'if (pageTitle == null) {}',
    },

    // Real-world examples: Combined checks in ternary (from MR #6439)
    {
      code: 'props.disabled === undefined || props.disabled === null ? {} : { disabled: props.disabled }',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'props.disabled == null ? {} : { disabled: props.disabled }',
    },

    // Negated combined expressions
    {
      code: '!(value === null || value === undefined)',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: '!(value == null)',
    },
  ],
});
