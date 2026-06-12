#!/bin/bash
set -euo pipefail

REPO_NAME="${1:?Repo name required}"
DESCRIPTION="${2:-Rugby Manager}"
DIR="${3:-.}"

CRED=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill)
TOKEN=$(echo "$CRED" | awk -F= '/^password=/{print $2}')
USER=$(echo "$CRED" | awk -F= '/^username=/{print $2}')

if [ -z "$TOKEN" ]; then
  echo "No GitHub credentials found. Run: gh auth login"
  exit 1
fi

HTTP_CODE=$(curl -s -o /tmp/gh-create-repo.json -w "%{http_code}" -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${TOKEN}" \
  "https://api.github.com/user/repos" \
  -d "{\"name\":\"${REPO_NAME}\",\"private\":false,\"description\":\"${DESCRIPTION}\"}")

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "422" ]; then
  echo "Repository ${REPO_NAME} ready (HTTP ${HTTP_CODE})"
else
  echo "Failed to create repository (HTTP ${HTTP_CODE})"
  cat /tmp/gh-create-repo.json
  exit 1
fi

cd "$DIR"
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "https://github.com/${USER}/${REPO_NAME}.git"
fi
git push -u origin main
echo "Pushed ${REPO_NAME} to GitHub"
