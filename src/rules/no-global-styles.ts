import { ESLintUtils } from '@typescript-eslint/experimental-utils';

export const noGlobalStyles = ESLintUtils.RuleCreator((name) => name)({
  name: 'no-global-styles',
  meta: {
    type: 'problem',
    docs: {
      description: 'Avoid polluting global styles with raw CSS imports',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      noGlobalStyles:
        'Use styled-components instead of raw style imports to prevent polluting the global namespace.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    ImportDeclaration(node) {
      const { value } = node.source;
      if (typeof value !== 'string') {
        return;
      }

      if (
        value.endsWith('.css') ||
        value.endsWith('.scss') ||
        value.endsWith('.less')
      ) {
        context.report({
          node,
          messageId: 'noGlobalStyles',
        });
      }
    },
  }),
});
