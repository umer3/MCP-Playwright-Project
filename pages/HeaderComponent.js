// @ts-check

/**
 * Site-wide navigation bar, present on every page.
 */
export class HeaderComponent {
  constructor(page) {
    this.page = page;
    this.cartLink = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.signInLink = page.getByTestId('nav-sign-in');
    this.accountMenuButton = page.getByTestId('nav-menu');
    this.signOutLink = page.getByTestId('nav-sign-out');
    this.categoriesMenuButton = page.getByRole('button', { name: 'Categories' });
    this.handToolsLink = page.getByRole('link', { name: 'Hand Tools' });
  }

  async signOut() {
    await this.accountMenuButton.click();
    await this.signOutLink.click();
  }

  async openHandTools() {
    await this.categoriesMenuButton.click();
    await this.handToolsLink.click();
  }
}
