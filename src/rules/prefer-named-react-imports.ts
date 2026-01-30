import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

type MessageIds = 'preferNamedImport';

const REACT_EXPORTS = new Set([
  // Components
  'Fragment',
  'StrictMode',
  'Suspense',
  'Profiler',
  // Hooks
  'useState',
  'useEffect',
  'useContext',
  'useReducer',
  'useCallback',
  'useMemo',
  'useRef',
  'useImperativeHandle',
  'useLayoutEffect',
  'useDebugValue',
  'useDeferredValue',
  'useTransition',
  'useId',
  'useSyncExternalStore',
  'useInsertionEffect',
  // HOCs/Utilities
  'memo',
  'forwardRef',
  'lazy',
  'createContext',
  'createElement',
  'cloneElement',
  'isValidElement',
  'Children',
  'createRef',
]);

export const preferNamedReactImports: TSESLint.RuleModule<
  MessageIds,
  Array<never>
> = ESLintUtils.RuleCreator((name) => name)({
  name: 'prefer-named-react-imports',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using named imports from React instead of React.X namespace access',
      recommended: 'error',
    },
    messages: {
      preferNamedImport:
        "Use named import '{{ name }}' instead of 'React.{{ name }}'. See https://gitlab.mll/documentation/coding-guidelines/-/wikis/react#import-react",
    },
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],
  create: (context) => {
    const isReactMemberAccess = (
      node: TSESTree.MemberExpression | TSESTree.JSXMemberExpression,
    ): string | null => {
      const { object } = node;
      const { property } = node;

      // MemberExpression uses Identifier, JSXMemberExpression uses JSXIdentifier
      const isReactObject =
        (object.type === AST_NODE_TYPES.Identifier ||
          object.type === AST_NODE_TYPES.JSXIdentifier) &&
        object.name === 'React';

      if (!isReactObject) {
        return null;
      }

      const isIdentifierProperty =
        property.type === AST_NODE_TYPES.Identifier ||
        property.type === AST_NODE_TYPES.JSXIdentifier;

      if (!isIdentifierProperty) {
        return null;
      }

      const propertyName = property.name;
      if (!REACT_EXPORTS.has(propertyName)) {
        return null;
      }

      return propertyName;
    };

    const reportAndFix = (
      node: TSESTree.MemberExpression | TSESTree.JSXMemberExpression,
      name: string,
    ): void => {
      context.report({
        node,
        messageId: 'preferNamedImport',
        data: { name },
        fix(fixer) {
          // Replace React.X with X
          // The named import must be added manually or via TypeScript auto-import
          return fixer.replaceText(node, name);
        },
      });
    };

    return {
      MemberExpression(node) {
        const name = isReactMemberAccess(node);
        if (name) {
          reportAndFix(node, name);
        }
      },

      JSXMemberExpression(node) {
        const name = isReactMemberAccess(node);
        if (name) {
          reportAndFix(node, name);
        }
      },
    };
  },
});
