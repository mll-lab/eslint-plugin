import { ESLintUtils, TSESLint } from '@typescript-eslint/experimental-utils';

export const noGlobalStyles: TSESLint.RuleModule<
  string,
  Array<never>
> = ESLintUtils.RuleCreator((name) => name)({
  name: 'no-global-styles',
  meta: {
    type: 'problem',
    docs: {
      description: 'Avoid polluting global styles with raw CSS imports',
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
