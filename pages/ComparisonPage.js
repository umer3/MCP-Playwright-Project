// @ts-check
import { HeaderComponent } from './HeaderComponent.js';

/**
 * Product comparison page (/comparison).
 */
export class ComparisonPage {
  constructor(page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.comparisonTable = page.getByTestId('comparison-table');
    this.productNames = page.getByTestId('product-name');
  }
}
