// @ts-check
import { HeaderComponent } from './HeaderComponent.js';

/**
 * Product detail page (/product/{id}).
 */
export class ProductPage {
  constructor(page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.productName = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.quantityInput = page.getByTestId('quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.decreaseQuantityButton = page.getByTestId('decrease-quantity');
    this.increaseQuantityButton = page.getByTestId('increase-quantity');
    this.addToFavoritesButton = page.getByTestId('add-to-favorites');
    this.addToCompareButton = page.getByTestId('add-to-compare');
    this.toastMessage = page.getByRole('alert');
  }

  async addToCart() {
    await this.addToCartButton.click();
    // Wait for the add-to-cart request to resolve before the caller checks
    // the header's cart badge, otherwise it can read a pre-update state.
    await this.page.waitForLoadState('networkidle');
  }
}
