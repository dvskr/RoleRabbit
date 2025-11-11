/**
 * Puppeteer Service
 * Manages browser instances with pooling, stealth mode, and lifecycle management
 */

const puppeteer = require('puppeteer');
const logger = require('../../utils/logger');

class PuppeteerService {
  constructor() {
    this.browserPool = [];
    this.maxBrowsers = 5;
    this.activeBrowsers = 0;
    this.browserOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    };
  }

  /**
   * Get browser from pool or create new one
   */
  async getBrowser(options = {}) {
    try {
      // Check if we have available browser in pool
      if (this.browserPool.length > 0) {
        const browser = this.browserPool.pop();

        // Verify browser is still connected
        if (browser.isConnected()) {
          logger.info('Reusing browser from pool');
          this.activeBrowsers++;
          return browser;
        } else {
          logger.warn('Browser in pool was disconnected, creating new one');
        }
      }

      // Create new browser if pool is empty or browsers were disconnected
      if (this.activeBrowsers < this.maxBrowsers) {
        const browser = await this.launchBrowser(options);
        this.activeBrowsers++;
        return browser;
      }

      // Wait for browser to become available
      logger.info('Browser pool full, waiting for available browser...');
      await this.waitForAvailableBrowser();
      return this.getBrowser(options);

    } catch (error) {
      logger.error('Failed to get browser', { error: error.message });
      throw error;
    }
  }

  /**
   * Launch new browser instance with stealth mode
   */
  async launchBrowser(options = {}) {
    try {
      const launchOptions = {
        ...this.browserOptions,
        ...options,
        args: [...this.browserOptions.args, ...(options.args || [])]
      };

      // Add proxy if provided
      if (options.proxy) {
        launchOptions.args.push(`--proxy-server=${options.proxy}`);
      }

      logger.info('Launching new browser instance');
      const browser = await puppeteer.launch(launchOptions);

      // Set up browser event listeners
      browser.on('disconnected', () => {
        logger.warn('Browser disconnected');
        this.activeBrowsers = Math.max(0, this.activeBrowsers - 1);
      });

      return browser;

    } catch (error) {
      logger.error('Failed to launch browser', { error: error.message });
      throw error;
    }
  }

  /**
   * Create new page with stealth configuration
   */
  async createStealthPage(browser) {
    try {
      const page = await browser.newPage();

      // Set user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Set viewport
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
      });

      // Override navigator properties to avoid detection
      await page.evaluateOnNewDocument(() => {
        // Override the navigator.webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false
        });

        // Override navigator.plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5]
        });

        // Override navigator.languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en']
        });

        // Override permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
        );

        // Add chrome property
        window.chrome = {
          runtime: {}
        };
      });

      // Set extra headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      });

      // Enable request interception for blocking resources
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();

        // Block unnecessary resources to speed up page load
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });

      logger.info('Created stealth page');
      return page;

    } catch (error) {
      logger.error('Failed to create stealth page', { error: error.message });
      throw error;
    }
  }

  /**
   * Navigate to URL with retry logic
   */
  async navigateWithRetry(page, url, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const timeout = options.timeout || 30000;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Navigating to ${url} (attempt ${attempt}/${maxRetries})`);

        await page.goto(url, {
          timeout,
          waitUntil: options.waitUntil || 'networkidle2'
        });

        // Random delay to mimic human behavior
        await this.randomDelay(1000, 3000);

        return true;

      } catch (error) {
        lastError = error;
        logger.warn(`Navigation failed (attempt ${attempt}/${maxRetries})`, {
          url,
          error: error.message
        });

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Failed to navigate to ${url} after ${maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(page, name) {
    try {
      const screenshotPath = `/tmp/screenshot_${name}_${Date.now()}.png`;
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      logger.info('Screenshot saved', { path: screenshotPath });
      return screenshotPath;
    } catch (error) {
      logger.error('Failed to take screenshot', { error: error.message });
      return null;
    }
  }

  /**
   * Random delay to mimic human behavior
   */
  async randomDelay(min = 500, max = 2000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.sleep(delay);
  }

  /**
   * Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Return browser to pool
   */
  async releaseBrowser(browser) {
    try {
      if (!browser || !browser.isConnected()) {
        this.activeBrowsers = Math.max(0, this.activeBrowsers - 1);
        return;
      }

      // Close all pages except one
      const pages = await browser.pages();
      for (let i = 1; i < pages.length; i++) {
        await pages[i].close();
      }

      // Add back to pool if under limit
      if (this.browserPool.length < this.maxBrowsers) {
        this.browserPool.push(browser);
        logger.info('Browser returned to pool', {
          poolSize: this.browserPool.length,
          activeBrowsers: this.activeBrowsers
        });
      } else {
        await browser.close();
        logger.info('Browser closed (pool full)');
      }

      this.activeBrowsers = Math.max(0, this.activeBrowsers - 1);

    } catch (error) {
      logger.error('Failed to release browser', { error: error.message });
      this.activeBrowsers = Math.max(0, this.activeBrowsers - 1);
    }
  }

  /**
   * Wait for available browser
   */
  async waitForAvailableBrowser(timeout = 60000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (this.activeBrowsers < this.maxBrowsers || this.browserPool.length > 0) {
        return;
      }
      await this.sleep(1000);
    }

    throw new Error('Timeout waiting for available browser');
  }

  /**
   * Close all browsers in pool
   */
  async closeAll() {
    logger.info('Closing all browsers in pool');

    const closePromises = this.browserPool.map(browser =>
      browser.close().catch(err =>
        logger.error('Failed to close browser', { error: err.message })
      )
    );

    await Promise.all(closePromises);

    this.browserPool = [];
    this.activeBrowsers = 0;

    logger.info('All browsers closed');
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      poolSize: this.browserPool.length,
      activeBrowsers: this.activeBrowsers,
      maxBrowsers: this.maxBrowsers
    };
  }
}

// Singleton instance
const puppeteerService = new PuppeteerService();

// Cleanup on process exit
process.on('SIGINT', async () => {
  await puppeteerService.closeAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await puppeteerService.closeAll();
  process.exit(0);
});

module.exports = puppeteerService;
