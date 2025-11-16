#!/bin/bash
# Test RoleRabbit API Endpoints
# Verifies all security and moderation APIs are working

set -e

echo "🧪 Testing RoleRabbit API Endpoints"
echo "===================================="
echo ""

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
TOKEN="${TOKEN:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5

    echo -e "${BLUE}Testing: ${name}${NC}"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}${endpoint}" \
            -H "Authorization: Bearer ${TOKEN}" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "${BASE_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${TOKEN}" \
            -d "$data" 2>&1)
    fi

    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Status: $status"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - Expected: $expected_status, Got: $status"
        echo "Response: $body"
        ((FAILED++))
    fi
    echo ""
}

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "${BASE_URL}/api/health" > /dev/null; then
    echo -e "${RED}Error: Server not running at ${BASE_URL}${NC}"
    echo "Start the server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# 1. Health Check
test_endpoint "Health Check" "GET" "/api/health" "" "200"

# 2. API Documentation
test_endpoint "API Documentation Page" "GET" "/api-docs" "" "200"

# If no token provided, skip authenticated tests
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}⚠️  No TOKEN provided. Skipping authenticated tests.${NC}"
    echo ""
    echo "To test authenticated endpoints:"
    echo "1. Login and get a token"
    echo "2. Run: TOKEN=your-token-here ./scripts/test-apis.sh"
    echo ""
else
    echo "Testing authenticated endpoints..."
    echo ""

    # Generate test UUIDs
    PORTFOLIO_ID=$(uuidgen 2>/dev/null || echo "00000000-0000-0000-0000-000000000001")
    QUEUE_ID=$(uuidgen 2>/dev/null || echo "00000000-0000-0000-0000-000000000002")

    # 3. Data Export (Authenticated user)
    test_endpoint "Data Export" "GET" "/api/user/export-data" "" "200"

    # 4. Account Deletion Status
    test_endpoint "Account Deletion Status" "GET" "/api/user/delete-account" "" "200"

    # 5. Submit Abuse Report
    abuse_data='{
        "portfolioId": "'$PORTFOLIO_ID'",
        "reason": "spam",
        "description": "This is a test abuse report"
    }'
    test_endpoint "Submit Abuse Report" "POST" "/api/abuse/report" "$abuse_data" "201"

    # 6. Get Abuse Reports (Moderator/Admin)
    test_endpoint "Get Abuse Reports" "GET" "/api/abuse/reports?page=1&limit=20" "" "200"

    # 7. Get Review Queue (Moderator/Admin)
    test_endpoint "Get Review Queue" "GET" "/api/admin/review-queue?status=pending" "" "200"

    # 8. Moderate Content (Admin)
    moderate_data='{
        "portfolioId": "'$PORTFOLIO_ID'",
        "action": "scan"
    }'
    test_endpoint "Scan Portfolio" "POST" "/api/admin/moderate" "$moderate_data" "200"

    # 9. Rate Limit Stats (Admin)
    test_endpoint "Get Rate Limit Stats" "GET" "/api/admin/rate-limits" "" "200"
fi

# Summary
echo "===================================="
echo "Test Summary"
echo "===================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
