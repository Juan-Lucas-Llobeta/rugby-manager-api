#!/bin/bash
set -euo pipefail

REPO_NAME="${1:?Repo name required}"
DESCRIPTION="${2:-}"
DIR="${3:-.}"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required. Install with: brew install gh && gh auth login"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login"
  exit 1
fi

gh repo create "Juan-Lucas-Llobeta/${REPO_NAME}" --public --description "${DESCRIPTION}" --source "${DIR}" --remote origin --push
