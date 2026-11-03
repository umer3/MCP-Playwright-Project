// @ts-check
import { HeaderComponent } from './HeaderComponent.js';

/**
 * Logged-in account overview page (/account).
 */
export class AccountPage {
  constructor(page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.pageTitle = page.getByTestId('page-title');
  }
}
