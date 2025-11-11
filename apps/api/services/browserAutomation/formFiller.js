/**
 * Form Filler Service
 * Intelligently fills job application forms with user data
 */

const logger = require('../../utils/logger');

class FormFiller {
  constructor() {
    // Common field patterns for detection
    this.fieldPatterns = {
      firstName: ['first.*name', 'fname', 'given.*name', 'forename'],
      lastName: ['last.*name', 'lname', 'surname', 'family.*name'],
      fullName: ['full.*name', '^name$', 'applicant.*name'],
      email: ['e.*mail', 'email.*address', 'contact.*email'],
      phone: ['phone', 'mobile', 'telephone', 'cell', 'contact.*number'],
      address: ['address', 'street', 'location.*address'],
      city: ['city', 'town'],
      state: ['state', 'province', 'region'],
      zipCode: ['zip', 'postal.*code', 'postcode'],
      country: ['country', 'nation'],
      linkedin: ['linkedin', 'linkedin.*url', 'linkedin.*profile'],
      github: ['github', 'github.*url', 'github.*profile'],
      portfolio: ['portfolio', 'website', 'personal.*site', 'web.*portfolio'],
      resume: ['resume', 'cv', 'curriculum.*vitae'],
      coverLetter: ['cover.*letter', 'motivation.*letter'],
      yearsOfExperience: ['years.*experience', 'experience.*years', 'total.*experience'],
      currentCompany: ['current.*company', 'employer', 'current.*employer'],
      currentTitle: ['current.*title', 'current.*position', 'current.*role'],
      desiredSalary: ['salary', 'compensation', 'expected.*salary', 'salary.*expectation'],
      startDate: ['start.*date', 'available.*date', 'availability', 'join.*date'],
      authorization: ['authorized.*work', 'work.*authorization', 'eligible.*work'],
      sponsorship: ['require.*sponsorship', 'visa.*sponsorship', 'need.*sponsor'],
      relocation: ['willing.*relocate', 'relocate', 'relocation'],
      referral: ['referral', 'referred.*by', 'how.*hear'],
      additionalInfo: ['additional.*info', 'comments', 'notes', 'other.*information']
    };

    // Common answers for yes/no questions
    this.commonAnswers = {
      authorization: 'Yes',
      sponsorship: 'No',
      relocation: 'Yes',
      backgroundCheck: 'Yes',
      drugTest: 'Yes',
      nda: 'Yes',
      ageVerification: 'Yes'
    };
  }

