/**
 * Enforces loose equality (==, !=) for nullish comparisons per MLL coding guidelines.
 * https://gitlab.mll/documentation/coding-guidelines/-/wikis/java-type-script#comparisons-with-potentially-nullish-values
 *
 * When checking if a value is nullish (null or undefined), prefer loose equality because:
 * - In JavaScript: null !== undefined but null == undefined
 * - Loose comparison to null covers both cases with a single check
 *
 * Examples:
 *
 * // Bad
 * if (value === null || value === undefined) { }
 * if (value === null) { }  // when value could also be undefined
 * if (value !== null && value !== undefined) { }
 *
 * // Good
 * if (value == null) { }
 * if (value != null) { }
 *
 * // Still OK (not nullish comparisons)
 * if (typeof value === 'undefined') { }  // typeof check
 * if (x === y) { }  // comparing two variables
 */

import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

type MessageIds = 'preferLooseNullishEquality';

export const preferLooseNullishEquality: TSESLint.RuleModule<
  MessageIds,
  Array<never>
> = ESLintUtils.RuleCreator((name) => name)({
  name: 'prefer-loose-nullish-equality',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer loose equality (== null) over strict equality for nullish checks',
      recommended: 'error',
    },
    messages: {
      preferLooseNullishEquality:
        'Use loose equality ({{ operator }} null) for nullish checks. In JavaScript, null {{ operator }} undefined is true.',
    },
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    function isNullLiteral(node: TSESTree.Node): boolean {
      return node.type === AST_NODE_TYPES.Literal && node.value === null;
    }

    function isUndefinedIdentifier(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.Identifier && node.name === 'undefined'
      );
    }

    function isNullish(node: TSESTree.Node): boolean {
      return isNullLiteral(node) || isUndefinedIdentifier(node);
    }

    function isTypeofExpression(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.UnaryExpression &&
        node.operator === 'typeof'
      );
    }

    function getComparedExpression(
      node: TSESTree.BinaryExpression,
    ): TSESTree.Node | null {
      if (isNullish(node.left)) {
        return node.right;
      }
      if (isNullish(node.right)) {
        return node.left;
      }
      return null;
    }

    function checksNull(node: TSESTree.BinaryExpression): boolean {
      return isNullLiteral(node.left) || isNullLiteral(node.right);
    }

    function checksUndefined(node: TSESTree.BinaryExpression): boolean {
      return (
        isUndefinedIdentifier(node.left) || isUndefinedIdentifier(node.right)
      );
    }

    function areExpressionsEquivalent(
      node1: TSESTree.Node | null,
      node2: TSESTree.Node | null,
    ): boolean {
      if (!node1 || !node2) {
        return false;
      }

      return sourceCode.getText(node1) === sourceCode.getText(node2);
    }

    function reportStrictNullishComparison(
      node: TSESTree.BinaryExpression,
    ): void {
      const newOperator = node.operator === '===' ? '==' : '!=';
      const comparedExpr = getComparedExpression(node);

      if (!comparedExpr) {
        return;
      }

      context.report({
        node,
        messageId: 'preferLooseNullishEquality',
        data: {
          operator: newOperator,
        },
        fix(fixer) {
          const valueText = sourceCode.getText(comparedExpr);
          const fixed = `${valueText} ${newOperator} null`;
          return fixer.replaceText(node, fixed);
        },
      });
    }

    function reportCombinedNullishCheck(
      node: TSESTree.LogicalExpression,
      operator: '===' | '!==',
    ): void {
      const newOperator = operator === '===' ? '==' : '!=';
      const comparedExpr = getComparedExpression(
        node.left as TSESTree.BinaryExpression,
      );

      if (!comparedExpr) {
        return;
      }

      context.report({
        node,
        messageId: 'preferLooseNullishEquality',
        data: {
          operator: newOperator,
        },
        fix(fixer) {
          const valueText = sourceCode.getText(comparedExpr);
          const fixed = `${valueText} ${newOperator} null`;
          return fixer.replaceText(node, fixed);
        },
      });
    }

    return {
      BinaryExpression(node: TSESTree.BinaryExpression): void {
        if (node.operator !== '===' && node.operator !== '!==') {
          return;
        }

        if (isTypeofExpression(node.left) || isTypeofExpression(node.right)) {
          return;
        }

        // Combined null/undefined checks are handled by LogicalExpression visitor
        const { parent } = node;
        if (parent && parent.type === AST_NODE_TYPES.LogicalExpression) {
          const sibling = parent.left === node ? parent.right : parent.left;

          if (
            sibling.type === AST_NODE_TYPES.BinaryExpression &&
            sibling.operator === node.operator &&
            (isNullish(node.left) || isNullish(node.right)) &&
            (isNullish(sibling.left) || isNullish(sibling.right))
          ) {
            const thisExpr = getComparedExpression(node);
            const siblingExpr = getComparedExpression(sibling);

            if (
              thisExpr &&
              siblingExpr &&
              areExpressionsEquivalent(thisExpr, siblingExpr)
            ) {
              return;
            }
          }
        }

        if (isNullish(node.left) || isNullish(node.right)) {
          reportStrictNullishComparison(node);
        }
      },

      LogicalExpression(node: TSESTree.LogicalExpression): void {
        const { left, right, operator } = node;

        if (
          left.type !== AST_NODE_TYPES.BinaryExpression ||
          right.type !== AST_NODE_TYPES.BinaryExpression
        ) {
          return;
        }

        // a === null || a === undefined
        if (
          operator === '||' &&
          left.operator === '===' &&
          right.operator === '==='
        ) {
          const leftChecksNull = checksNull(left);
          const leftChecksUndefined = checksUndefined(left);
          const rightChecksNull = checksNull(right);
          const rightChecksUndefined = checksUndefined(right);

          const hasNullCheck = leftChecksNull || rightChecksNull;
          const hasUndefinedCheck = leftChecksUndefined || rightChecksUndefined;

          if (hasNullCheck && hasUndefinedCheck) {
            const leftExpr = getComparedExpression(left);
            const rightExpr = getComparedExpression(right);

            if (areExpressionsEquivalent(leftExpr, rightExpr)) {
              reportCombinedNullishCheck(node, '===');
            }
          }
        }

        // a !== null && a !== undefined
        if (
          operator === '&&' &&
          left.operator === '!==' &&
          right.operator === '!=='
        ) {
          const leftChecksNull = checksNull(left);
          const leftChecksUndefined = checksUndefined(left);
          const rightChecksNull = checksNull(right);
          const rightChecksUndefined = checksUndefined(right);

          const hasNullCheck = leftChecksNull || rightChecksNull;
          const hasUndefinedCheck = leftChecksUndefined || rightChecksUndefined;

          if (hasNullCheck && hasUndefinedCheck) {
            const leftExpr = getComparedExpression(left);
            const rightExpr = getComparedExpression(right);

            if (areExpressionsEquivalent(leftExpr, rightExpr)) {
              reportCombinedNullishCheck(node, '!==');
            }
          }
        }
      },
    };
  },
});
