// @ts-check
import { expect } from '@playwright/test';
import { HeaderComponent } from './HeaderComponent.js';

/**
 * Customer registration page (/auth/register).
 */
export class RegisterPage {
  constructor(page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.firstNameInput = page.getByTestId('first-name');
    this.lastNameInput = page.getByTestId('last-name');
    this.dobInput = page.getByTestId('dob');
    this.countrySelect = page.getByTestId('country');
    this.postalCodeInput = page.getByTestId('postal_code');
    this.houseNumberInput = page.getByTestId('house_number');
    this.streetInput = page.getByTestId('street');
    this.phoneInput = page.getByTestId('phone');
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.registerSubmitButton = page.getByTestId('register-submit');
  }

  async goto() {
    await this.page.goto('/auth/register');
  }

  async fillForm(user) {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.dobInput.fill(user.dob);
    await this.countrySelect.selectOption(user.country);
    await this.postalCodeInput.fill(user.postalCode);
    await this.houseNumberInput.fill(user.houseNumber);
    // Street/city/state are auto-filled from an async address lookup;
    // wait for it to resolve before continuing, otherwise submit fails validation.
    await expect(this.streetInput).not.toHaveValue('');
    await this.phoneInput.fill(user.phone);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
  }

  async submit() {
    // The submit button can stay disabled for a brief moment after the async
    // address lookup resolves, until Angular's form validity catches up.
    // Clicking too early is a silent no-op, so wait for it to be enabled.
    await expect(this.registerSubmitButton).toBeEnabled();
    await this.registerSubmitButton.click();
    await this.page.waitForURL(/\/auth\/login$/);
  }

  async register(user) {
    await this.fillForm(user);
    await this.submit();
  }
}
