// @ts-check
import { HeaderComponent } from './HeaderComponent.js';

/**
 * Contact Us page (/contact), guest (logged-out) form.
 */
export class ContactPage {
  constructor(page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.firstNameInput = page.getByTestId('first-name');
    this.lastNameInput = page.getByTestId('last-name');
    this.emailInput = page.getByTestId('email');
    this.subjectSelect = page.getByTestId('subject');
    this.messageInput = page.getByTestId('message');
    this.submitButton = page.getByTestId('contact-submit');
    this.successAlert = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/contact');
  }

  async fillForm(data) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.subjectSelect.selectOption(data.subject);
    await this.messageInput.fill(data.message);
  }

  async submit() {
    await this.submitButton.click();
    // Wait for the submit request to resolve before the caller checks for
    // the success alert, otherwise it can be read before it renders.
    await this.page.waitForLoadState('networkidle');
  }
}
