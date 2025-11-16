#!/bin/bash
# Deployment Rollback Script (Section 4.8)
# Rollback to previous version in <5 minutes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="${NAMESPACE:-rolerabbit-production}"
ENVIRONMENT="${ENVIRONMENT:-production}"
TIMEOUT=300 # 5 minutes

echo -e "${YELLOW}=== RoleRabbit Deployment Rollback ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo

# Check kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}✗ kubectl not found${NC}"
    exit 1
fi

# Get current revision
get_current_revision() {
    local deployment=$1
    kubectl rollout history deployment/$deployment -n $NAMESPACE | tail -n 1 | awk '{print $1}'
}

# Get deployment list
DEPLOYMENTS=("rolerabbit-api" "rolerabbit-deployment-worker" "rolerabbit-pdf-worker")

echo "Current deployments:"
for deployment in "${DEPLOYMENTS[@]}"; do
    revision=$(get_current_revision $deployment)
    echo "  - $deployment: revision $revision"
done
echo

# Confirm rollback
read -p "Are you sure you want to rollback? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

# Perform rollback
echo -e "${YELLOW}Starting rollback...${NC}"
start_time=$(date +%s)

for deployment in "${DEPLOYMENTS[@]}"; do
    echo -e "\n${YELLOW}Rolling back $deployment...${NC}"
    
    # Rollback to previous revision
    if kubectl rollout undo deployment/$deployment -n $NAMESPACE; then
        echo -e "${GREEN}✓ Rollback initiated for $deployment${NC}"
    else
        echo -e "${RED}✗ Failed to rollback $deployment${NC}"
        exit 1
    fi
done

# Wait for rollout
echo -e "\n${YELLOW}Waiting for rollout to complete...${NC}"
for deployment in "${DEPLOYMENTS[@]}"; do
    echo "  Checking $deployment..."
    if kubectl rollout status deployment/$deployment -n $NAMESPACE --timeout=${TIMEOUT}s; then
        echo -e "${GREEN}  ✓ $deployment rolled back successfully${NC}"
    else
        echo -e "${RED}  ✗ $deployment rollback failed or timed out${NC}"
        exit 1
    fi
done

# Calculate duration
end_time=$(date +%s)
duration=$((end_time - start_time))
echo

if [ $duration -lt $TIMEOUT ]; then
    echo -e "${GREEN}✓ Rollback completed in ${duration}s (target: <${TIMEOUT}s)${NC}"
else
    echo -e "${YELLOW}⚠ Rollback completed in ${duration}s (exceeded target of ${TIMEOUT}s)${NC}"
fi

# Run health checks
echo -e "\n${YELLOW}Running health checks...${NC}"
HEALTH_URL="https://$([ "$ENVIRONMENT" = "production" ] && echo "rolerabbit.com" || echo "staging.rolerabbit.com")/api/health/ready"

for i in {1..5}; do
    echo "  Attempt $i/5..."
    if curl -f -s $HEALTH_URL > /dev/null; then
        echo -e "${GREEN}  ✓ Health check passed${NC}"
        break
    else
        if [ $i -eq 5 ]; then
            echo -e "${RED}  ✗ Health check failed after 5 attempts${NC}"
            exit 1
        fi
        sleep 5
    fi
done

echo -e "\n${GREEN}=== Rollback completed successfully ===${NC}"

# Send notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST $SLACK_WEBHOOK_URL \
        -H 'Content-Type: application/json' \
        -d '{
            "text": "🔄 Rollback completed successfully",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Rollback Completed*\n• Environment: '"$ENVIRONMENT"'\n• Duration: '"$duration"'s\n• Status: Success"
                    }
                }
            ]
        }'
fi
