// @ts-check
import { HeaderComponent } from './HeaderComponent.js';

/**
 * Login page (/auth/login).
 */
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.loginSubmitButton = page.getByTestId('login-submit');
    this.loginError = page.getByTestId('login-error');
  }

  async goto() {
    await this.page.goto('/auth/login');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginSubmitButton.click();
    // Let the auth request resolve (redirect to /account on success,
    // or render the inline error) before control returns to the caller.
    await this.page.waitForLoadState('networkidle');
  }
}
