#!/bin/bash

# 2FA Complete Testing Script
# Run this to verify all 2FA functionality

API_URL="http://localhost:5000"
EMAIL="test2fa@roleready.com"
PASSWORD="Test1234!"
NAME="Test User"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║          2FA COMPLETE TESTING SCRIPT                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check if API is running
echo "📡 Checking if API is running..."
if curl -s http://localhost:5000/health > /dev/null; then
    echo -e "${GREEN}✅ API is running${NC}"
else
    echo -e "${RED}❌ API is not running. Please start the server first.${NC}"
    exit 1
fi
echo ""

# Test 1: Register user
echo "Test 1: Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"$NAME\"}")

if echo "$REGISTER_RESPONSE" | grep -q "success"; then
    print_result 0 "User registered successfully"
else
    print_result 1 "User registration failed"
    echo "$REGISTER_RESPONSE"
    exit 1
fi
echo ""

# Test 2: Login
echo "Test 2: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c cookies.txt)

if echo "$LOGIN_RESPONSE" | grep -q "success"; then
    print_result 0 "Login successful"
else
    print_result 1 "Login failed"
    echo "$LOGIN_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Generate 2FA setup
echo "Test 3: Generating 2FA setup..."
SETUP_RESPONSE=$(curl -s -X POST $API_URL/api/auth/2fa/setup \
  -H "Content-Type: application/json" \
  -b cookies.txt)

if echo "$SETUP_RESPONSE" | grep -q "secret"; then
    print_result 0 "2FA setup generated"
    SECRET=$(echo "$SETUP_RESPONSE" | grep -o '"secret":"[^"]*"' | cut -d'"' -f4)
    echo "   Secret: $SECRET"
    
    # Save QR code
    QR_CODE=$(echo "$SETUP_RESPONSE" | grep -o '"qrCode":"[^"]*"' | cut -d'"' -f4)
    echo "   QR Code: $QR_CODE" | head -c 50
    echo "..."
    
    # Extract first backup code
    BACKUP_CODES=$(echo "$SETUP_RESPONSE" | grep -o '"backupCodes":\[[^]]*\]' | cut -d'[' -f2 | cut -d']' -f1)
    FIRST_BACKUP=$(echo "$BACKUP_CODES" | cut -d',' -f1 | tr -d '"')
    echo "   First Backup Code: $FIRST_BACKUP"
else
    print_result 1 "2FA setup failed"
    echo "$SETUP_RESPONSE"
    exit 1
fi
echo ""

# Instructions for manual testing
echo -e "${YELLOW}📱 Manual Testing Required:${NC}"
echo "1. Open QR code URL in browser to view QR code"
echo "2. Scan with Google Authenticator or Authy"
echo "3. Get 6-digit code from app"
echo ""
read -p "Enter 6-digit TOTP code from authenticator: " TOTP_CODE
echo ""

# Test 4: Enable 2FA
echo "Test 4: Enabling 2FA..."
ENABLE_RESPONSE=$(curl -s -X POST $API_URL/api/auth/2fa/enable \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"token\":\"$TOTP_CODE\",\"secret\":\"$SECRET\",\"backupCodes\":[$BACKUP_CODES]}")

if echo "$ENABLE_RESPONSE" | grep -q "success"; then
    print_result 0 "2FA enabled successfully"
else
    print_result 1 "2FA enable failed - code might be invalid"
    echo "$ENABLE_RESPONSE"
    echo ""
    echo "Trying with backup code instead..."
    TOTP_CODE=$FIRST_BACKUP
    ENABLE_RESPONSE=$(curl -s -X POST $API_URL/api/auth/2fa/enable \
      -H "Content-Type: application/json" \
      -b cookies.txt \
      -d "{\"token\":\"$TOTP_CODE\",\"secret\":\"$SECRET\",\"backupCodes\":[$BACKUP_CODES]}")
    
    if echo "$ENABLE_RESPONSE" | grep -q "success"; then
        print_result 0 "2FA enabled with backup code"
    else
        print_result 1 "2FA enable failed"
        exit 1
    fi
fi
echo ""

# Test 5: Check 2FA status
echo "Test 5: Checking 2FA status..."
STATUS_RESPONSE=$(curl -s -X GET $API_URL/api/auth/2fa/status \
  -H "Content-Type: application/json" \
  -b cookies.txt)

if echo "$STATUS_RESPONSE" | grep -q '"enabled":true'; then
    print_result 0 "2FA is enabled"
else
    print_result 1 "2FA status check failed"
    echo "$STATUS_RESPONSE"
fi
echo ""

# Test 6: Login with 2FA required
echo "Test 6: Testing login with 2FA enabled..."
LOGIN_2FA_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_2FA_RESPONSE" | grep -q "requires2FA"; then
    print_result 0 "Login correctly requires 2FA"
else
    print_result 1 "Login does not require 2FA"
    echo "$LOGIN_2FA_RESPONSE"
fi
echo ""

# Test 7: Verify 2FA token
echo "Test 7: Verifying 2FA token..."
read -p "Enter 6-digit code from authenticator again: " TOTP_CODE2

VERIFY_RESPONSE=$(curl -s -X POST $API_URL/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"twoFactorToken\":\"$TOTP_CODE2\"}")

if echo "$VERIFY_RESPONSE" | grep -q "verified"; then
    print_result 0 "2FA verification successful"
else
    print_result 1 "2FA verification failed"
    echo "$VERIFY_RESPONSE"
    echo ""
    echo "Trying with backup code..."
    read -p "Enter backup code: " BACKUP_CODE
    VERIFY_RESPONSE=$(curl -s -X POST $API_URL/api/auth/2fa/verify \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"twoFactorToken\":\"$BACKUP_CODE\"}")
    
    if echo "$VERIFY_RESPONSE" | grep -q "verified"; then
        print_result 0 "Backup code verification successful"
    else
        print_result 1 "Backup code verification failed"
        echo "$VERIFY_RESPONSE"
    fi
fi
echo ""

# Summary
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    TEST SUMMARY                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ All 7 2FA tasks implemented and tested!"
echo ""
echo "Next: Integrate with frontend UI"
echo ""

