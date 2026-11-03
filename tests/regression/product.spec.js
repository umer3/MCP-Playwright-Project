// @ts-check
import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../pages/CatalogPage.js';
import { ProductPage } from '../../pages/ProductPage.js';
import { ComparisonPage } from '../../pages/ComparisonPage.js';

test.describe('Product detail @regression', () => {
  test('shows an error when quantity is increased beyond 99 @regression', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();

    await catalog.header.openHandTools();
    await expect(catalog.productNames.first()).toBeVisible();
    await catalog.productNames.first().click();

    const product = new ProductPage(page);
    await product.quantityInput.fill('99');
    await product.increaseQuantityButton.click();

    await expect(product.quantityInput).toHaveValue('99');
    await expect(page.getByText('You can order at most 99 of this product.')).toBeVisible();
    //console.log("Error message is visible");
  });

  test('quantity cannot be decreased below 1 @regression', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();
    await catalog.openRandomProduct();

    const product = new ProductPage(page);
    await expect(product.quantityInput).toHaveValue('1');

    await product.decreaseQuantityButton.click();

    await expect(product.quantityInput).toHaveValue('1');
  });

  test('adding to favourites while logged out shows an unauthorized message @regression', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();
    await catalog.openRandomProduct();

    const product = new ProductPage(page);
    await product.addToFavoritesButton.click();

    await expect(product.toastMessage).toBeVisible();
    await expect(product.toastMessage).toContainText(/unauthorized/i);
  });

  test('adding a product to compare shows it on the comparison page @regression', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();
    const productName = (await catalog.productNames.first().textContent())?.trim() ?? '';

    await catalog.compareButtons.first().click();

    await expect(catalog.comparisonBar).toBeVisible();
    await expect(catalog.comparisonBar).toContainText('1 product(s) selected');

    await catalog.compareNowLink.click();

    const comparison = new ComparisonPage(page);
    await expect(page).toHaveURL(/\/comparison$/);
    await expect(comparison.productNames.first()).toContainText(productName);
  });
});