  /**
   * Fill form with user data
   */
  async fillForm(page, userData, options = {}) {
    try {
      logger.info('Starting form fill', { hasData: !!userData });

      // Wait for form to be ready
      await this.waitForForm(page);

      // Detect all form fields
      const fields = await this.detectFormFields(page);
      logger.info('Detected form fields', { count: fields.length });

      // Map user data to fields
      const fieldMappings = this.mapDataToFields(fields, userData);
      logger.info('Mapped data to fields', { mappings: fieldMappings.length });

      // Fill each field
      const results = [];
      for (const mapping of fieldMappings) {
        const result = await this.fillField(page, mapping);
        results.push(result);

        // Random delay between fields to mimic human behavior
        await this.randomDelay(100, 500);
      }

      // Handle file uploads separately
      if (userData.resumeFile) {
        await this.handleFileUpload(page, 'resume', userData.resumeFile);
      }

      if (userData.coverLetterFile) {
        await this.handleFileUpload(page, 'coverLetter', userData.coverLetterFile);
      }

      const successful = results.filter(r => r.success).length;
      logger.info('Form fill completed', {
        total: results.length,
        successful,
        failed: results.length - successful
      });

      return {
        success: true,
        filled: successful,
        total: results.length,
        results
      };

    } catch (error) {
      logger.error('Form fill failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Wait for form to be ready
   */
  async waitForForm(page, timeout = 5000) {
    try {
      await page.waitForSelector('form, input, textarea, select', { timeout });
      await page.evaluate(() => {
        return new Promise((resolve) => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', resolve);
          }
        });
      });
    } catch (error) {
      logger.warn('Form wait timeout', { error: error.message });
    }
  }

  /**
   * Detect all form fields on page
   */
  async detectFormFields(page) {
    const fields = await page.evaluate(() => {
      const extractFieldInfo = (element) => {
        const info = {
          selector: null,
          type: element.type || element.tagName.toLowerCase(),
          name: element.name || '',
          id: element.id || '',
          placeholder: element.placeholder || '',
          label: '',
          required: element.required || false,
          value: element.value || '',
          options: []
        };

        // Generate unique selector
        if (element.id) {
          info.selector = `#${element.id}`;
        } else if (element.name) {
          info.selector = `[name="${element.name}"]`;
        } else {
          // Generate CSS path
          const path = [];
          let current = element;
          while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            if (current.className) {
              selector += '.' + current.className.split(' ').join('.');
            }
            path.unshift(selector);
            current = current.parentElement;
          }
          info.selector = path.join(' > ');
        }

        // Find associated label
        if (element.id) {
          const label = document.querySelector(`label[for="${element.id}"]`);
          if (label) info.label = label.textContent.trim();
        }

        if (!info.label) {
          const parent = element.closest('label');
          if (parent) info.label = parent.textContent.trim();
        }

        if (!info.label) {
          const prevSibling = element.previousElementSibling;
          if (prevSibling && prevSibling.tagName === 'LABEL') {
            info.label = prevSibling.textContent.trim();
          }
        }

        // Extract options for select/radio
        if (element.tagName === 'SELECT') {
          info.options = Array.from(element.options).map(opt => ({
            value: opt.value,
            text: opt.textContent.trim()
          }));
        }

        return info;
      };

      const fields = [];

      // Text inputs
      const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], input:not([type])');
      textInputs.forEach(input => fields.push(extractFieldInfo(input)));

      // Textareas
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(textarea => fields.push(extractFieldInfo(textarea)));

      // Select dropdowns
      const selects = document.querySelectorAll('select');
      selects.forEach(select => fields.push(extractFieldInfo(select)));

      // Radio buttons
      const radios = document.querySelectorAll('input[type="radio"]');
      radios.forEach(radio => fields.push(extractFieldInfo(radio)));

      // Checkboxes
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => fields.push(extractFieldInfo(checkbox)));

      // File inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => fields.push(extractFieldInfo(input)));

      // Date inputs
      const dateInputs = document.querySelectorAll('input[type="date"]');
      dateInputs.forEach(input => fields.push(extractFieldInfo(input)));

      return fields;
    });

    return fields;
  }

  /**
   * Map user data to detected fields
   */
  mapDataToFields(fields, userData) {
    const mappings = [];

    for (const field of fields) {
      const fieldText = `${field.name} ${field.id} ${field.label} ${field.placeholder}`.toLowerCase();

      // Try to match field to data
      let value = null;
      let confidence = 0;

      // Check each pattern
      for (const [dataKey, patterns] of Object.entries(this.fieldPatterns)) {
        for (const pattern of patterns) {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(fieldText)) {
            value = this.getValueForKey(dataKey, userData);
            confidence = 0.8;
            break;
          }
        }
        if (value) break;
      }

      // Special handling for specific field types
      if (!value) {
        // Yes/No questions
        if (fieldText.includes('yes') || fieldText.includes('no')) {
          value = this.guessYesNoAnswer(fieldText);
          confidence = 0.6;
        }

        // Radio/checkbox groups
        if (field.type === 'radio' || field.type === 'checkbox') {
          value = this.guessSelectionAnswer(field, fieldText, userData);
          confidence = 0.5;
        }
      }

      if (value !== null) {
        mappings.push({
          field,
          value,
          confidence
        });
      }
    }

    return mappings;
  }

  /**
   * Get value for data key
   */
  getValueForKey(key, userData) {
    const mappings = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      city: userData.city,
      state: userData.state,
      zipCode: userData.zipCode,
      country: userData.country || 'United States',
      linkedin: userData.linkedin,
      github: userData.github,
      portfolio: userData.portfolio,
      yearsOfExperience: userData.yearsOfExperience,
      currentCompany: userData.currentCompany,
      currentTitle: userData.currentTitle,
      desiredSalary: userData.desiredSalary,
      startDate: userData.startDate || this.getDefaultStartDate(),
      authorization: 'Yes',
      sponsorship: 'No',
      relocation: userData.willingToRelocate ? 'Yes' : 'No'
    };

    return mappings[key] || null;
  }

  /**
   * Fill individual field
   */
  async fillField(page, mapping) {
    try {
      const { field, value } = mapping;

      // Skip if no value
      if (!value || value === '') {
        return { success: false, field: field.selector, reason: 'No value' };
      }

      // Wait for field to be visible
      await page.waitForSelector(field.selector, { timeout: 2000 });

      // Handle different field types
      switch (field.type) {
        case 'text':
        case 'email':
        case 'tel':
        case 'url':
        case 'input':
          await this.fillTextInput(page, field.selector, value);
          break;

        case 'textarea':
          await this.fillTextarea(page, field.selector, value);
          break;

        case 'select':
        case 'select-one':
        case 'select-multiple':
          await this.fillSelect(page, field.selector, value, field.options);
          break;

        case 'radio':
          await this.fillRadio(page, field.selector, value);
          break;

        case 'checkbox':
          await this.fillCheckbox(page, field.selector, value);
          break;

        case 'date':
          await this.fillDate(page, field.selector, value);
          break;

        default:
          logger.debug('Unknown field type', { type: field.type, selector: field.selector });
          return { success: false, field: field.selector, reason: 'Unknown type' };
      }

      logger.debug('Field filled successfully', { selector: field.selector, value: String(value).substring(0, 50) });
      return { success: true, field: field.selector, value };

    } catch (error) {
      logger.warn('Failed to fill field', {
        selector: mapping.field.selector,
        error: error.message
      });
      return { success: false, field: mapping.field.selector, error: error.message };
    }
  }

  /**
   * Fill text input
   */
  async fillTextInput(page, selector, value) {
    await page.click(selector, { clickCount: 3 }); // Select all
    await page.type(selector, String(value), { delay: 50 }); // Type with delay
  }

  /**
   * Fill textarea
   */
  async fillTextarea(page, selector, value) {
    await page.click(selector);
    await page.evaluate((sel, val) => {
      const element = document.querySelector(sel);
      if (element) element.value = val;
    }, selector, value);

    // Trigger input event
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, selector);
  }

  /**
   * Fill select dropdown
   */
  async fillSelect(page, selector, value, options = []) {
    // Try exact match first
    let matched = false;

    for (const option of options) {
      if (option.text.toLowerCase() === String(value).toLowerCase() ||
          option.value.toLowerCase() === String(value).toLowerCase()) {
        await page.select(selector, option.value);
        matched = true;
        break;
      }
    }

    // Try partial match
    if (!matched) {
      for (const option of options) {
        if (option.text.toLowerCase().includes(String(value).toLowerCase())) {
          await page.select(selector, option.value);
          matched = true;
          break;
        }
      }
    }

    // If still not matched, select first non-empty option
    if (!matched && options.length > 0) {
      const firstOption = options.find(opt => opt.value && opt.value !== '');
      if (firstOption) {
        await page.select(selector, firstOption.value);
      }
    }
  }

  /**
   * Fill radio button
   */
  async fillRadio(page, selector, value) {
    await page.click(selector);
  }

  /**
   * Fill checkbox
   */
  async fillCheckbox(page, selector, value) {
    const isChecked = await page.$eval(selector, el => el.checked);
    const shouldCheck = value === true || value === 'true' || value === 'Yes' || value === '1';

    if (shouldCheck && !isChecked) {
      await page.click(selector);
    } else if (!shouldCheck && isChecked) {
      await page.click(selector);
    }
  }

  /**
   * Fill date input
   */
  async fillDate(page, selector, value) {
    let dateString = value;

    // Convert to YYYY-MM-DD format if needed
    if (value instanceof Date) {
      dateString = value.toISOString().split('T')[0];
    } else if (typeof value === 'string') {
      try {
        const date = new Date(value);
        dateString = date.toISOString().split('T')[0];
      } catch (e) {
        // Use as-is if conversion fails
      }
    }

    await page.evaluate((sel, val) => {
      const element = document.querySelector(sel);
      if (element) {
        element.value = val;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, selector, dateString);
  }

  /**
   * Handle file upload
   */
  async handleFileUpload(page, fieldType, filePath) {
    try {
      // Find file input
      const patterns = this.fieldPatterns[fieldType];

      for (const pattern of patterns) {
        const selector = `input[type="file"][name*="${pattern}" i], input[type="file"][id*="${pattern}" i]`;

        try {
          const element = await page.$(selector);
          if (element) {
            await element.uploadFile(filePath);
            logger.info('File uploaded', { type: fieldType, path: filePath });
            return true;
          }
        } catch (e) {
          // Continue to next pattern
        }
      }

      // Try generic file input
      const fileInputs = await page.$$('input[type="file"]');
      if (fileInputs.length > 0) {
        await fileInputs[0].uploadFile(filePath);
        logger.info('File uploaded to generic input', { type: fieldType, path: filePath });
        return true;
      }

      logger.warn('No file input found', { type: fieldType });
      return false;

    } catch (error) {
      logger.error('File upload failed', { type: fieldType, error: error.message });
      return false;
    }
  }

  /**
   * Guess yes/no answer based on question text
   */
  guessYesNoAnswer(questionText) {
    // Check common patterns
    for (const [key, answer] of Object.entries(this.commonAnswers)) {
      if (questionText.includes(key)) {
        return answer;
      }
    }

    // Default safe answers
    if (questionText.includes('authorized') || questionText.includes('eligible')) {
      return 'Yes';
    }

    if (questionText.includes('require') || questionText.includes('need') && questionText.includes('sponsor')) {
      return 'No';
    }

    if (questionText.includes('willing') || questionText.includes('able')) {
      return 'Yes';
    }

    return 'Yes'; // Default to yes for most questions
  }

  /**
   * Guess selection answer for radio/checkbox
   */
  guessSelectionAnswer(field, fieldText, userData) {
    // This would need more sophisticated logic
    // For now, return null to skip unknown selections
    return null;
  }

  /**
   * Get default start date (2 weeks from now)
   */
  getDefaultStartDate() {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  }

  /**
   * Random delay to mimic human behavior
   */
  async randomDelay(min = 100, max = 500) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Validate filled form
   */
  async validateForm(page) {
    try {
      const validation = await page.evaluate(() => {
        const errors = [];
        const requiredFields = document.querySelectorAll('[required]');

        requiredFields.forEach(field => {
          if (!field.value || field.value.trim() === '') {
            errors.push({
              field: field.name || field.id || 'unknown',
              message: 'Required field is empty'
            });
          }
        });

        return {
          isValid: errors.length === 0,
          errors
        };
      });

      return validation;

    } catch (error) {
      logger.error('Form validation failed', { error: error.message });
      return { isValid: false, errors: [{ message: error.message }] };
    }
  }
}

module.exports = new FormFiller();
