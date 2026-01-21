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

    // Mixed nullish and other checks (nullish part already using loose equality)
    { code: "a == null || a === ''" },
    { code: "a != null && a !== ''" },
  ],

  invalid: [
    // Pattern 1: Single strict null check
    {
      code: 'value === null',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'value == null',
    },
    {
      code: 'value !== null',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'value != null',
    },
    {
      code: 'null === value',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'value == null',
    },

    // Pattern 1: Single strict undefined check
    {
      code: 'value === undefined',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'value == null',
    },
    {
      code: 'value !== undefined',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'value != null',
    },
    {
      code: 'undefined === value',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'value == null',
    },

    // Pattern 2: Combined null/undefined OR checks
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

    // Pattern 3: Combined null/undefined AND checks
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

    // Complex expressions (property access)
    {
      code: 'obj.prop === null',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'obj.prop == null',
    },
    {
      code: 'obj.prop.nested === undefined',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'obj.prop.nested == null',
    },

    // Array indexing
    {
      code: 'arr[0] === undefined',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'arr[0] == null',
    },
    {
      code: 'items[index] !== null',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'items[index] != null',
    },

    // Optional chaining
    {
      code: 'obj?.prop === null',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'obj?.prop == null',
    },
    {
      code: 'data?.user?.name !== undefined',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'data?.user?.name != null',
    },

    // In if statements
    {
      code: 'if (pageTitle === null || pageTitle === undefined) {}',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'if (pageTitle == null) {}',
    },

    // In ternary expressions
    {
      code: 'props.disabled === undefined || props.disabled === null ? {} : { disabled: props.disabled }',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'props.disabled == null ? {} : { disabled: props.disabled }',
    },
    {
      code: 'const result = value === null ? defaultValue : value',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'const result = value == null ? defaultValue : value',
    },

    // Negated expressions
    {
      code: '!(value === null || value === undefined)',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: '!(value == null)',
    },

    // Function calls
    {
      code: 'getValue() === null',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'getValue() == null',
    },
    {
      code: 'fetchData() !== undefined',
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: 'fetchData() != null',
    },

    // Mixed nullish and other checks (should flag nullish parts only)
    {
      code: "a === null || a === undefined || a === ''",
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: "a == null || a === ''",
    },
    {
      code: "a !== null && a !== undefined && a !== ''",
      errors: [{ messageId: 'preferLooseNullishEquality' }],
      output: "a != null && a !== ''",
    },
  ],
});
