/**
 * E2E tests for validation flows
 * Tests user interactions with validation system
 */

import { test, expect } from '@playwright/test';

// Helper to wait for the app to load
async function waitForAppLoad(page: any) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="dashboard"], .dashboard, #dashboard', { 
    state: 'visible', 
    timeout: 10000 
  }).catch(() => {
    // If specific selector not found, just wait for body
    return page.waitForSelector('body');
  });
}

test.describe('Validation - Required Fields', () => {
  test('should prevent save when required fields are empty', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    // Clear name field
    const nameInput = page.locator('input[placeholder*="Name"], input[aria-label*="name" i]').first();
    await nameInput.clear();

    // Try to save
    const saveButton = page.locator('button:has-text("Save"), button[aria-label*="save" i]').first();
    await saveButton.click();

    // Should show validation error
    await expect(page.locator('text=/Name is required/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show validation summary when multiple fields are invalid', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    // Clear required fields
    await page.locator('input[placeholder*="Name"]').first().clear();
    await page.locator('input[type="email"], input[placeholder*="Email"]').first().clear();
    await page.locator('input[type="tel"], input[placeholder*="Phone"]').first().clear();

    // Try to save
    await page.locator('button:has-text("Save")').first().click();

    // Should show validation summary
    await expect(page.locator('text=/You have.*error/i')).toBeVisible({ timeout: 5000 });
  });

  test('should allow clicking error in summary to jump to field', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    // Clear name field
    await page.locator('input[placeholder*="Name"]').first().clear();

    // Try to save
    await page.locator('button:has-text("Save")').first().click();

    // Click error in summary
    await page.locator('text=/Name is required/i').click();

    // Name field should be focused
    const nameInput = page.locator('input[placeholder*="Name"]').first();
    await expect(nameInput).toBeFocused();
  });
});

test.describe('Validation - Email Format', () => {
  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    // Enter invalid email
    const emailInput = page.locator('input[type="email"], input[placeholder*="Email"]').first();
    await emailInput.fill('invalid-email');
    await emailInput.blur();

    // Should show error
    await expect(page.locator('text=/valid email/i')).toBeVisible({ timeout: 3000 });
  });

  test('should accept valid email formats', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    const emailInput = page.locator('input[type="email"], input[placeholder*="Email"]').first();
    
    // Test various valid formats
    const validEmails = ['test@example.com', 'user.name@example.co.uk', 'user+tag@example.com'];
    
    for (const email of validEmails) {
      await emailInput.fill(email);
      await emailInput.blur();
      
      // Should not show error
      await expect(page.locator('text=/valid email/i')).not.toBeVisible();
    }
  });

  test('should clear error when user starts typing', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    const emailInput = page.locator('input[type="email"], input[placeholder*="Email"]').first();
    
    // Enter invalid email
    await emailInput.fill('invalid');
    await emailInput.blur();
    
    // Wait for error
    await expect(page.locator('text=/valid email/i')).toBeVisible();
    
    // Start typing again
    await emailInput.fill('test@example.com');
    
    // Error should clear
    await expect(page.locator('text=/valid email/i')).not.toBeVisible();
  });
});

test.describe('Validation - Phone Format', () => {
  test('should accept various phone formats', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="Phone"]').first();
    
    const validPhones = [
      '1234567890',
      '(123) 456-7890',
      '123-456-7890',
      '+1 123 456 7890',
    ];
    
    for (const phone of validPhones) {
      await phoneInput.fill(phone);
      await phoneInput.blur();
      
      // Should not show error
      await expect(page.locator('text=/valid phone/i')).not.toBeVisible();
    }
  });

  test('should reject invalid phone formats', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="Phone"]').first();
    
    await phoneInput.fill('123');
    await phoneInput.blur();
    
    await expect(page.locator('text=/valid phone/i')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Validation - URL Format', () => {
  test('should auto-normalize URLs', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    const websiteInput = page.locator('input[placeholder*="Website"], input[placeholder*="website"]').first();
    
    // Enter URL without protocol
    await websiteInput.fill('example.com');
    await websiteInput.blur();
    
    // Should auto-add https://
    await expect(websiteInput).toHaveValue('https://example.com');
  });

  test('should validate LinkedIn URL', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    const linkedinInput = page.locator('input[placeholder*="LinkedIn"], input[placeholder*="linkedin"]').first();
    
    // Valid LinkedIn URL
    await linkedinInput.fill('linkedin.com/in/username');
    await linkedinInput.blur();
    
    // Should not show error
    await expect(page.locator('text=/valid URL/i')).not.toBeVisible();
  });
});

