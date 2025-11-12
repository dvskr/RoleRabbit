/**
 * LinkedIn Easy Apply Automation Service
 * Handles LinkedIn authentication and Easy Apply automation
 */

const puppeteerService = require('../browserAutomation/puppeteerService');
const sessionManager = require('../browserAutomation/sessionManager');
const formFiller = require('../browserAutomation/formFiller');
const logger = require('../../utils/logger');
const prisma = require('../../utils/prisma');
const crypto = require('crypto');

// Encryption configuration (same as jobBoard routes)
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.JOB_BOARD_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

class LinkedInService {
  constructor() {
    this.baseUrl = 'https://www.linkedin.com';
    this.loginUrl = 'https://www.linkedin.com/login';

    // Selectors for LinkedIn elements
    this.selectors = {
      // Login page
      emailInput: '#username',
      passwordInput: '#password',
      loginButton: 'button[type="submit"]',

      // Job page
      easyApplyButton: '.jobs-apply-button, button[aria-label*="Easy Apply"], button:has-text("Easy Apply")',
      applyButton: 'button:has-text("Apply")',

      // Easy Apply modal
      modalContainer: '.jobs-easy-apply-modal, [role="dialog"]',
      nextButton: 'button[aria-label="Continue to next step"], button:has-text("Next")',
      reviewButton: 'button[aria-label="Review your application"], button:has-text("Review")',
      submitButton: 'button[aria-label="Submit application"], button:has-text("Submit application")',

      // Form fields
      phoneInput: 'input[type="tel"], input[name*="phone"], input[id*="phone"]',
      resumeUpload: 'input[type="file"][name*="resume"], input[type="file"][id*="resume"]',

      // Success confirmation
      successMessage: '.artdeco-inline-feedback--success, [data-test-modal-id="success-modal"]',
      confirmationText: 'text=/Application sent|Successfully applied/',

      // Error messages
      errorMessage: '.artdeco-inline-feedback--error',

      // Session check
      feedPage: '[aria-label="Main Feed"]',
      profileButton: '#global-nav-icon'
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
   * Login to LinkedIn
   */
  async login(page, credential) {
    try {
      logger.info('Logging into LinkedIn', { email: credential.email });

      // Decrypt password
      const decrypted = this.decryptCredentials(
        credential.encryptedData,
        credential.iv,
        credential.authTag
      );

      // Navigate to login page
      await puppeteerService.navigateWithRetry(page, this.loginUrl);

      // Wait for login form
      await page.waitForSelector(this.selectors.emailInput, { timeout: 10000 });

      // Fill credentials
      await page.type(this.selectors.emailInput, credential.email, { delay: 100 });
      await puppeteerService.randomDelay(500, 1000);

      await page.type(this.selectors.passwordInput, decrypted.password, { delay: 100 });
      await puppeteerService.randomDelay(500, 1000);

      // Click login button
      await page.click(this.selectors.loginButton);

      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

      // Check if login was successful
      const isLoggedIn = await this.isAuthenticated(page);

      if (!isLoggedIn) {
        // Check for error messages
        const errorMsg = await page.evaluate(() => {
          const error = document.querySelector('.alert-content, .form__label--error');
          return error ? error.textContent.trim() : null;
        });

        throw new Error(errorMsg || 'Login failed - credentials may be incorrect');
      }

      logger.info('LinkedIn login successful', { email: credential.email });

      // Save session
      await sessionManager.extractAndSaveCookies(
        page,
        credential.userId,
        'LINKEDIN',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      );

      return true;

    } catch (error) {
      logger.error('LinkedIn login failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if already authenticated
   */
  async isAuthenticated(page) {
    try {
      // Check for profile button or feed
      const authenticated = await page.evaluate((selectors) => {
        return !!(
          document.querySelector(selectors.profileButton) ||
          document.querySelector(selectors.feedPage)
        );
      }, this.selectors);

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
      await page.waitForSelector('h1, .jobs-unified-top-card__job-title', { timeout: 10000 });

      logger.info('Job page loaded');
      return true;

    } catch (error) {
      logger.error('Failed to navigate to job', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if Easy Apply is available
   */
  async hasEasyApply(page) {
    try {
      const hasButton = await page.evaluate((selector) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn => {
          const text = btn.textContent.toLowerCase();
          const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
          return text.includes('easy apply') || ariaLabel.includes('easy apply');
        });
      }, this.selectors.easyApplyButton);

      return hasButton;

    } catch (error) {
      logger.warn('Error checking Easy Apply availability', { error: error.message });
      return false;
    }
  }

  /**
   * Click Easy Apply button
   */
  async clickEasyApply(page) {
    try {
      logger.info('Clicking Easy Apply button');

      // Find and click the Easy Apply button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const easyApplyBtn = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
          return text.includes('easy apply') || ariaLabel.includes('easy apply');
        });

        if (easyApplyBtn) {
          easyApplyBtn.click();
          return true;
        }
        throw new Error('Easy Apply button not found');
      });

      // Wait for modal to appear
      await page.waitForSelector(this.selectors.modalContainer, { timeout: 10000 });
      await puppeteerService.randomDelay(1000, 2000);

      logger.info('Easy Apply modal opened');
      return true;

    } catch (error) {
      logger.error('Failed to click Easy Apply', { error: error.message });
      throw error;
    }
  }

  /**
   * Fill Easy Apply form
   */
  async fillEasyApplyForm(page, userData) {
    try {
      logger.info('Filling Easy Apply form');

      // Detect form fields
      const fields = await formFiller.detectFormFields(page);
      logger.info('Detected fields in Easy Apply modal', { count: fields.length });

      // Fill the form
      const result = await formFiller.fillForm(page, userData);

      logger.info('Easy Apply form filled', {
        filled: result.filled,
        total: result.total
      });

      return result;

    } catch (error) {
      logger.error('Failed to fill Easy Apply form', { error: error.message });
      throw error;
    }
  }

  /**
   * Upload resume if required
   */
  async uploadResume(page, resumePath) {
    try {
      // Check if resume upload is present
      const uploadInput = await page.$(this.selectors.resumeUpload);

      if (uploadInput && resumePath) {
        logger.info('Uploading resume', { path: resumePath });
        await uploadInput.uploadFile(resumePath);
        await puppeteerService.randomDelay(2000, 3000);
        logger.info('Resume uploaded successfully');
        return true;
      }

      return false;

    } catch (error) {
      logger.warn('Resume upload failed', { error: error.message });
      return false;
    }
  }

  /**
   * Navigate through multi-step Easy Apply process
   */
  async navigateEasyApplySteps(page, userData, resumePath) {
    try {
      let currentStep = 1;
      const maxSteps = 10; // Safety limit
      let applicationSubmitted = false;

      while (currentStep <= maxSteps) {
        logger.info(`Processing Easy Apply step ${currentStep}`);

        // Fill current step's form
        await this.fillEasyApplyForm(page, userData);
        await puppeteerService.randomDelay(1000, 2000);

        // Upload resume if input is present
        await this.uploadResume(page, resumePath);

        // Check what buttons are available
        const buttons = await page.evaluate(() => {
          const allButtons = Array.from(document.querySelectorAll('button'));
          return allButtons.map(btn => ({
            text: btn.textContent.trim(),
            ariaLabel: btn.getAttribute('aria-label') || '',
            disabled: btn.disabled,
            className: btn.className
          }));
        });

        logger.debug('Available buttons', { buttons });

        // Try to find and click appropriate button
        let buttonClicked = false;

        // Check for Submit button (final step)
        const hasSubmit = buttons.some(btn =>
          btn.text.toLowerCase().includes('submit') ||
          btn.ariaLabel.toLowerCase().includes('submit')
        );

        if (hasSubmit) {
          logger.info('Found Submit button - final step');

          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const submitBtn = buttons.find(btn =>
              btn.textContent.toLowerCase().includes('submit') ||
              btn.getAttribute('aria-label')?.toLowerCase().includes('submit')
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
          btn.text.toLowerCase().includes('review') ||
          btn.ariaLabel.toLowerCase().includes('review')
        );

        if (hasReview) {
          logger.info('Found Review button');

          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const reviewBtn = buttons.find(btn =>
              btn.textContent.toLowerCase().includes('review') ||
              btn.getAttribute('aria-label')?.toLowerCase().includes('review')
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

        // Check for Next/Continue button
        const hasNext = buttons.some(btn =>
          btn.text.toLowerCase().includes('next') ||
          btn.text.toLowerCase().includes('continue') ||
          btn.ariaLabel.toLowerCase().includes('next') ||
          btn.ariaLabel.toLowerCase().includes('continue')
        );

        if (hasNext) {
          logger.info('Found Next/Continue button');

          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const nextBtn = buttons.find(btn =>
              btn.textContent.toLowerCase().includes('next') ||
              btn.textContent.toLowerCase().includes('continue') ||
              btn.getAttribute('aria-label')?.toLowerCase().includes('next') ||
              btn.getAttribute('aria-label')?.toLowerCase().includes('continue')
            );
            if (nextBtn && !nextBtn.disabled) {
              nextBtn.click();
            }
          });

          buttonClicked = true;
          await puppeteerService.randomDelay(1500, 2500);
          currentStep++;
          continue;
        }

        // If no button was clicked, we might be stuck
        if (!buttonClicked) {
          logger.warn('No actionable button found', { step: currentStep });
          break;
        }
      }

      return { success: applicationSubmitted, steps: currentStep };

    } catch (error) {
      logger.error('Error navigating Easy Apply steps', { error: error.message });
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
        // Check for various success indicators
        const successElements = document.querySelectorAll(
          '.artdeco-inline-feedback--success, ' +
          '[data-test-modal-id="success-modal"], ' +
          '.jobs-easy-apply-success'
        );

        if (successElements.length > 0) return true;

        // Check text content
        const bodyText = document.body.textContent.toLowerCase();
        return bodyText.includes('application sent') ||
               bodyText.includes('successfully applied') ||
               bodyText.includes('application submitted');
      });

      if (success) {
        logger.info('Application submission verified');
        return true;
      }

      // Check for error messages
      const error = await page.evaluate(() => {
        const errorEl = document.querySelector('.artdeco-inline-feedback--error');
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
   * Apply to job using Easy Apply
   */
  async applyToJob(userId, credentialId, jobUrl, options = {}) {
    let browser = null;
    let page = null;

    try {
      logger.info('Starting LinkedIn Easy Apply', { userId, jobUrl });

      // Get credential
      const credential = await prisma.jobBoardCredential.findFirst({
        where: {
          id: credentialId,
          userId,
          platform: 'LINKEDIN',
          isActive: true
        }
      });

      if (!credential) {
        throw new Error('LinkedIn credential not found');
      }

      // Get browser and create page
      browser = await puppeteerService.getBrowser();
      page = await puppeteerService.createStealthPage(browser);

      // Try to restore session
      const hasSession = await sessionManager.isAuthenticated(userId, 'LINKEDIN');

      if (hasSession) {
        logger.info('Restoring LinkedIn session');
        await sessionManager.applyCookiesToPage(page, userId, 'LINKEDIN');
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

      // Check if Easy Apply is available
      const hasEasyApply = await this.hasEasyApply(page);

      if (!hasEasyApply) {
        throw new Error('Easy Apply not available for this job');
      }

      // Click Easy Apply button
      await this.clickEasyApply(page);

      // Prepare user data for form filling
      const userData = {
        firstName: options.firstName,
        lastName: options.lastName,
        email: options.email || credential.email,
        phone: options.phone,
        address: options.address,
        city: options.city,
        state: options.state,
        zipCode: options.zipCode,
        linkedin: options.linkedin,
        github: options.github,
        portfolio: options.portfolio,
        yearsOfExperience: options.yearsOfExperience,
        currentCompany: options.currentCompany,
        currentTitle: options.currentTitle,
        resumeFile: options.resumePath
      };

      // Navigate through Easy Apply steps
      const result = await this.navigateEasyApplySteps(
        page,
        userData,
        options.resumePath
      );

      if (!result.success) {
        throw new Error('Failed to complete Easy Apply process');
      }

      // Verify submission
      const verified = await this.verifySubmission(page);

      // Take screenshot for debugging
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

      logger.info('LinkedIn Easy Apply completed', {
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
      logger.error('LinkedIn Easy Apply failed', {
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

module.exports = new LinkedInService();
