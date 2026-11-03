// @ts-check
import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../pages/CatalogPage.js';
import { ProductPage } from '../../pages/ProductPage.js';

test.describe('Product @smoke', () => {
  test('add a product to cart from its detail page @smoke', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();
    const productName = await catalog.openRandomProduct();
    const product = new ProductPage(page);

    await expect(product.productName).toHaveText(productName);
    await product.addToCart();

    await expect(product.header.cartQuantity).toHaveText('1');
  });
});
