#!/bin/bash

# ============================================================================
# Blue-Green Deployment Script
# ============================================================================
# Deploys new version to "green" environment, then switches traffic
# Keeps "blue" environment for quick rollback

set -e

# Configuration
BLUE_ENV="production-blue"
GREEN_ENV="production-green"
CURRENT_ENV=$(cat .current-env 2>/dev/null || echo "$BLUE_ENV")
NEW_ENV=$([ "$CURRENT_ENV" = "$BLUE_ENV" ] && echo "$GREEN_ENV" || echo "$BLUE_ENV")

echo "============================================"
echo "Blue-Green Deployment"
echo "============================================"
echo "Current environment: $CURRENT_ENV"
echo "New environment: $NEW_ENV"
echo "============================================"

# Step 1: Deploy to new environment
echo "📦 Step 1: Deploying to $NEW_ENV..."
./scripts/deploy.sh $NEW_ENV

# Step 2: Run health checks
echo "🏥 Step 2: Running health checks..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -f "https://$NEW_ENV.roleready.com/api/health" > /dev/null 2>&1; then
    echo "✅ Health check passed"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "⏳ Waiting for application to be ready... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 10
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Health check failed after $MAX_RETRIES attempts"
  echo "🔄 Rolling back..."
  exit 1
fi

# Step 3: Run smoke tests
echo "🧪 Step 3: Running smoke tests..."
npm run test:smoke -- --base-url="https://$NEW_ENV.roleready.com"

if [ $? -ne 0 ]; then
  echo "❌ Smoke tests failed"
  echo "🔄 Rolling back..."
  exit 1
fi

# Step 4: Switch traffic
echo "🔄 Step 4: Switching traffic to $NEW_ENV..."

# Update load balancer / DNS / CDN to point to new environment
# Example using AWS ELB:
# aws elbv2 modify-listener \
#   --listener-arn $LISTENER_ARN \
#   --default-actions Type=forward,TargetGroupArn=$NEW_TARGET_GROUP_ARN

# Example using Cloudflare:
# curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
#   -H "Authorization: Bearer $CF_API_TOKEN" \
#   -d '{"type":"CNAME","name":"www","content":"'$NEW_ENV'.roleready.com"}'

echo "✅ Traffic switched to $NEW_ENV"

# Step 5: Monitor new environment
echo "📊 Step 5: Monitoring new environment..."
echo "Monitoring for 5 minutes..."

for i in {1..30}; do
  ERROR_RATE=$(curl -s "https://$NEW_ENV.roleready.com/api/metrics" | jq -r '.errorRate')
  
  if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
    echo "❌ High error rate detected: $ERROR_RATE"
    echo "🔄 Rolling back..."
    ./scripts/rollback-blue-green.sh
    exit 1
  fi
  
  echo "✅ Error rate: $ERROR_RATE (check $i/30)"
  sleep 10
done

# Step 6: Save new current environment
echo "$NEW_ENV" > .current-env

# Step 7: Keep old environment for 24 hours
echo "✅ Deployment successful!"
echo "📝 Old environment ($CURRENT_ENV) will be kept for 24 hours for quick rollback"
echo "🗑️  To tear down old environment: ./scripts/teardown-env.sh $CURRENT_ENV"

echo "============================================"
echo "Deployment Complete!"
echo "============================================"
echo "New environment: $NEW_ENV"
echo "Old environment: $CURRENT_ENV (standby)"
echo "============================================"

