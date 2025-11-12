/**
 * Indeed Quick Apply Automation Service
 * Handles Indeed authentication and Quick Apply automation
 */

const puppeteerService = require('../browserAutomation/puppeteerService');
const sessionManager = require('../browserAutomation/sessionManager');
const formFiller = require('../browserAutomation/formFiller');
const logger = require('../../utils/logger');
const { prisma } = require('../../utils/db');
const crypto = require('crypto');

// Encryption configuration (same as jobBoard routes)
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.JOB_BOARD_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

class IndeedService {
  constructor() {
    this.baseUrl = 'https://www.indeed.com';
    this.loginUrl = 'https://secure.indeed.com/account/login';

    // Selectors for Indeed elements
    this.selectors = {
      // Login page
      emailInput: '#ifl-InputFormField-3, input[name="__email"], input[type="email"]',
      passwordInput: '#ifl-InputFormField-6, input[name="__password"], input[type="password"]',
      continueButton: 'button[type="submit"], button:has-text("Continue")',
      loginButton: 'button[type="submit"], button:has-text("Sign in")',

      // Job page
      applyButton: '.jobsearch-IndeedApplyButton, button:has-text("Apply now"), button:has-text("Easily apply")',
      indeedApplyButton: '.indeed-apply-button, [data-indeed-apply-button]',

      // Application modal
      modalContainer: '.indeed-apply-popup, [role="dialog"], .ia-BasePage',
      continueButton: 'button:has-text("Continue"), button[type="submit"]',
      submitButton: 'button:has-text("Submit your application"), button:has-text("Submit application")',
      reviewButton: 'button:has-text("Review")',

      // Form fields
      nameInput: 'input[name*="name"], input[id*="name"]',
      emailField: 'input[type="email"], input[name*="email"]',
      phoneInput: 'input[type="tel"], input[name*="phone"]',
      resumeUpload: 'input[type="file"][name*="resume"], input[type="file"]',

      // Resume selection
      resumeRadio: 'input[type="radio"][name*="resume"]',
      uploadResumeButton: 'button:has-text("Upload resume"), label:has-text("Upload")',

      // Success confirmation
      successMessage: '.ia-SuccessPage, .jobsearch-ConfirmationPage',
      confirmationText: 'text=/Application sent|Successfully applied|application submitted/i',

      // Error messages
      errorMessage: '.error, .ia-ErrorPage',

      // Session check
      accountButton: '#gnav-header-menu-button, [data-gnav-element-name="SignIn"]',
      userMenu: '#account-menu'
    };
  }

  /**
   * Decrypt credentials
   */
  decryptCredentials(encryptedData, iv, authTag) {
    try {
      const decipher = crypto.createDecipheriv(
        ALGORITHM,
        Buffer.from(ENCRYPTION_KEY, 'hex'),
        Buffer.from(iv, 'hex')
      );

      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Decryption failed', { error: error.message });
      throw new Error('Failed to decrypt credentials');
    }
  }

