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

    /**
     * Check if a node is the literal null
     */
    function isNullLiteral(node: TSESTree.Node): boolean {
      return node.type === AST_NODE_TYPES.Literal && node.value === null;
    }

    /**
     * Check if a node is the identifier undefined
     */
    function isUndefinedIdentifier(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.Identifier && node.name === 'undefined'
      );
    }

    /**
     * Check if a node is a nullish value (null or undefined)
     */
    function isNullish(node: TSESTree.Node): boolean {
      return isNullLiteral(node) || isUndefinedIdentifier(node);
    }

    /**
     * Check if a node is a typeof expression
     */
    function isTypeofExpression(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.UnaryExpression &&
        node.operator === 'typeof'
      );
    }

    /**
     * Get the non-nullish side of a binary expression
     */
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

    /**
     * Check if a BinaryExpression checks for null
     */
    function checksNull(node: TSESTree.BinaryExpression): boolean {
      return isNullLiteral(node.left) || isNullLiteral(node.right);
    }

    /**
     * Check if a BinaryExpression checks for undefined
     */
    function checksUndefined(node: TSESTree.BinaryExpression): boolean {
      return (
        isUndefinedIdentifier(node.left) || isUndefinedIdentifier(node.right)
      );
    }

    /**
     * Compare two AST nodes for semantic equivalence
     */
    function areExpressionsEquivalent(
      node1: TSESTree.Node | null,
      node2: TSESTree.Node | null,
    ): boolean {
      if (!node1 || !node2) {
        return false;
      }

      // Use source code comparison as a simple heuristic
      return sourceCode.getText(node1) === sourceCode.getText(node2);
    }

    /**
     * Report a strict nullish comparison and provide a fix
     */
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

    /**
     * Report a combined null/undefined check and provide a fix
     */
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
        // Only check strict equality operators
        if (node.operator !== '===' && node.operator !== '!==') {
          return;
        }

        // Don't flag typeof checks
        if (isTypeofExpression(node.left) || isTypeofExpression(node.right)) {
          return;
        }

        // Check if this is part of a combined null/undefined check
        // If so, the LogicalExpression visitor will handle it
        const { parent } = node;
        if (parent && parent.type === AST_NODE_TYPES.LogicalExpression) {
          const sibling = parent.left === node ? parent.right : parent.left;

          // Check if both sides are nullish checks on the same variable
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
              // Skip this node - the LogicalExpression visitor will handle it
              return;
            }
          }
        }

        // Check if comparing to null or undefined
        if (isNullish(node.left) || isNullish(node.right)) {
          reportStrictNullishComparison(node);
        }
      },

      LogicalExpression(node: TSESTree.LogicalExpression): void {
        const { left, right, operator } = node;

        // Must be binary expressions on both sides
        if (
          left.type !== AST_NODE_TYPES.BinaryExpression ||
          right.type !== AST_NODE_TYPES.BinaryExpression
        ) {
          return;
        }

        // Pattern 2: a === null || a === undefined
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

        // Pattern 3: a !== null && a !== undefined
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
