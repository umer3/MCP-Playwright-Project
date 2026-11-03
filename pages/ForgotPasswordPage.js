// @ts-check
import { HeaderComponent } from './HeaderComponent.js';

/**
 * Forgot-password page (/auth/forgot-password).
 */
export class ForgotPasswordPage {
  constructor(page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.emailInput = page.getByTestId('email');
    this.submitButton = page.getByTestId('forgot-password-submit');
  }

  async goto() {
    await this.page.goto('/auth/forgot-password');
  }

  async requestPasswordReset(email) {
    await this.emailInput.fill(email);

    const responsePromise = this.page.waitForResponse((response) =>
      response.url().endsWith('/users/forgot-password') &&
      response.request().method() === 'POST'
    );

    await this.submitButton.click();
    return responsePromise;
  }
}
