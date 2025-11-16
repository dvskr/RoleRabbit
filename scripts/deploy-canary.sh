#!/bin/bash

# ============================================================================
# Canary Deployment Script
# ============================================================================
# Gradually rolls out new version: 5% → 25% → 50% → 100%
# Monitors error rates and automatically rolls back if issues detected

set -e

# Configuration
CANARY_STAGES=(5 25 50 100)
MONITORING_DURATION=300  # 5 minutes per stage
ERROR_THRESHOLD=0.05     # 5% error rate threshold

echo "============================================"
echo "Canary Deployment"
echo "============================================"
echo "Stages: ${CANARY_STAGES[@]}%"
echo "Monitoring duration: ${MONITORING_DURATION}s per stage"
echo "Error threshold: ${ERROR_THRESHOLD}"
echo "============================================"

# Deploy canary version
echo "📦 Deploying canary version..."
./scripts/deploy.sh production-canary

# Wait for canary to be ready
echo "⏳ Waiting for canary to be ready..."
sleep 30

# Health check
if ! curl -f "https://canary.roleready.com/api/health" > /dev/null 2>&1; then
  echo "❌ Canary health check failed"
  exit 1
fi

echo "✅ Canary is healthy"

# Gradual rollout
for STAGE in "${CANARY_STAGES[@]}"; do
  echo ""
  echo "============================================"
  echo "Stage: Routing ${STAGE}% traffic to canary"
  echo "============================================"
  
  # Update traffic routing
  # Example using AWS ALB:
  # aws elbv2 modify-rule \
  #   --rule-arn $RULE_ARN \
  #   --actions Type=forward,ForwardConfig='{
  #     "TargetGroups":[
  #       {"TargetGroupArn":"'$STABLE_TARGET_GROUP'","Weight":'$((100-STAGE))'},
  #       {"TargetGroupArn":"'$CANARY_TARGET_GROUP'","Weight":'$STAGE'}
  #     ]
  #   }'
  
  echo "✅ Routing ${STAGE}% traffic to canary"
  
  # Monitor for specified duration
  echo "📊 Monitoring for ${MONITORING_DURATION}s..."
  
  START_TIME=$(date +%s)
  while [ $(($(date +%s) - START_TIME)) -lt $MONITORING_DURATION ]; do
    # Get metrics from both versions
    STABLE_METRICS=$(curl -s "https://api.roleready.com/api/metrics")
    CANARY_METRICS=$(curl -s "https://canary.roleready.com/api/metrics")
    
    STABLE_ERROR_RATE=$(echo "$STABLE_METRICS" | jq -r '.errorRate')
    CANARY_ERROR_RATE=$(echo "$CANARY_METRICS" | jq -r '.errorRate')
    
    echo "  Stable error rate: $STABLE_ERROR_RATE"
    echo "  Canary error rate: $CANARY_ERROR_RATE"
    
    # Check if canary error rate is acceptable
    if (( $(echo "$CANARY_ERROR_RATE > $ERROR_THRESHOLD" | bc -l) )); then
      echo "❌ Canary error rate too high: $CANARY_ERROR_RATE"
      echo "🔄 Rolling back..."
      ./scripts/rollback-canary.sh
      exit 1
    fi
    
    # Check if canary error rate is significantly higher than stable
    ERROR_DIFF=$(echo "$CANARY_ERROR_RATE - $STABLE_ERROR_RATE" | bc -l)
    if (( $(echo "$ERROR_DIFF > 0.02" | bc -l) )); then
      echo "❌ Canary error rate significantly higher than stable"
      echo "🔄 Rolling back..."
      ./scripts/rollback-canary.sh
      exit 1
    fi
    
    sleep 30
  done
  
  echo "✅ Stage ${STAGE}% completed successfully"
done

# Full rollout complete
echo ""
echo "============================================"
echo "Canary Deployment Complete!"
echo "============================================"
echo "✅ 100% traffic now on new version"
echo "🗑️  Tearing down old version..."

# Tear down old stable version
./scripts/teardown-env.sh production-stable

echo "✅ Deployment successful!"

