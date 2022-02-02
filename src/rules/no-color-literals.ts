import { ESLintUtils } from '@typescript-eslint/experimental-utils';

function isColorLiteral(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  return Boolean(
    value.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}$)/) ||
      value.includes('rgb(') ||
      value.includes('rgba('),
  );
}

export const noColorLiterals = ESLintUtils.RuleCreator((name) => name)({
  name: 'no-color-literals',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Checks for color strings, such as #000, #000000, rgb(... or rgba(...',
      recommended: 'error',
    },
    messages: {
      noColorLiterals:
        'Do not use absolute color values, import color values from theme.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    TemplateElement(node) {
      if (isColorLiteral(node.value.raw)) {
        context.report({
          node,
          messageId: 'noColorLiterals',
        });
      }
    },
    Literal(node) {
      if (isColorLiteral(node.value)) {
        context.report({
          node,
          messageId: 'noColorLiterals',
        });
      }
    },
  }),
});
