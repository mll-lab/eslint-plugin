# error vs. warning

Always use `error` for enabled rules, never `warning`.
If the rule is too strict in some cases, violations should be addressed where
they occur instead of spamming the lint output.

# Commit Messages

We use [semantic-release](https://github.com/semantic-release/semantic-release) to automatically generate
- version number
- changelog
- releases

This requires to write commit messages that follow the [Angular commit message format](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format).

Merge requests with a lot of intermediary commits must be cleaned up by force pushing rewritten commits.
