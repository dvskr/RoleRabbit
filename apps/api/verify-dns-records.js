/**
 * DNS Records Verification Script for rolerabbit.com
 * 
 * This script helps verify that DNS records are correctly configured
 * Run: node verify-dns-records.js
 */

const dns = require('dns').promises;

// Expected DNS records from Resend
const expectedRecords = {
  dkim: {
    name: 'resend._domainkey.rolerabbit.com',
    type: 'TXT',
    expectedStart: 'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDoFjxw70BTbniHM5LXb948IVNeWmlgyUhylUicVeH6FiWlgqZrv7xZ4440dLFrFdVS+6YNAkuUNtAPk9218G7Q061L3saEFpJrQo0rUit/mGSdMAPLRTkkynl1q+Uid9vKwMN9I4YRZ34Be1lpMoOabU8LDvtPQ3Y6P4A1/3TJBQIDAQAB'
  },
  mx: {
    name: 'send.rolerabbit.com',
    type: 'MX',
    expectedValue: 'feedback-smtp.us-east-1.amazonaws.com'
  },
  spf: {
    name: 'send.rolerabbit.com',
    type: 'TXT',
    expectedValue: 'v=spf1 include:amazonses.com ~all'
  },
  dmarc: {
    name: '_dmarc.rolerabbit.com',
    type: 'TXT',
    expectedValue: 'v=DMARC1; p=none;'
  }
};

async function checkTXTRecord(hostname, expectedStart = null) {
  try {
    const records = await dns.resolveTxt(hostname);
    const allRecords = records.flat().join('');
    
    console.log(`\n✓ ${hostname}`);
    console.log(`  Found: ${allRecords.substring(0, 100)}${allRecords.length > 100 ? '...' : ''}`);
    
    if (expectedStart && allRecords.startsWith(expectedStart)) {
      console.log(`  ✅ DKIM record looks correct!`);
      return true;
    } else if (expectedStart) {
      console.log(`  ⚠️  DKIM record doesn't match expected start`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`\n✗ ${hostname}`);
    console.log(`  ❌ Not found or not propagated yet: ${error.message}`);
    return false;
  }
}

async function checkMXRecord(hostname, expectedValue) {
  try {
    const records = await dns.resolveMx(hostname);
    
    console.log(`\n✓ ${hostname}`);
    records.forEach(record => {
      console.log(`  Found: ${record.exchange} (Priority: ${record.priority})`);
    });
    
    const matches = records.some(r => 
      r.exchange.toLowerCase().includes(expectedValue.toLowerCase()) || 
      r.exchange.toLowerCase().replace(/\.$/, '') === expectedValue.toLowerCase()
    );
    
    if (matches) {
      console.log(`  ✅ MX record matches expected value!`);
      return true;
    } else {
      console.log(`  ⚠️  MX record doesn't match expected: ${expectedValue}`);
      return false;
    }
  } catch (error) {
    console.log(`\n✗ ${hostname}`);
    console.log(`  ❌ Not found or not propagated yet: ${error.message}`);
    return false;
  }
}

async function verifyDNSRecords() {
  console.log('🔍 Verifying DNS Records for rolerabbit.com\n');
  console.log('=' .repeat(60));
  
  const results = {
    dkim: false,
    mx: false,
    spf: false,
    dmarc: false
  };
  
  // Check DKIM
  console.log('\n📧 Checking DKIM Record (Domain Verification)...');
  results.dkim = await checkTXTRecord(
    expectedRecords.dkim.name,
    expectedRecords.dkim.expectedStart
  );
  
  // Check MX
  console.log('\n📨 Checking MX Record (Email Sending)...');
  results.mx = await checkMXRecord(
    expectedRecords.mx.name,
    expectedRecords.mx.expectedValue
  );
  
  // Check SPF
  console.log('\n🔐 Checking SPF Record (Email Authorization)...');
  results.spf = await checkTXTRecord(expectedRecords.spf.name);
  
  // Check DMARC
  console.log('\n🛡️  Checking DMARC Record...');
  results.dmarc = await checkTXTRecord(expectedRecords.dmarc.name);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Verification Summary:\n');
  
  const allPassed = Object.values(results).every(r => r);
  
  Object.entries(results).forEach(([key, passed]) => {
    const icon = passed ? '✅' : '❌';
    const name = key.toUpperCase();
    console.log(`  ${icon} ${name}: ${passed ? 'Found' : 'Not Found'}`);
  });
  
  console.log('\n' + '='.repeat(60));
  
  if (allPassed) {
    console.log('\n🎉 All DNS records are configured correctly!');
    console.log('   Resend should verify your domain automatically.');
    console.log('   Check status at: https://resend.com/domains');
  } else {
    console.log('\n⚠️  Some DNS records are missing or not propagated yet.');
    console.log('\n📝 Next Steps:');
    console.log('   1. Verify records are added in GoDaddy DNS settings');
    console.log('   2. Wait 5-15 minutes for DNS propagation');
    console.log('   3. Run this script again to check');
    console.log('   4. Check Resend dashboard: https://resend.com/domains');
  }
  
  console.log('\n');
}

// Run verification
verifyDNSRecords().catch(console.error);

