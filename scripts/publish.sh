#!/usr/bin/env bash
# Rebuilds docs/ from Postgres and pushes it to main, which GitHub Pages serves.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain)" ]; then
  echo "nowly has uncommitted changes; commit or stash them first." >&2
  exit 1
fi

git checkout --quiet main
git pull --quiet --ff-only
npm run --silent build:static
git add docs

if git diff --cached --quiet; then
  echo "Nothing new to publish."
  exit 0
fi

git commit --quiet -m "chore(site): publish articles of $(date +%F)"
git push --quiet origin main
echo "Published."
