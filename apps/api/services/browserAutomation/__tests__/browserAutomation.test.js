/**
 * Browser Automation Tests
 * Tests puppeteerService, sessionManager, and formFiller
 */

const puppeteerService = require('../puppeteerService');
const sessionManager = require('../sessionManager');
const formFiller = require('../formFiller');

describe('Browser Automation Infrastructure', () => {
  let browser;
  let page;

  afterAll(async () => {
    // Cleanup
    await puppeteerService.closeAll();
  });

  describe('PuppeteerService', () => {
    test('should launch browser successfully', async () => {
      browser = await puppeteerService.getBrowser();
      expect(browser).toBeDefined();
      expect(browser.isConnected()).toBe(true);
    }, 30000);

    test('should create stealth page', async () => {
      page = await puppeteerService.createStealthPage(browser);
      expect(page).toBeDefined();

      // Check that stealth properties are set
      const webdriverCheck = await page.evaluate(() => navigator.webdriver);
      expect(webdriverCheck).toBe(false);
    }, 30000);

    test('should navigate to URL with retry', async () => {
      const success = await puppeteerService.navigateWithRetry(page, 'https://example.com');
      expect(success).toBe(true);
    }, 60000);

    test('should return browser to pool', async () => {
      const statsBefore = puppeteerService.getStats();
      await puppeteerService.releaseBrowser(browser);
      const statsAfter = puppeteerService.getStats();

      expect(statsAfter.poolSize).toBeGreaterThanOrEqual(statsBefore.poolSize);
    });
  });

  describe('SessionManager', () => {
    const testUserId = '999';
    const testPlatform = 'test_platform';

    afterAll(async () => {
      // Cleanup test session
      await sessionManager.deleteSession(testUserId, testPlatform);
    });

    test('should initialize successfully', async () => {
      await sessionManager.initialize();
      expect(sessionManager.sessionsDir).toBeDefined();
    });

    test('should save session data', async () => {
      const sessionData = {
        cookies: [
          { name: 'test_cookie', value: 'test_value', domain: 'example.com' }
        ],
        localStorage: { key: 'value' },
        sessionStorage: { key: 'value' },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const result = await sessionManager.saveSession(testUserId, testPlatform, sessionData);
      expect(result).toBe(true);
    });

    test('should load saved session', async () => {
      const sessionData = await sessionManager.loadSession(testUserId, testPlatform);
      expect(sessionData).toBeDefined();
      expect(sessionData.cookies).toBeDefined();
      expect(sessionData.cookies.length).toBeGreaterThan(0);
    });

    test('should check authentication status', async () => {
      const isAuth = await sessionManager.isAuthenticated(testUserId, testPlatform);
      expect(typeof isAuth).toBe('boolean');
    });

    test('should encrypt and decrypt data', () => {
      const testData = 'sensitive data 123';
      const encrypted = sessionManager.encrypt(testData);

      expect(encrypted.encryptedData).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.authTag).toBeDefined();

      const decrypted = sessionManager.decrypt(encrypted);
      expect(decrypted).toBe(testData);
    });
  });

  describe('FormFiller', () => {
    test('should detect form fields', async () => {
      // Create a test page with a simple form
      const browser = await puppeteerService.getBrowser();
      const page = await browser.newPage();

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <body>
          <form>
            <label for="firstName">First Name:</label>
            <input type="text" id="firstName" name="firstName" required>

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>

            <label for="phone">Phone:</label>
            <input type="tel" id="phone" name="phone">

            <label for="country">Country:</label>
            <select id="country" name="country">
              <option value="us">United States</option>
              <option value="ca">Canada</option>
            </select>

            <button type="submit">Submit</button>
          </form>
        </body>
        </html>
      `;

      await page.setContent(htmlContent);

      const fields = await formFiller.detectFormFields(page);

      expect(fields).toBeDefined();
      expect(fields.length).toBeGreaterThan(0);

      // Check that fields have required properties
      const firstField = fields[0];
      expect(firstField.selector).toBeDefined();
      expect(firstField.type).toBeDefined();

      await page.close();
      await puppeteerService.releaseBrowser(browser);
    }, 30000);

    test('should map data to fields', async () => {
      const fields = [
        {
          selector: '#firstName',
          type: 'text',
          name: 'firstName',
          id: 'firstName',
          label: 'First Name',
          placeholder: '',
          required: true
        },
        {
          selector: '#email',
          type: 'email',
          name: 'email',
          id: 'email',
          label: 'Email',
          placeholder: '',
          required: true
        }
      ];

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };

      const mappings = formFiller.mapDataToFields(fields, userData);

      expect(mappings).toBeDefined();
      expect(mappings.length).toBeGreaterThan(0);

      // Check that mappings have required properties
      const firstMapping = mappings[0];
      expect(firstMapping.field).toBeDefined();
      expect(firstMapping.value).toBeDefined();
      expect(firstMapping.confidence).toBeDefined();
    });

    test('should fill form with user data', async () => {
      const browser = await puppeteerService.getBrowser();
      const page = await browser.newPage();

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <body>
          <form>
            <input type="text" id="firstName" name="firstName">
            <input type="email" id="email" name="email">
            <input type="tel" id="phone" name="phone">
          </form>
        </body>
        </html>
      `;

      await page.setContent(htmlContent);

      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-0123'
      };

      const result = await formFiller.fillForm(page, userData);

      expect(result.success).toBe(true);
      expect(result.filled).toBeGreaterThan(0);

      // Verify values were actually filled
      const filledValues = await page.evaluate(() => {
        return {
          firstName: document.getElementById('firstName').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phone').value
        };
      });

      expect(filledValues.firstName).toBe('Jane');
      expect(filledValues.email).toBe('jane.smith@example.com');
      expect(filledValues.phone).toBe('555-0123');

      await page.close();
      await puppeteerService.releaseBrowser(browser);
    }, 30000);
  });

  describe('Integration Tests', () => {
    test('should work together: launch browser, fill form, save session', async () => {
      const testUserId = '888';
      const testPlatform = 'integration_test';

      // 1. Get browser
      const browser = await puppeteerService.getBrowser();
      expect(browser).toBeDefined();

      // 2. Create stealth page
      const page = await puppeteerService.createStealthPage(browser);
      expect(page).toBeDefined();

      // 3. Set content with form
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <body>
          <form>
            <input type="text" id="fullName" name="fullName">
            <input type="email" id="email" name="email">
          </form>
        </body>
        </html>
      `);

      // 4. Fill form
      const userData = {
        firstName: 'Integration',
        lastName: 'Test',
        email: 'integration@test.com'
      };

      const fillResult = await formFiller.fillForm(page, userData);
      expect(fillResult.success).toBe(true);

      // 5. Extract and save session
      await sessionManager.extractAndSaveCookies(page, testUserId, testPlatform);

      // 6. Verify session was saved
      const savedSession = await sessionManager.loadSession(testUserId, testPlatform);
      expect(savedSession).toBeDefined();

      // Cleanup
      await page.close();
      await puppeteerService.releaseBrowser(browser);
      await sessionManager.deleteSession(testUserId, testPlatform);
    }, 60000);
  });
});
