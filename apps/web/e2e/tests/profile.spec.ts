import { test, expect } from '@playwright/test';

test.describe('Profile Experience', () => {
  test.beforeEach(async ({ page }) => {
    let profileState = {
      id: 'user-1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      personalEmail: 'contact.jane@example.com',
      phone: '+1 555 0100',
      location: 'Austin, TX',
      bio: 'Initial profile bio',
      professionalBio: 'Initial profile bio',
      profilePicture: null,
      skills: [],
      certifications: [],
      languages: [],
      education: [],
      portfolio: 'janedoe.dev',
      linkedin: 'linkedin.com/in/janedoe',
      github: 'github.com/janedoe',
      website: 'janedoe.dev',
      socialLinks: [],
      projects: [],
      workExperiences: [],
      emailNotifications: true,
      smsNotifications: false,
      privacyLevel: 'Professional',
      profileVisibility: 'Public',
      profileViews: 12,
      successRate: 40,
      profileCompleteness: 72,
      skillMatchRate: 80,
      avgResponseTime: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await page.route('**/api/auth/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'user-1',
            email: profileState.email,
            name: `${profileState.firstName} ${profileState.lastName}`,
          },
        }),
      });
    });

    await page.route('**/api/users/profile', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: profileState }),
        });
        return;
      }

      if (request.method() === 'PUT') {
        const payload = request.postDataJSON();
        profileState = {
          ...profileState,
          ...payload,
          updatedAt: new Date().toISOString(),
        };

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: profileState }),
        });
        return;
      }

      await route.continue();
    });

    // Fallback routes that profile may trigger
    await page.route('**/api/users/profile/*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    // Seed localStorage session before navigation
    await page.addInitScript((auth) => {
      window.localStorage.setItem('user', JSON.stringify(auth));
    }, {
      id: 'user-1',
      email: profileState.email,
      name: `${profileState.firstName} ${profileState.lastName}`,
    });

    await page.goto('http://localhost:3000/dashboard?tab=profile');
  });

  test('loads profile data', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
    await expect(page.getByLabel('First Name')).toHaveValue('Jane');
    await expect(page.getByLabel('Last Name')).toHaveValue('Doe');
  });

  test('edits and saves basic profile info', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit Profile' }).click();

    await page.getByLabel('First Name').fill('Janet');
    await page.getByPlaceholder('Tell us about yourself...').fill('Updated automation bio');

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();

    await expect(page.getByLabel('First Name')).toHaveValue('Janet');
    await expect(page.getByPlaceholder('Tell us about yourself...')).toHaveValue('Updated automation bio');
  });

  test('toggles billing plans between monthly and annual pricing', async ({ page }) => {
    const expandSidebar = page.locator('button[title="Expand sidebar"]');
    if (await expandSidebar.isVisible()) {
      await expandSidebar.click();
    }

    await page.getByRole('button', { name: 'Billing' }).click();

    const proCard = page.getByRole('heading', { name: 'Pro' }).locator('..');
    await expect(proCard).toContainText('$14.99');
    await expect(proCard).toContainText('/month');

    await page.getByRole('button', { name: /Annual/ }).click();

    await expect(proCard).toContainText('/year');
    await expect(proCard).toContainText('Equivalent to $11.99/month');

    await page.getByRole('button', { name: /Monthly/ }).click();
    await expect(proCard).toContainText('/month');
  });
});

