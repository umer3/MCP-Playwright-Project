// @ts-check
import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/RegisterPage.js';
import { uniqueEmail } from '../../utils/testDataGenerator.js';
import users from '../../test_data/users.json' with { type: 'json' };

test.describe('Registration @smoke', () => {
  test('registers a new user with valid data @smoke', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    const user = { ...users.newUserTemplate, email: uniqueEmail() };
    await registerPage.register(user);

    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
