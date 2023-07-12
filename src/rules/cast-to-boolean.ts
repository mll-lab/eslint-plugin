// https://www.frontendmayhem.com/writing-your-own-eslint-plugin-autofix-code
import { ESLintUtils } from '@typescript-eslint/experimental-utils';

export const castToBoolean = ESLintUtils.RuleCreator((name) => name)({
  name: 'cast-to-boolean',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Canonicalizes boolean casts',
      recommended: 'error',
    },
    messages: {
      castToBoolean: 'Use Boolean()',
    },
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],
  create: (context) => ({
    UnaryExpression(node) {
      if (node.operator !== '!') {
        return;
      }

      const { parent } = node;
      if (parent === undefined) {
        return;
      }

      if (!('operator' in parent)) {
        return;
      }

      if (parent.operator !== '!') {
        return;
      }

      context.report({
        node,
        messageId: 'castToBoolean',
        fix(fixer) {
          const arg = node.argument;

          const source = context.getSourceCode();
          const fixed = `Boolean(${source.getText(arg)})`;

          return fixer.replaceText(parent, fixed);
        },
      });
    },
  }),
});
