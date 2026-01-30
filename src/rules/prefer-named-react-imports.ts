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

interface Violation {
  node: TSESTree.MemberExpression | TSESTree.JSXMemberExpression;
  name: string;
}

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
    let reactImportNode: TSESTree.ImportDeclaration | null = null;
    const existingNamedImports = new Set<string>();
    const violations: Array<Violation> = [];

    const isReactMemberAccess = (
      node: TSESTree.MemberExpression | TSESTree.JSXMemberExpression,
    ): string | null => {
      const { object } = node;
      const { property } = node;

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

    const collectViolation = (
      node: TSESTree.MemberExpression | TSESTree.JSXMemberExpression,
      name: string,
    ): void => {
      violations.push({ node, name });
    };

    return {
      ImportDeclaration(node) {
        if (node.source.value === 'react') {
          reactImportNode = node;
          for (const specifier of node.specifiers) {
            if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
              existingNamedImports.add(specifier.imported.name);
            }
          }
        }
      },

      MemberExpression(node) {
        const name = isReactMemberAccess(node);
        if (name) {
          collectViolation(node, name);
        }
      },

      JSXMemberExpression(node) {
        const name = isReactMemberAccess(node);
        if (name) {
          collectViolation(node, name);
        }
      },

      'Program:exit'() {
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

              if (reactImportNode && neededImports.size > 0) {
                const importsToAdd = Array.from(neededImports).sort();
                const hasDefaultImport = reactImportNode.specifiers.some(
                  (s) => s.type === AST_NODE_TYPES.ImportDefaultSpecifier,
                );
                const hasNamedImports = reactImportNode.specifiers.some(
                  (s) => s.type === AST_NODE_TYPES.ImportSpecifier,
                );

                if (hasNamedImports) {
                  const lastNamedImport = reactImportNode.specifiers
                    .filter((s) => s.type === AST_NODE_TYPES.ImportSpecifier)
                    .at(-1);
                  if (lastNamedImport) {
                    yield fixer.insertTextAfter(
                      lastNamedImport,
                      `, ${importsToAdd.join(', ')}`,
                    );
                  }
                } else if (hasDefaultImport) {
                  const defaultImport = reactImportNode.specifiers.find(
                    (s) => s.type === AST_NODE_TYPES.ImportDefaultSpecifier,
                  );
                  if (defaultImport) {
                    yield fixer.insertTextAfter(
                      defaultImport,
                      `, { ${importsToAdd.join(', ')} }`,
                    );
                  }
                } else {
                  const importText = `import { ${importsToAdd.join(', ')} } from 'react';\n`;
                  yield fixer.insertTextBefore(
                    sourceCode.ast.body[0],
                    importText,
                  );
                }

                neededImports.clear();
              }
            },
          });
        }
      },
    };
  },
});