test.describe('Validation - Duplicate Skills', () => {
  test('should prevent adding duplicate skills', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    // Navigate to skills section (may need to scroll or click tab)
    await page.locator('text=/Skills/i').scrollIntoViewIfNeeded();

    // Add a skill
    const skillInput = page.locator('input[placeholder*="skill" i]').last();
    await skillInput.fill('JavaScript');
    await skillInput.press('Enter');

    // Try to add same skill again
    await skillInput.fill('JavaScript');
    await skillInput.press('Enter');

    // Should show duplicate error
    await expect(page.locator('text=/already added/i')).toBeVisible({ timeout: 3000 });
  });

  test('should detect case-insensitive duplicates', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    await page.locator('text=/Skills/i').scrollIntoViewIfNeeded();

    const skillInput = page.locator('input[placeholder*="skill" i]').last();
    
    // Add skill in lowercase
    await skillInput.fill('javascript');
    await skillInput.press('Enter');

    // Try to add same skill in uppercase
    await skillInput.fill('JAVASCRIPT');
    await skillInput.press('Enter');

    // Should show duplicate error
    await expect(page.locator('text=/already added/i')).toBeVisible({ timeout: 3000 });
  });

  test('should auto-dismiss duplicate error after 3 seconds', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    await page.locator('text=/Skills/i').scrollIntoViewIfNeeded();

    const skillInput = page.locator('input[placeholder*="skill" i]').last();
    
    // Add skill
    await skillInput.fill('React');
    await skillInput.press('Enter');

    // Try duplicate
    await skillInput.fill('React');
    await skillInput.press('Enter');

    // Error should appear
    await expect(page.locator('text=/already added/i')).toBeVisible();

    // Wait 3 seconds
    await page.waitForTimeout(3500);

    // Error should disappear
    await expect(page.locator('text=/already added/i')).not.toBeVisible();
  });
});

test.describe('Validation - Duplicate Experience', () => {
  test('should warn about duplicate experience entries', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    // Navigate to experience section
    await page.locator('text=/Experience/i').scrollIntoViewIfNeeded();

    // Add first experience
    await page.locator('button:has-text("Add Experience"), button:has-text("Add")').first().click();
    await page.locator('input[placeholder*="Company"]').first().fill('Google');
    await page.locator('input[placeholder*="Title"], input[placeholder*="Job"]').first().fill('Engineer');
    await page.locator('input[placeholder*="Start"]').first().fill('Jan 2020');
    await page.locator('input[placeholder*="End"]').first().fill('Dec 2020');

    // Add duplicate experience
    await page.locator('button:has-text("Add Experience"), button:has-text("Add")').first().click();
    await page.locator('input[placeholder*="Company"]').last().fill('Google');
    await page.locator('input[placeholder*="Title"], input[placeholder*="Job"]').last().fill('Engineer');
    await page.locator('input[placeholder*="Start"]').last().fill('Jan 2020');
    await page.locator('input[placeholder*="End"]').last().fill('Dec 2020');

    // Should show duplicate warning
    await expect(page.locator('text=/duplicate/i')).toBeVisible({ timeout: 5000 });
  });

  test('should allow dismissing duplicate warning', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    await page.locator('text=/Experience/i').scrollIntoViewIfNeeded();

    // Add duplicate experiences (simplified)
    await page.locator('button:has-text("Add Experience")').first().click();
    await page.locator('input[placeholder*="Company"]').first().fill('Test Co');
    
    await page.locator('button:has-text("Add Experience")').first().click();
    await page.locator('input[placeholder*="Company"]').last().fill('Test Co');

    // Wait for warning
    const warning = page.locator('text=/duplicate/i').first();
    await expect(warning).toBeVisible({ timeout: 5000 });

    // Dismiss warning
    const dismissButton = page.locator('button[aria-label*="Dismiss"], button[title*="Dismiss"]').first();
    await dismissButton.click();

    // Warning should disappear
    await expect(warning).not.toBeVisible();
  });
});

test.describe('Validation - Custom Section Names', () => {
  test('should validate custom section name on input', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    // Open add section modal
    await page.locator('button:has-text("Add Section"), button[aria-label*="Add Section"]').first().click();

    const nameInput = page.locator('input[placeholder*="Languages"], input#add-section-name').first();

    // Try empty name
    await nameInput.fill('');
    await nameInput.blur();
    
    // Add button should be disabled
    const addButton = page.locator('button:has-text("Add Section")').last();
    await expect(addButton).toBeDisabled();
  });

  test('should show error for names with special characters', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    await page.locator('button:has-text("Add Section")').first().click();

    const nameInput = page.locator('input#add-section-name, input[placeholder*="Languages"]').first();
    
    // Enter name with special characters
    await nameInput.fill('Test<script>');
    
    // Should show error
    await expect(page.locator('text=/invalid character/i')).toBeVisible({ timeout: 3000 });
  });

  test('should show character counter', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    await page.locator('button:has-text("Add Section")').first().click();

    const nameInput = page.locator('input#add-section-name').first();
    
    // Type some text
    await nameInput.fill('Languages');
    
    // Should show character count
    await expect(page.locator('text=/9.*50.*character/i')).toBeVisible();
  });

  test('should prevent exceeding max length', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    await page.locator('button:has-text("Add Section")').first().click();

    const nameInput = page.locator('input#add-section-name').first();
    
    // Try to enter more than 50 characters
    const longName = 'a'.repeat(60);
    await nameInput.fill(longName);
    
    // Should be truncated to 50
    const value = await nameInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(50);
  });
});

