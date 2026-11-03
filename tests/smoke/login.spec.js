// @ts-check
import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/RegisterPage.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { AccountPage } from '../../pages/AccountPage.js';
import { uniqueEmail } from '../../utils/testDataGenerator.js';
import users from '../../test_data/users.json' with { type: 'json' };

test.describe('Login @smoke', () => {
  test('logs in with valid credentials @smoke', async ({ page }) => {
    // Self-contained setup: register a fresh user so this test does not
    // depend on a pre-existing account and can run independently/in parallel.
    const user = { ...users.newUserTemplate, email: uniqueEmail() };
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user);
    await expect(page).toHaveURL(/\/auth\/login$/);

    const loginPage = new LoginPage(page);
    await expect(loginPage.loginError).not.toBeVisible();
    await loginPage.login(user.email, user.password);

    // No lingering login error, and the login form itself is gone.
    await expect(loginPage.loginError).not.toBeVisible();
    await expect(loginPage.emailInput).not.toBeVisible();

    const accountPage = new AccountPage(page);
    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.pageTitle).toHaveText('My account');

    // Tie the result back to the specific account that was registered,
    // rather than just any post-login state.
    await expect(accountPage.header.accountMenuButton).toHaveText(
      `${user.firstName} ${user.lastName}`
    );
    // The logged-out affordance must be gone now that we're authenticated.
    await expect(accountPage.header.signInLink).not.toBeVisible();
    // Sign out lives inside the collapsed account dropdown, so it's only
    // attached (not visible) until the menu is opened.
    await expect(accountPage.header.signOutLink).toBeAttached();
  });

  test('shows an error with invalid credentials @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(users.invalidLogin.email, users.invalidLogin.password);

    await expect(loginPage.loginError).toBeVisible();
    await expect(loginPage.loginError).toContainText(/invalid email or password/i);
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('logs out an authenticated user @smoke', async ({ page }) => {
    const user = {
      ...users.newUserTemplate,
      email: uniqueEmail('qa.logout'),
    };
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user);

    const loginPage = new LoginPage(page);
    await loginPage.login(user.email, user.password);

    const accountPage = new AccountPage(page);
    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.header.accountMenuButton).toHaveText(
      `${user.firstName} ${user.lastName}`
    );

    await accountPage.header.signOut();

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(accountPage.header.signInLink).toBeVisible();
    await expect(accountPage.header.accountMenuButton).not.toBeVisible();
  });
});
