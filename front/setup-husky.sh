#!/bin/sh
echo "" > .husky/pre-commit
echo "yarn lint-staged --allow-empty" -> .husky/pre-commit
cat ./predefined-commit-msg > .husky/commit-msg
chmod +x .husky/pre-commit .husky/commit-msg
