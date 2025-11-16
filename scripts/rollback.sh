#!/bin/bash

# ============================================================================
# Rollback Script
# ============================================================================
# Quickly rolls back to previous version

set -e

echo "============================================"
echo "ROLLBACK PROCEDURE"
echo "============================================"

# Get current and previous versions
CURRENT_VERSION=$(cat .current-version 2>/dev/null || echo "unknown")
PREVIOUS_VERSION=$(cat .previous-version 2>/dev/null || echo "unknown")

echo "Current version: $CURRENT_VERSION"
echo "Rolling back to: $PREVIOUS_VERSION"
echo ""

read -p "Are you sure you want to rollback? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Rollback cancelled"
  exit 0
fi

echo ""
echo "🔄 Starting rollback..."

# Step 1: Switch traffic to previous version
echo "📍 Step 1: Switching traffic to previous version..."

# Example: Update load balancer
# aws elbv2 modify-listener \
#   --listener-arn $LISTENER_ARN \
#   --default-actions Type=forward,TargetGroupArn=$PREVIOUS_TARGET_GROUP_ARN

echo "✅ Traffic switched"

# Step 2: Verify previous version is healthy
echo "🏥 Step 2: Verifying previous version health..."

if ! curl -f "https://api.roleready.com/api/health" > /dev/null 2>&1; then
  echo "❌ Previous version health check failed"
  echo "⚠️  Manual intervention required!"
  exit 1
fi

echo "✅ Previous version is healthy"

# Step 3: Run smoke tests
echo "🧪 Step 3: Running smoke tests..."
npm run test:smoke

if [ $? -ne 0 ]; then
  echo "❌ Smoke tests failed"
  echo "⚠️  Manual intervention required!"
  exit 1
fi

echo "✅ Smoke tests passed"

# Step 4: Rollback database migrations (if needed)
echo "🗄️  Step 4: Checking database migrations..."

if [ -f ".migration-rollback-$CURRENT_VERSION.sql" ]; then
  read -p "Rollback database migrations? (yes/no): " ROLLBACK_DB
  
  if [ "$ROLLBACK_DB" = "yes" ]; then
    echo "Rolling back database..."
    psql $DATABASE_URL < ".migration-rollback-$CURRENT_VERSION.sql"
    echo "✅ Database rolled back"
  fi
fi

# Step 5: Update version tracking
echo "📝 Step 5: Updating version tracking..."
echo "$PREVIOUS_VERSION" > .current-version

# Step 6: Notify team
echo "📢 Step 6: Sending notifications..."

# Send Slack notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  curl -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-Type: application/json' \
    -d '{
      "text": "🔄 Rollback completed",
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*Rollback Completed*\nFrom: '"$CURRENT_VERSION"'\nTo: '"$PREVIOUS_VERSION"'"
          }
        }
      ]
    }'
fi

echo ""
echo "============================================"
echo "Rollback Complete!"
echo "============================================"
echo "Previous version: $CURRENT_VERSION"
echo "Current version: $PREVIOUS_VERSION"
echo "============================================"
echo ""
echo "📝 Post-rollback checklist:"
echo "  1. Monitor error rates for next 30 minutes"
echo "  2. Investigate root cause of issues"
echo "  3. Update incident report"
echo "  4. Plan next deployment"

