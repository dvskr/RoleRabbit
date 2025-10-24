import { test as base, expect } from '@playwright/test';
import { RoleReadyPage } from './utils/roleReadyPage';

export interface TestFixtures {
  roleReadyPage: RoleReadyPage;
}

export const test = base.extend<TestFixtures>({
  roleReadyPage: async ({ page }, use) => {
    const roleReadyPage = new RoleReadyPage(page);
    await use(roleReadyPage);
  },
});

export { expect };