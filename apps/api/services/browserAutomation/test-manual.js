/**
 * Manual Browser Automation Test
 * Run with: node apps/api/services/browserAutomation/test-manual.js
 */

const puppeteerService = require('./puppeteerService');
const sessionManager = require('./sessionManager');
const formFiller = require('./formFiller');
const logger = require('../../utils/logger');

async function testBrowserAutomation() {
  console.log('\n=== Testing Browser Automation Infrastructure ===\n');

  try {
    // Test 1: PuppeteerService
    console.log('1. Testing PuppeteerService...');
    const browser = await puppeteerService.getBrowser();
    console.log('   ✓ Browser launched successfully');
    console.log('   ✓ Browser is connected:', browser.isConnected());

    const page = await puppeteerService.createStealthPage(browser);
    console.log('   ✓ Stealth page created');

    // Check stealth configuration
    const webdriverCheck = await page.evaluate(() => navigator.webdriver);
    console.log('   ✓ Navigator.webdriver:', webdriverCheck, '(should be false)');

    const pluginsCheck = await page.evaluate(() => navigator.plugins.length);
    console.log('   ✓ Navigator.plugins.length:', pluginsCheck, '(should be > 0)');

    // Test 2: SessionManager
    console.log('\n2. Testing SessionManager...');
    await sessionManager.initialize();
    console.log('   ✓ SessionManager initialized');

    const testUserId = 'test-user-' + Date.now();
    const testPlatform = 'test';

    const testSessionData = {
      cookies: [{ name: 'test', value: 'value', domain: 'example.com' }],
      localStorage: { key: 'value' },
      sessionStorage: { key: 'value' },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    await sessionManager.saveSession(testUserId, testPlatform, testSessionData);
    console.log('   ✓ Session saved');

    const loadedSession = await sessionManager.loadSession(testUserId, testPlatform);
    console.log('   ✓ Session loaded:', loadedSession ? 'yes' : 'no');

    const isAuth = await sessionManager.isAuthenticated(testUserId, testPlatform);
    console.log('   ✓ Authentication check:', isAuth);

    // Test encryption
    const encrypted = sessionManager.encrypt('test data');
    const decrypted = sessionManager.decrypt(encrypted);
    console.log('   ✓ Encryption/Decryption:', decrypted === 'test data' ? 'working' : 'failed');

    // Cleanup test session
    await sessionManager.deleteSession(testUserId, testPlatform);
    console.log('   ✓ Test session cleaned up');

    // Test 3: FormFiller
    console.log('\n3. Testing FormFiller...');

    // Create test page with form
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <body>
        <form>
          <label for="firstName">First Name:</label>
          <input type="text" id="firstName" name="firstName" required>

          <label for="lastName">Last Name:</label>
          <input type="text" id="lastName" name="lastName" required>

          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required>

          <label for="phone">Phone:</label>
          <input type="tel" id="phone" name="phone">

          <label for="country">Country:</label>
          <select id="country" name="country">
            <option value="">Select...</option>
            <option value="us">United States</option>
            <option value="ca">Canada</option>
            <option value="uk">United Kingdom</option>
          </select>

          <label>
            <input type="checkbox" id="terms" name="terms" required>
            I agree to terms
          </label>

          <button type="submit">Submit</button>
        </form>
      </body>
      </html>
    `;

    await page.setContent(testHtml);
    console.log('   ✓ Test form loaded');

    // Detect fields
    const fields = await formFiller.detectFormFields(page);
    console.log('   ✓ Detected', fields.length, 'form fields');

    // Fill form
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-0123',
      country: 'United States'
    };

    const fillResult = await formFiller.fillForm(page, userData);
    console.log('   ✓ Form filled:', fillResult.filled, '/', fillResult.total, 'fields');

    // Verify filled values
    const filledValues = await page.evaluate(() => {
      return {
        firstName: document.getElementById('firstName')?.value,
        lastName: document.getElementById('lastName')?.value,
        email: document.getElementById('email')?.value,
        phone: document.getElementById('phone')?.value
      };
    });

    console.log('   ✓ Verified values:');
    console.log('     - First Name:', filledValues.firstName);
    console.log('     - Last Name:', filledValues.lastName);
    console.log('     - Email:', filledValues.email);
    console.log('     - Phone:', filledValues.phone);

    // Test 4: Integration
    console.log('\n4. Testing Integration...');
    await sessionManager.extractAndSaveCookies(page, testUserId, testPlatform);
    console.log('   ✓ Cookies extracted and saved');

    const savedSession = await sessionManager.loadSession(testUserId, testPlatform);
    console.log('   ✓ Session verified:', savedSession ? 'yes' : 'no');

    // Cleanup
    await page.close();
    await puppeteerService.releaseBrowser(browser);
    await sessionManager.deleteSession(testUserId, testPlatform);
    console.log('   ✓ Resources cleaned up');

    // Get stats
    const stats = puppeteerService.getStats();
    console.log('\n5. Final Stats:');
    console.log('   - Browser pool size:', stats.poolSize);
    console.log('   - Active browsers:', stats.activeBrowsers);
    console.log('   - Max browsers:', stats.maxBrowsers);

    const sessionStats = sessionManager.getStats();
    console.log('   - Cached sessions:', sessionStats.cachedSessions);

    console.log('\n=== All Tests Passed! ===\n');

    // Close all browsers
    await puppeteerService.closeAll();

  } catch (error) {
    console.error('\n=== Test Failed ===');
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testBrowserAutomation()
  .then(() => {
    console.log('Tests completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Tests failed:', err);
    process.exit(1);
  });
