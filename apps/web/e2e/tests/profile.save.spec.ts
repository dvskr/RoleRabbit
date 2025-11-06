/**
 * E2E tests for profile save flow
 * Tests the complete user flow of editing and saving profile data
 */

import { test, expect } from '@playwright/test';

// Use a fixed email so user persists across test runs (faster)
const TEST_USER = {
  name: 'Playwright Profile User',
  email: 'profile-e2e-test@example.com',
  password: 'Test1234!'
};

test.describe.configure({ mode: 'serial' });

test.describe('Profile Save Flow', () => {
  // Register user once before all tests (runs only once)
  test.beforeAll(async ({ request }) => {
    // Try to register the user (may fail if already exists, that's OK)
    const registerResponse = await request.post('http://localhost:3001/api/auth/register', {
      data: {
        name: TEST_USER.name,
        email: TEST_USER.email,
        password: TEST_USER.password
      }
    });
    
    if (!registerResponse.ok()) {
      const errorText = await registerResponse.text();
      // User already exists is fine - just continue
      if (!errorText.includes('already exists')) {
        console.log(`⚠️ Registration result: ${registerResponse.status()} - ${errorText}`);
      }
    } else {
      console.log('✅ Test user registered successfully');
    }
  });

  // Login and navigate for each test (faster than registering each time)
  test.beforeEach(async ({ page }) => {
    const apiRequest = page.request;

    // Authenticate via API to get httpOnly cookie
    const loginResponse = await apiRequest.post('http://localhost:3001/api/auth/login', {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password
      },
      timeout: 10000
    });
    
    // Verify login succeeded
    if (!loginResponse.ok()) {
      const errorText = await loginResponse.text();
      throw new Error(`Login failed (${loginResponse.status()}): ${errorText}. Make sure backend is running on port 3001.`);
    }

    // Navigate to profile page (cookie from API request is shared with page)
    await page.goto('/dashboard?tab=profile', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Wait for page to load - use more specific selector
    await page.waitForSelector('[data-testid="profile-header"]', { timeout: 10000 }).catch(async () => {
      // If header not found, check if page loaded at all
      const url = page.url();
      if (!url.includes('dashboard')) {
        throw new Error(`Navigation failed. Current URL: ${url}`);
      }
      // Try waiting for any profile content
      await page.waitForSelector('h1:has-text("Profile"), button:has-text("Edit Profile")', { timeout: 5000 });
    });
  });

  test('should save profile changes successfully', async ({ page }) => {
    // Wait for profile to be fully loaded
    await page.waitForSelector('[data-testid="profile-header"]', { timeout: 5000 });
    
    // Click edit button (text is "Edit Profile")
    await page.click('button:has-text("Edit Profile")');
    
    // Wait for edit mode - look for firstName input
    await page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 5000 });
    
    // Update first name with unique value to ensure change is detected
    const uniqueName = `Test User ${Date.now()}`;
    await page.fill('input[name="firstName"]', uniqueName);
    
    // Wait a bit for form to register the change
    await page.waitForTimeout(300);
    
    // Ensure save button is enabled and visible
    const saveButton = page.locator('button:has-text("Save")');
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    
    // Set up response listener BEFORE clicking (critical for race conditions)
    const savePromise = page.waitForResponse(
      response => response.url().includes('/api/users/profile') && response.request().method() === 'PUT',
      { timeout: 10000 }
    );
    
    // Click save button
    await saveButton.click();
    
    // Wait for the API response with timeout
    const response = await savePromise;
    
    // Check response immediately
    if (!response.ok()) {
      const errorText = await response.text();
      const status = response.status();
      throw new Error(`Save API failed (${status}): ${errorText}`);
    }
    
    // Wait for UI update (button text changes to "Saved")
    await expect(saveButton).toHaveText(/Saved/, { timeout: 5000 });
  });

  test('should save work experience changes', async ({ page }) => {
    // Wait for profile to be fully loaded
    await page.waitForSelector('[data-testid="profile-header"]', { timeout: 10000 });
    
    // Expand sidebar if collapsed (click expand button)
    const expandButton = page.locator('button[title="Expand sidebar"], button:has-text("Expand sidebar")');
    if (await expandButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expandButton.click();
      await page.waitForTimeout(300);
    }
    
    // Navigate to professional tab - use title attribute or visible text
    await page.click('button[title="Professional"], button:has-text("Professional")');
    await page.waitForTimeout(500); // Wait for tab switch
    
    // Click edit button
    await page.click('button:has-text("Edit Profile")');
    
    // Add or edit work experience
    const addExpButton = page.locator('button:has-text("Add Experience")');
    if (await addExpButton.isVisible({ timeout: 5000 })) {
      await addExpButton.click();
    }
    
    // Fill in work experience fields
    await page.fill('input[name*="company"]', 'Test Company');
    await page.fill('input[name*="role"]', 'Test Role');
    await page.fill('input[name*="startDate"]', '2020-01');
    
    // Click save
    await page.click('button:has-text("Save")');
    
    // Verify save success
    await page.waitForSelector('button:has-text("Saved")', { timeout: 10000 });
  });

  test('should save project technologies', async ({ page }) => {
    // Wait for profile to be fully loaded
    await page.waitForSelector('[data-testid="profile-header"]', { timeout: 10000 });
    
    // Expand sidebar if collapsed
    const expandButton = page.locator('button[title="Expand sidebar"], button:has-text("Expand sidebar")');
    if (await expandButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expandButton.click();
      await page.waitForTimeout(300);
    }
    
    // Navigate to professional tab
    await page.click('button[title="Professional"], button:has-text("Professional")');
    await page.waitForTimeout(500);
    
    // Click edit button
    await page.click('button:has-text("Edit Profile")');
    
    // Scroll to projects section
    await page.locator('h2:has-text("Projects")').scrollIntoViewIfNeeded();
    
    // Add or edit project
    const addProjectButton = page.locator('button:has-text("Add Project")');
    if (await addProjectButton.isVisible({ timeout: 5000 })) {
      await addProjectButton.click();
    }
    
    // Fill project fields
    await page.fill('input[name*="title"]', 'Test Project');
    await page.fill('textarea[name*="description"]', 'Test description');
    
    // Add technologies
    const techInput = page.locator('input[id*="technologies"]').first();
    await techInput.fill('React, TypeScript, Node.js');
    await techInput.blur(); // Trigger blur to sync
    
    // Click save
    await page.click('button:has-text("Save")');
    
    // Wait for save
    await page.waitForSelector('button:has-text("Saved")', { timeout: 10000 });
    
    // Verify technologies were saved (reload page or check display)
    await page.reload();
    await page.waitForSelector('[data-testid="profile-header"]', { timeout: 10000 });
    
    // Expand sidebar if collapsed after reload
    const expandButtonAfterReload = page.locator('button[title="Expand sidebar"], button:has-text("Expand sidebar")');
    if (await expandButtonAfterReload.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expandButtonAfterReload.click();
      await page.waitForTimeout(300);
    }
    
    // Navigate back to professional tab
    await page.click('button[title="Professional"], button:has-text("Professional")');
    await page.waitForTimeout(500);
    
    // Verify technologies are displayed
    const techText = page.locator('text=React');
    await expect(techText.first()).toBeVisible({ timeout: 10000 });
  });

  test('should handle save errors gracefully', async ({ page }) => {
    // Wait for profile to be fully loaded
    await page.waitForSelector('[data-testid="profile-header"]', { timeout: 10000 });
    
    // Mock network failure
    await page.route('**/api/users/profile', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Click edit and make a change
    await page.click('button:has-text("Edit Profile")');
    await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });
    await page.fill('input[name="firstName"]', 'Test');
    
    // Try to save
    await page.click('button:has-text("Save")');
    
    // Verify error message is shown
    await page.waitForSelector('text=/error|failed/i', { timeout: 10000 });
  });

  test('should sync technologies before save', async ({ page }) => {
    // Wait for profile to be fully loaded
    await page.waitForSelector('[data-testid="profile-header"]', { timeout: 10000 });
    
    // Expand sidebar if collapsed
    const expandButton = page.locator('button[title="Expand sidebar"], button:has-text("Expand sidebar")');
    if (await expandButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expandButton.click();
      await page.waitForTimeout(300);
    }
    
    // Navigate to professional tab
    await page.click('button[title="Professional"], button:has-text("Professional")');
    await page.waitForTimeout(500);
    
    // Click edit
    await page.click('button:has-text("Edit Profile")');
    
    // Add project
    const addProjectButton = page.locator('button:has-text("Add Project")');
    if (await addProjectButton.isVisible({ timeout: 5000 })) {
      await addProjectButton.click();
    }
    
    // Type technologies but don't blur
    const techInput = page.locator('input[id*="technologies"]').first();
    await techInput.fill('React, TypeScript');
    
    // Immediately click save (without blurring)
    await page.click('button:has-text("Save")');
    
    // Wait for save
    await page.waitForSelector('button:has-text("Saved")', { timeout: 10000 });
    
    // Reload and verify technologies were saved
    await page.reload();
    await page.waitForSelector('[data-testid="profile-header"]', { timeout: 10000 });
    
    // Expand sidebar if collapsed after reload
    const expandButtonAfterReload2 = page.locator('button[title="Expand sidebar"], button:has-text("Expand sidebar")');
    if (await expandButtonAfterReload2.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expandButtonAfterReload2.click();
      await page.waitForTimeout(300);
    }
    
    await page.click('button[title="Professional"], button:has-text("Professional")');
    await page.waitForTimeout(500);
    
    // Verify technologies appear
    await expect(page.locator('text=React').first()).toBeVisible({ timeout: 10000 });
  });

  test('should cancel edit mode without saving', async ({ page }) => {
    // Wait for profile to be fully loaded
    await page.waitForSelector('[data-testid="profile-header"]', { timeout: 5000 });
    
    // Click edit button
    await page.click('button:has-text("Edit Profile")');
    await page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 5000 });
    
    // Make a change
    const originalValue = await page.inputValue('input[name="firstName"]');
    await page.fill('input[name="firstName"]', 'Should Not Save');
    
    // Click cancel instead of save
    await page.click('button:has-text("Cancel")');
    
    // Wait for edit mode to close
    await page.waitForSelector('button:has-text("Edit Profile")', { timeout: 5000 });
    
    // Verify the change was not saved (reload to be sure)
    await page.reload();
    await page.waitForSelector('[data-testid="profile-header"]', { timeout: 10000 });
    
    // Click edit again to check value
    await page.click('button:has-text("Edit Profile")');
    await page.waitForSelector('input[name="firstName"]', { timeout: 5000 });
    const currentValue = await page.inputValue('input[name="firstName"]');
    
    // Value should not be "Should Not Save"
    expect(currentValue).not.toBe('Should Not Save');
  });

  test('should handle saving with empty optional fields', async ({ page }) => {
    // Wait for profile to be fully loaded
    await page.waitForSelector('[data-testid="profile-header"]', { timeout: 5000 });
    
    // Click edit button
    await page.click('button:has-text("Edit Profile")');
    await page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 5000 });
    
    // Make a small change to ensure save is triggered
    await page.fill('input[name="firstName"]', 'Test Empty Fields');
    
    // Clear optional fields (like phone, location) if they exist
    const phoneInput = page.locator('input[name="phone"]');
    const locationInput = page.locator('input[name="location"]');
    
    if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneInput.clear();
    }
    if (await locationInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await locationInput.clear();
    }
    
    // Set up response listener BEFORE clicking
    const saveButton = page.locator('button:has-text("Save")');
    const savePromise = page.waitForResponse(
      response => response.url().includes('/api/users/profile') && response.request().method() === 'PUT',
      { timeout: 8000 }
    );
    
    // Click save
    await saveButton.click();
    const response = await savePromise;
    
    // Should succeed even with empty optional fields
    expect(response.ok()).toBeTruthy();
    await expect(saveButton).toHaveText(/Saved/, { timeout: 5000 });
  });
});

