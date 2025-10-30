#!/bin/bash

# Script to find potentially unused components and code

echo "=== Finding Unused Frontend Components ==="
echo ""

cd apps/web/src

# Find all component files
echo "Component files found:"
find components -name "*.tsx" -o -name "*.ts" | wc -l

echo ""
echo "Checking for unused components..."
echo ""

# Check each component
find components -name "*.tsx" -o -name "*.ts" | while read file; do
  filename=$(basename "$file" .tsx)
  filename=$(basename "$filename" .ts)
  
  # Skip index files and test files
  if [[ "$filename" == "index" ]] || [[ "$filename" == *".test" ]]; then
    continue
  fi
  
  # Check if component is imported anywhere (excluding node_modules and the file itself)
  count=$(grep -r "$filename" --include="*.tsx" --include="*.ts" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    . 2>/dev/null | grep -v "$file" | wc -l)
  
  if [ "$count" -eq 0 ]; then
    echo "⚠️  POTENTIALLY UNUSED: $file"
  fi
done

echo ""
echo "=== Finding Unused Backend Routes ==="
echo ""

cd ../../apps/api

# Find all route handlers
echo "Checking route handlers..."

grep -r "fastify\.(get|post|put|delete|patch)" --include="*.js" --include="*.ts" | \
  grep -v "node_modules" | \
  awk -F: '{print $2 HF}' | \
  sed 's/.*fastify\.//' | \
  sed 's/(.*//' | \
  sort | uniq > /tmp/routes.txt

echo "Routes found:"
cat /tmp/routes.txt
echo ""

# Check if routes are called from frontend
echo "Checking frontend API calls..."
cd ../../apps/web/src

grep -r "fetch\|axios" --include="*.tsx" --include="*.ts" \
  --exclude-dir=node_modules | \
  grep -E "/api/" | \
  sed 's/.*\/api\///' | \
  sed 's/[^a-zA-Z0-9\/].*//' | \
  sort | uniq > /tmp/frontend-calls.txt

echo "Frontend API calls found:"
cat /tmp/frontend-calls.txt

echo ""
echo "=== Summary ==="
echo "Compare routes.txt and frontend-calls.txt to find unused endpoints"

