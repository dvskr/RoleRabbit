#!/bin/bash

# Fix Git History - Remove Invalid File Path
# This script removes the problematic file from Git history

echo "🔧 Fixing Git history..."

# Create a backup branch
git branch backup-before-fix

# Remove the invalid file from all commits
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch "apps/api/prisma/migrations/\$(ls -t prisma/migrations | head -1)/migration.sql"' \
  --prune-empty --tag-name-filter cat -- --all

echo "✅ Invalid file removed from Git history"
echo ""
echo "⚠️  IMPORTANT: You must force push to update the remote:"
echo "    git push origin --force --all"
echo ""
echo "📦 Backup branch created: backup-before-fix"
echo "    (You can delete it later with: git branch -D backup-before-fix)"