test.describe('Validation - Max Length', () => {
  test('should show character counter when approaching limit', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    const nameInput = page.locator('input[placeholder*="Name"]').first();
    
    // Fill with text near limit
    await nameInput.fill('a'.repeat(85));
    
    // Should show character counter
    await expect(page.locator('text=/85.*100.*character/i')).toBeVisible({ timeout: 3000 });
  });

  test('should prevent input beyond max length', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    const nameInput = page.locator('input[placeholder*="Name"]').first();
    
    // Try to enter more than max length
    await nameInput.fill('a'.repeat(150));
    
    // Should be truncated
    const value = await nameInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(100);
  });
});

test.describe('Validation - Accessibility', () => {
  test('should have proper ARIA attributes on invalid fields', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    const emailInput = page.locator('input[type="email"]').first();
    
    // Enter invalid email
    await emailInput.fill('invalid');
    await emailInput.blur();
    
    // Wait for error
    await page.waitForTimeout(500);
    
    // Should have aria-invalid
    const ariaInvalid = await emailInput.getAttribute('aria-invalid');
    expect(ariaInvalid).toBe('true');
  });

  test('should have aria-required on required fields', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    const nameInput = page.locator('input[placeholder*="Name"]').first();
    const ariaRequired = await nameInput.getAttribute('aria-required');
    
    expect(ariaRequired).toBe('true');
  });

  test('should link error messages with aria-describedby', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    const emailInput = page.locator('input[type="email"]').first();
    
    // Enter invalid email
    await emailInput.fill('invalid');
    await emailInput.blur();
    
    // Wait for error
    await page.waitForTimeout(500);
    
    // Should have aria-describedby
    const ariaDescribedBy = await emailInput.getAttribute('aria-describedby');
    expect(ariaDescribedBy).toBeTruthy();
  });
});

test.describe('Validation - Real-Time Validation', () => {
  test('should validate on blur for contact fields', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    const emailInput = page.locator('input[type="email"]').first();
    
    // Enter invalid email
    await emailInput.fill('invalid');
    
    // Error should not show yet (before blur)
    await expect(page.locator('text=/valid email/i')).not.toBeVisible();
    
    // Blur field
    await emailInput.blur();
    
    // Error should appear
    await expect(page.locator('text=/valid email/i')).toBeVisible({ timeout: 1000 });
  });

  test('should debounce validation for custom section names', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    await page.locator('button:has-text("Add Section")').first().click();

    const nameInput = page.locator('input#add-section-name').first();
    
    // Type quickly
    await nameInput.type('Test<', { delay: 50 });
    
    // Error should not show immediately
    await expect(page.locator('text=/invalid character/i')).not.toBeVisible();
    
    // Wait for debounce
    await page.waitForTimeout(600);
    
    // Error should appear after debounce
    await expect(page.locator('text=/invalid character/i')).toBeVisible();
  });
});

test.describe('Validation - Integration', () => {
  test('should validate all fields before allowing save', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    // Clear all required fields
    await page.locator('input[placeholder*="Name"]').first().clear();
    await page.locator('input[type="email"]').first().clear();
    await page.locator('input[type="tel"]').first().clear();

    // Enter invalid data
    await page.locator('input[type="email"]').first().fill('invalid-email');
    await page.locator('input[type="tel"]').first().fill('123');

    // Try to save
    await page.locator('button:has-text("Save")').first().click();

    // Should show multiple errors
    const errorCount = await page.locator('text=/error/i').count();
    expect(errorCount).toBeGreaterThan(0);
  });

  test('should allow save when all validations pass', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppLoad(page);

    // Fill all required fields with valid data
    await page.locator('input[placeholder*="Name"]').first().fill('John Doe');
    await page.locator('input[type="email"]').first().fill('john@example.com');
    await page.locator('input[type="tel"]').first().fill('1234567890');

    // Save should work
    await page.locator('button:has-text("Save")').first().click();

    // Should show success message
    await expect(page.locator('text=/saved successfully/i, text=/success/i')).toBeVisible({ timeout: 5000 });
  });
});