  /**
   * Login to Indeed
   */
  async login(page, credential) {
    try {
      logger.info('Logging into Indeed', { email: credential.email });

      // Decrypt password
      const decrypted = this.decryptCredentials(
        credential.encryptedData,
        credential.iv,
        credential.authTag
      );

      // Navigate to login page
      await puppeteerService.navigateWithRetry(page, this.loginUrl);

      // Wait for login form
      await page.waitForSelector('input[type="email"], input[name="__email"]', { timeout: 10000 });
      await puppeteerService.randomDelay(1000, 2000);

      // Fill email
      const emailInput = await page.$('input[type="email"], input[name="__email"]');
      if (emailInput) {
        await emailInput.type(credential.email, { delay: 100 });
        await puppeteerService.randomDelay(500, 1000);

        // Click continue if it's a two-step login
        const continueBtn = await page.$('button:has-text("Continue")');
        if (continueBtn) {
          await continueBtn.click();
          await page.waitForTimeout(2000);
        }
      }

      // Fill password
      await page.waitForSelector('input[type="password"], input[name="__password"]', { timeout: 10000 });
      const passwordInput = await page.$('input[type="password"], input[name="__password"]');
      if (passwordInput) {
        await passwordInput.type(decrypted.password, { delay: 100 });
        await puppeteerService.randomDelay(500, 1000);
      }

      // Click login button
      const loginBtn = await page.$('button[type="submit"]');
      if (loginBtn) {
        await loginBtn.click();
      }

      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await puppeteerService.randomDelay(2000, 3000);

      // Check if login was successful
      const isLoggedIn = await this.isAuthenticated(page);

      if (!isLoggedIn) {
        // Check for error messages
        const errorMsg = await page.evaluate(() => {
          const error = document.querySelector('.error, .alert');
          return error ? error.textContent.trim() : null;
        });

        throw new Error(errorMsg || 'Login failed - credentials may be incorrect');
      }

      logger.info('Indeed login successful', { email: credential.email });

      // Save session
      await sessionManager.extractAndSaveCookies(
        page,
        credential.userId,
        'INDEED',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      );

      return true;

    } catch (error) {
      logger.error('Indeed login failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if already authenticated
   */
  async isAuthenticated(page) {
    try {
      // Check for account menu or sign-in button text
      const authenticated = await page.evaluate(() => {
        // If we see "Sign in", we're not logged in
        const signInButton = document.querySelector('[data-gnav-element-name="SignIn"]');
        if (signInButton && signInButton.textContent.toLowerCase().includes('sign in')) {
          return false;
        }

        // If we see account menu, we're logged in
        const accountMenu = document.querySelector('#gnav-header-menu-button, #account-menu');
        return !!accountMenu;
      });

      return authenticated;
    } catch (error) {
      return false;
    }
  }

  /**
   * Navigate to job posting
   */
  async navigateToJob(page, jobUrl) {
    try {
      logger.info('Navigating to job', { url: jobUrl });

      await puppeteerService.navigateWithRetry(page, jobUrl);

      // Wait for page to load
      await page.waitForSelector('h1, .jobsearch-JobInfoHeader-title', { timeout: 10000 });
      await puppeteerService.randomDelay(1000, 2000);

      logger.info('Job page loaded');
      return true;

    } catch (error) {
      logger.error('Failed to navigate to job', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if Quick Apply is available
   */
  async hasQuickApply(page) {
    try {
      const hasButton = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        return buttons.some(btn => {
          const text = btn.textContent.toLowerCase();
          const className = btn.className.toLowerCase();
          return text.includes('apply now') ||
                 text.includes('easily apply') ||
                 className.includes('indeed-apply') ||
                 className.includes('indeedapply');
        });
      });

      return hasButton;

    } catch (error) {
      logger.warn('Error checking Quick Apply availability', { error: error.message });
      return false;
    }
  }

  /**
   * Click Apply button
   */
  async clickApply(page) {
    try {
      logger.info('Clicking Apply button');

      // Scroll to make button visible
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const applyBtn = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('apply now') || text.includes('easily apply');
        });

        if (applyBtn) {
          applyBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      await puppeteerService.randomDelay(1000, 2000);

      // Find and click the Apply button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const applyBtn = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          const className = btn.className.toLowerCase();
          return text.includes('apply now') ||
                 text.includes('easily apply') ||
                 className.includes('indeed-apply');
        });

        if (applyBtn) {
          applyBtn.click();
          return true;
        }
        throw new Error('Apply button not found');
      });

      // Wait for modal or new page
      await puppeteerService.randomDelay(2000, 3000);

      logger.info('Apply button clicked');
      return true;

    } catch (error) {
      logger.error('Failed to click Apply button', { error: error.message });
      throw error;
    }
  }

  /**
   * Select or upload resume
   */
  async handleResume(page, resumePath) {
    try {
      logger.info('Handling resume upload/selection');

      // Check if there are existing resumes to select
      const hasExistingResume = await page.evaluate(() => {
        const radios = document.querySelectorAll('input[type="radio"][name*="resume"]');
        return radios.length > 0;
      });

      if (hasExistingResume && !resumePath) {
        logger.info('Selecting existing resume');

        // Select first resume
        await page.evaluate(() => {
          const radios = document.querySelectorAll('input[type="radio"][name*="resume"]');
          if (radios.length > 0) {
            radios[0].click();
          }
        });

        await puppeteerService.randomDelay(500, 1000);
        return true;
      }

      // Upload new resume if path provided
      if (resumePath) {
        logger.info('Uploading resume', { path: resumePath });

        // Look for file input
        const fileInput = await page.$('input[type="file"]');

        if (fileInput) {
          await fileInput.uploadFile(resumePath);
          await puppeteerService.randomDelay(2000, 3000);
          logger.info('Resume uploaded successfully');
          return true;
        }

        // Look for upload button/link
        const uploadButton = await page.$('button:has-text("Upload"), a:has-text("Upload")');
        if (uploadButton) {
          await uploadButton.click();
          await puppeteerService.randomDelay(1000, 2000);

          const fileInput = await page.$('input[type="file"]');
          if (fileInput) {
            await fileInput.uploadFile(resumePath);
            await puppeteerService.randomDelay(2000, 3000);
            logger.info('Resume uploaded successfully');
            return true;
          }
        }
      }

      logger.info('Resume handling completed');
      return true;

    } catch (error) {
      logger.warn('Resume handling failed', { error: error.message });
      return false;
    }
  }

  /**
   * Fill application form
   */
  async fillApplicationForm(page, userData) {
    try {
      logger.info('Filling application form');

      // Detect and fill form fields
      const result = await formFiller.fillForm(page, userData);

      logger.info('Application form filled', {
        filled: result.filled,
        total: result.total
      });

      return result;

    } catch (error) {
      logger.error('Failed to fill application form', { error: error.message });
      throw error;
    }
  }

  /**
   * Navigate through application steps
   */
  async navigateApplicationSteps(page, userData, resumePath) {
    try {
      let currentStep = 1;
      const maxSteps = 8; // Safety limit
      let applicationSubmitted = false;

      while (currentStep <= maxSteps) {
        logger.info(`Processing application step ${currentStep}`);

        // Handle resume upload/selection
        await this.handleResume(page, resumePath);
        await puppeteerService.randomDelay(1000, 2000);

        // Fill form fields
        await this.fillApplicationForm(page, userData);
        await puppeteerService.randomDelay(1000, 2000);

        // Check available buttons
        const buttons = await page.evaluate(() => {
          const allButtons = Array.from(document.querySelectorAll('button'));
          return allButtons.map(btn => ({
            text: btn.textContent.trim(),
            disabled: btn.disabled,
            type: btn.type
          }));
        });

        logger.debug('Available buttons', { buttons });

        let buttonClicked = false;

        // Check for Submit button (final step)
        const hasSubmit = buttons.some(btn =>
          btn.text.toLowerCase().includes('submit') &&
          btn.text.toLowerCase().includes('application')
        );

        if (hasSubmit) {
          logger.info('Found Submit button - final step');

          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const submitBtn = buttons.find(btn =>
              btn.textContent.toLowerCase().includes('submit') &&
              btn.textContent.toLowerCase().includes('application')
            );
            if (submitBtn && !submitBtn.disabled) {
              submitBtn.click();
            }
          });

          buttonClicked = true;
          applicationSubmitted = true;
          await puppeteerService.randomDelay(2000, 3000);
          break;
        }

        // Check for Review button
        const hasReview = buttons.some(btn =>
          btn.text.toLowerCase().includes('review')
        );

        if (hasReview) {
          logger.info('Found Review button');

          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const reviewBtn = buttons.find(btn =>
              btn.textContent.toLowerCase().includes('review')
            );
            if (reviewBtn && !reviewBtn.disabled) {
              reviewBtn.click();
            }
          });

          buttonClicked = true;
          await puppeteerService.randomDelay(1500, 2500);
          currentStep++;
          continue;
        }

        // Check for Continue/Next button
        const hasContinue = buttons.some(btn =>
          btn.text.toLowerCase().includes('continue') ||
          btn.text.toLowerCase().includes('next') ||
          btn.type === 'submit'
        );

        if (hasContinue) {
          logger.info('Found Continue/Next button');

          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const continueBtn = buttons.find(btn =>
              btn.textContent.toLowerCase().includes('continue') ||
              btn.textContent.toLowerCase().includes('next') ||
              (btn.type === 'submit' && !btn.disabled)
            );
            if (continueBtn && !continueBtn.disabled) {
              continueBtn.click();
            }
          });

          buttonClicked = true;
          await puppeteerService.randomDelay(1500, 2500);
          currentStep++;
          continue;
        }

        // If no button was clicked, we might be stuck or done
        if (!buttonClicked) {
          logger.warn('No actionable button found', { step: currentStep });
          break;
        }
      }

      return { success: applicationSubmitted, steps: currentStep };

    } catch (error) {
      logger.error('Error navigating application steps', { error: error.message });
      throw error;
    }
  }

  /**
   * Verify application was submitted
   */
  async verifySubmission(page) {
    try {
      // Wait a bit for confirmation
      await puppeteerService.randomDelay(2000, 3000);

      // Check for success message
      const success = await page.evaluate(() => {
        // Check for success page
        if (document.querySelector('.ia-SuccessPage, .jobsearch-ConfirmationPage')) {
          return true;
        }

        // Check text content
        const bodyText = document.body.textContent.toLowerCase();
        return bodyText.includes('application sent') ||
               bodyText.includes('successfully applied') ||
               bodyText.includes('application submitted') ||
               bodyText.includes('application received');
      });

      if (success) {
        logger.info('Application submission verified');
        return true;
      }

      // Check for error messages
      const error = await page.evaluate(() => {
        const errorEl = document.querySelector('.error, .ia-ErrorPage');
        return errorEl ? errorEl.textContent.trim() : null;
      });

      if (error) {
        logger.error('Application submission failed', { error });
        return false;
      }

      // If no clear success or error, assume success
      logger.info('No clear confirmation, assuming success');
      return true;

    } catch (error) {
      logger.error('Error verifying submission', { error: error.message });
      return false;
    }
  }

  /**
   * Apply to job using Indeed
   */
  async applyToJob(userId, credentialId, jobUrl, options = {}) {
    let browser = null;
    let page = null;

    try {
      logger.info('Starting Indeed application', { userId, jobUrl });

      // Get credential
      const credential = await prisma.jobBoardCredential.findFirst({
        where: {
          id: credentialId,
          userId,
          platform: 'INDEED',
          isActive: true
        }
      });

      if (!credential) {
        throw new Error('Indeed credential not found');
      }

      // Get browser and create page
      browser = await puppeteerService.getBrowser();
      page = await puppeteerService.createStealthPage(browser);

      // Try to restore session
      const hasSession = await sessionManager.isAuthenticated(userId, 'INDEED');

      if (hasSession) {
        logger.info('Restoring Indeed session');
        await sessionManager.applyCookiesToPage(page, userId, 'INDEED');
        await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });

        const stillAuthenticated = await this.isAuthenticated(page);
        if (!stillAuthenticated) {
          logger.info('Session expired, logging in again');
          await this.login(page, credential);
        }
      } else {
        // Fresh login
        await this.login(page, credential);
      }

      // Navigate to job
      await this.navigateToJob(page, jobUrl);

      // Check if Quick Apply is available
      const hasQuickApply = await this.hasQuickApply(page);

      if (!hasQuickApply) {
        throw new Error('Quick Apply not available for this job');
      }

      // Click Apply button
      await this.clickApply(page);

      // Prepare user data
      const userData = {
        firstName: options.firstName,
        lastName: options.lastName,
        email: options.email || credential.email,
        phone: options.phone,
        address: options.address,
        city: options.city,
        state: options.state,
        zipCode: options.zipCode,
        yearsOfExperience: options.yearsOfExperience,
        currentCompany: options.currentCompany,
        currentTitle: options.currentTitle
      };

      // Navigate through application steps
      const result = await this.navigateApplicationSteps(
        page,
        userData,
        options.resumePath
      );

      if (!result.success) {
        throw new Error('Failed to complete application process');
      }

      // Verify submission
      const verified = await this.verifySubmission(page);

      // Take screenshot if requested
      if (options.screenshotPath) {
        await puppeteerService.takeScreenshot(page, options.screenshotPath);
      }

      // Update credential status
      await prisma.jobBoardCredential.update({
        where: { id: credentialId },
        data: {
          isConnected: true,
          lastConnectedAt: new Date(),
          verificationStatus: 'verified',
          lastVerified: new Date()
        }
      });

      logger.info('Indeed application completed', {
        userId,
        jobUrl,
        verified,
        steps: result.steps
      });

      return {
        success: true,
        verified,
        steps: result.steps,
        message: 'Application submitted successfully'
      };

    } catch (error) {
      logger.error('Indeed application failed', {
        userId,
        jobUrl,
        error: error.message
      });

      // Update credential if login failed
      if (error.message.includes('Login failed') || error.message.includes('credentials')) {
        await prisma.jobBoardCredential.update({
          where: { id: credentialId },
          data: {
            connectionError: error.message,
            verificationStatus: 'failed'
          }
        });
      }

      throw error;

    } finally {
      // Cleanup
      if (page) {
        await page.close();
      }
      if (browser) {
        await puppeteerService.releaseBrowser(browser);
      }
    }
  }
}

module.exports = new IndeedService();
