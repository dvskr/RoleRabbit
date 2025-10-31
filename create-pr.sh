#!/bin/bash
# Create PR via GitHub API
# Usage: GITHUB_TOKEN=your_token ./create-pr.sh

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN environment variable not set"
    echo ""
    echo "To create PR via API:"
    echo "1. Get token from: https://github.com/settings/tokens"
    echo "2. Run: export GITHUB_TOKEN=your_token_here"
    echo "3. Run this script again"
    echo ""
    exit 1
fi

OWNER="dvskr"
REPO="RoleReady-FullStack"
BASE="main"
HEAD="feature_pro_2"
TITLE="feat: Major refactoring and documentation cleanup"

BODY=$(cat PR_DESCRIPTION.md)

curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$OWNER/$REPO/pulls" \
  -d "{
    \"title\": \"$TITLE\",
    \"head\": \"$OWNER:$HEAD\",
    \"base\": \"$BASE\",
    \"body\": $(echo "$BODY" | jq -Rs .)
  }" | jq -r '.html_url'

