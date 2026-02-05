import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

type MessageIds = 'preferNamedImport';

type MemberNode =
  | TSESTree.MemberExpression
  | TSESTree.JSXMemberExpression
  | TSESTree.TSQualifiedName;

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
  // Types
  'ButtonHTMLAttributes',
  'ChangeEvent',
  'ComponentProps',
  'ComponentType',
  'CSSProperties',
  'Dispatch',
  'FC',
  'FocusEvent',
  'FormEvent',
  'FunctionComponent',
  'HTMLAttributes',
  'InputHTMLAttributes',
  'JSX',
  'KeyboardEvent',
  'MouseEvent',
  'MutableRefObject',
  'PropsWithChildren',
  'ReactElement',
  'ReactNode',
  'Ref',
  'RefObject',
  'SetStateAction',
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
      if (node.type === AST_NODE_TYPES.TSQualifiedName) {
        const { left, right } = node;

        if (left.type !== AST_NODE_TYPES.Identifier || left.name !== 'React') {
          return null;
        }

        return REACT_EXPORTS.has(right.name) ? right.name : null;
      }

      const { object, property } = node;

      const isReactObject =
        (object.type === AST_NODE_TYPES.Identifier ||
          object.type === AST_NODE_TYPES.JSXIdentifier) &&
        object.name === 'React';

      if (!isReactObject) {
        return null;
      }

      const isNamedProperty =
        property.type === AST_NODE_TYPES.Identifier ||
        property.type === AST_NODE_TYPES.JSXIdentifier;

      if (!isNamedProperty) {
        return null;
      }

      return REACT_EXPORTS.has(property.name) ? property.name : null;
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
        node.specifiers.forEach((specifier) => {
          if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
            existingNamedImports.add(specifier.imported.name);
          }
        });
      },

      MemberExpression: checkMemberExpression,
      JSXMemberExpression: checkMemberExpression,
      TSQualifiedName: checkMemberExpression,

      'Program:exit': function handleProgramExit() {
        if (violations.length === 0) {
          return;
        }

        const neededImports = new Set<string>();
        violations.forEach(({ name }) => {
          if (!existingNamedImports.has(name)) {
            neededImports.add(name);
          }
        });

        const sourceCode = context.getSourceCode();
        const importNode = reactImportNode;

        violations.forEach(({ node, name }) => {
          context.report({
            node,
            messageId: 'preferNamedImport',
            data: { name },
            *fix(fixer) {
              yield fixer.replaceText(node, name);

              if (importNode === null || neededImports.size === 0) {
                return;
              }

              const importsToAdd = Array.from(neededImports).sort();
              const namedImports = importNode.specifiers.filter(
                (specifier): specifier is TSESTree.ImportSpecifier =>
                  specifier.type === AST_NODE_TYPES.ImportSpecifier,
              );
              const defaultImport = importNode.specifiers.find(
                (specifier): specifier is TSESTree.ImportDefaultSpecifier =>
                  specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier,
              );

              const lastNamedImport = namedImports.at(-1);
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
                yield fixer.insertTextBefore(
                  sourceCode.ast.body[0],
                  `import { ${importsToAdd.join(', ')} } from 'react';\n`,
                );
              }

              neededImports.clear();
            },
          });
        });
      },
    };
  },
});
