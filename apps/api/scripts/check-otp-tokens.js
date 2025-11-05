/**
 * Check OTP Tokens Script
 * Useful for debugging OTP-related issues
 * 
 * Usage: node scripts/check-otp-tokens.js [userId]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOTPTokens(userId = null) {
  try {
    console.log('🔍 Checking OTP Tokens...\n');

    const whereClause = userId ? { userId } : {};

    // Get all OTP tokens
    const tokens = await prisma.passwordResetToken.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    if (tokens.length === 0) {
      console.log('No OTP tokens found.');
      return;
    }

    console.log(`Found ${tokens.length} OTP token(s):\n`);

    tokens.forEach((token, index) => {
      const now = new Date();
      const expiresAt = new Date(token.expiresAt);
      const isExpired = expiresAt < now;
      const isUsed = token.used;
      const isValid = !isUsed && !isExpired;

      // Parse token to extract purpose and OTP
      const [purposePrefix, otp] = token.token.split('_');
      const purpose = purposePrefix === 'e' ? 'email_update' : 'password_reset';

      console.log(`${index + 1}. Token ID: ${token.id}`);
      console.log(`   User: ${token.user.email} (${token.userId})`);
      console.log(`   Purpose: ${purpose}`);
      console.log(`   OTP: ${otp}`);
      console.log(`   Status: ${isValid ? '✅ Valid' : isUsed ? '❌ Used' : isExpired ? '⏰ Expired' : '❓ Unknown'}`);
      console.log(`   Created: ${token.createdAt.toISOString()}`);
      console.log(`   Expires: ${expiresAt.toISOString()}`);
      console.log(`   Used: ${isUsed}`);
      console.log('');
    });

    // Summary
    const validCount = tokens.filter(t => {
      const now = new Date();
      const expiresAt = new Date(t.expiresAt);
      return !t.used && expiresAt > now;
    }).length;

    const usedCount = tokens.filter(t => t.used).length;
    const expiredCount = tokens.filter(t => {
      const now = new Date();
      const expiresAt = new Date(t.expiresAt);
      return !t.used && expiresAt <= now;
    }).length;

    console.log('\n📊 Summary:');
    console.log(`   Total: ${tokens.length}`);
    console.log(`   ✅ Valid: ${validCount}`);
    console.log(`   ❌ Used: ${usedCount}`);
    console.log(`   ⏰ Expired: ${expiredCount}`);

  } catch (error) {
    console.error('Error checking OTP tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get userId from command line argument
const userId = process.argv[2] || null;

checkOTPTokens(userId);

