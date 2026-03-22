#!/usr/bin/env bash
set -euo pipefail

if git diff --cached --quiet -- requirements.in; then
  exit 0
fi

chmod 644 requirements.txt
pip-compile requirements.in -o requirements.txt
chmod 444 requirements.txt
git add requirements.txt