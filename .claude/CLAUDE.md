# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn build          # Compile TypeScript to dist/
yarn lint           # Run ESLint
yarn format         # Run ESLint with auto-fix
yarn test           # Run all tests with Jest
yarn test <path>    # Run a single test file, e.g. yarn test tests/rules/cast-to-boolean.test.ts
```

## Architecture

This is an ESLint plugin (`@mll-lab/eslint-plugin`) that provides custom rules and a recommended configuration.

### Source Structure

- `src/index.ts` - Plugin entry point exporting rules and configs
- `src/rules/*.ts` - Individual rule implementations using `@typescript-eslint/experimental-utils`
- `tests/rules/*.test.ts` - Test files corresponding to each rule
- `tests/test-utils.ts` - Shared `createRuleTester()` helper for tests

### Adding a New Rule

1. Create rule in `src/rules/<rule-name>.ts` using `ESLintUtils.RuleCreator`
2. Export from `src/index.ts` and add to `rules` object
3. Add to `recommendedRules` with `@mll-lab/<rule-name>` key
4. Create test in `tests/rules/<rule-name>.test.ts`

### Rule Implementation Pattern

Rules follow this structure:

```typescript
import { ESLintUtils, TSESLint } from '@typescript-eslint/experimental-utils';

export const ruleName: TSESLint.RuleModule<string, Array<never>> =
  ESLintUtils.RuleCreator((name) => name)({
    name: 'rule-name',
    meta: {
      type: 'suggestion',
      docs: { description: '...', recommended: 'error' },
      messages: { messageId: 'Error message' },
      schema: [],
      fixable: 'code',  // if auto-fixable
    },
    defaultOptions: [],
    create: (context) => ({ /* AST visitors */ }),
  });
```

## Commits

Uses semantic-release with Angular commit format:
- `feat(rule):` for new rules
- `fix(rule):` for bug fixes
- `chore:` for maintenance
