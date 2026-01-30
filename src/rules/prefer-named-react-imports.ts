import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

type MessageIds = 'preferNamedImport';

type MemberNode = TSESTree.MemberExpression | TSESTree.JSXMemberExpression;

type Violation = {
  node: MemberNode;
  name: string;
};

const REACT_EXPORTS = new Set([
  'Children',
  'Fragment',
  'Profiler',
  'StrictMode',
  'Suspense',
  'cloneElement',
  'createContext',
  'createElement',
  'createRef',
  'forwardRef',
  'isValidElement',
  'lazy',
  'memo',
  'useCallback',
  'useContext',
  'useDebugValue',
  'useDeferredValue',
  'useEffect',
  'useId',
  'useImperativeHandle',
  'useInsertionEffect',
  'useLayoutEffect',
  'useMemo',
  'useReducer',
  'useRef',
  'useState',
  'useSyncExternalStore',
  'useTransition',
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
  create(context) {
    let reactImportNode: TSESTree.ImportDeclaration | null = null;
    const existingNamedImports = new Set<string>();
    const violations: Array<Violation> = [];

    function getReactMemberName(node: MemberNode): string | null {
      const { object, property } = node;

      const isReactObject =
        (object.type === AST_NODE_TYPES.Identifier ||
          object.type === AST_NODE_TYPES.JSXIdentifier) &&
        object.name === 'React';

      if (!isReactObject) {
        return null;
      }

      if (
        property.type !== AST_NODE_TYPES.Identifier &&
        property.type !== AST_NODE_TYPES.JSXIdentifier
      ) {
        return null;
      }

      if (!REACT_EXPORTS.has(property.name)) {
        return null;
      }

      return property.name;
    }

    function checkMemberExpression(node: MemberNode): void {
      const name = getReactMemberName(node);
      if (name !== null) {
        violations.push({ node, name });
      }
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'react') {
          return;
        }

        reactImportNode = node;
        for (const specifier of node.specifiers) {
          if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
            existingNamedImports.add(specifier.imported.name);
          }
        }
      },

      MemberExpression: checkMemberExpression,
      JSXMemberExpression: checkMemberExpression,

      'Program:exit': function () {
        if (violations.length === 0) {
          return;
        }

        const neededImports = new Set<string>();
        for (const { name } of violations) {
          if (!existingNamedImports.has(name)) {
            neededImports.add(name);
          }
        }

        const sourceCode = context.getSourceCode();

        for (const { node, name } of violations) {
          context.report({
            node,
            messageId: 'preferNamedImport',
            data: { name },
            *fix(fixer) {
              yield fixer.replaceText(node, name);

              if (reactImportNode === null || neededImports.size === 0) {
                return;
              }

              const importsToAdd = Array.from(neededImports).sort();
              const lastNamedImport = reactImportNode.specifiers
                .filter((s) => s.type === AST_NODE_TYPES.ImportSpecifier)
                .at(-1);
              const defaultImport = reactImportNode.specifiers.find(
                (s) => s.type === AST_NODE_TYPES.ImportDefaultSpecifier,
              );

              if (lastNamedImport) {
                yield fixer.insertTextAfter(
                  lastNamedImport,
                  `, ${importsToAdd.join(', ')}`,
                );
              } else if (defaultImport) {
                yield fixer.insertTextAfter(
                  defaultImport,
                  `, { ${importsToAdd.join(', ')} }`,
                );
              } else {
                const importText = `import { ${importsToAdd.join(
                  ', ',
                )} } from 'react';\n`;
                yield fixer.insertTextBefore(
                  sourceCode.ast.body[0],
                  importText,
                );
              }

              neededImports.clear();
            },
          });
        }
      },
    };
  },
});
