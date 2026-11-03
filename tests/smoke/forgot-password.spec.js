// @ts-check
import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/RegisterPage.js';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage.js';
import { uniqueEmail } from '../../utils/testDataGenerator.js';
import users from '../../test_data/users.json' with { type: 'json' };

test.describe('Forgot password @smoke', () => {
  test('accepts a password-reset request for a registered user @smoke', async ({ page }) => {
    // Register a fresh account so this test is independent of seeded users.
    const user = {
      ...users.newUserTemplate,
      email: uniqueEmail('qa.forgot-password'),
    };
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user);
    await expect(page).toHaveURL(/\/auth\/login$/);

    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.goto();
    const response = await forgotPasswordPage.requestPasswordReset(user.email);

    expect(response.ok()).toBe(true);
    await expect(response.json()).resolves.toEqual({ success: true });
    await expect(page).toHaveURL(/\/auth\/forgot-password$/);
  });
});
