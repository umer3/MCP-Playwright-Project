// @ts-check
import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../pages/CatalogPage.js';

test.describe('Catalog filtering & sorting @regression', () => {
  test('search shows only products matching Pliers @regression', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();

    await catalog.search('Pliers');

    // Search results update after a short debounce, so wait for the final
    // filtered list instead of checking the intermediate catalog contents.
    await expect(async () => {
      const productNames = await catalog.productNames.allTextContents();
      const nonPliersProducts = productNames.filter(
        (name) => !name.toLowerCase().includes('pliers')
      );

      expect(productNames.length).toBeGreaterThan(0);
      expect(nonPliersProducts).toEqual([]);
    }).toPass({ timeout: 20000 });
    console.log('Search results for "Pliers" are correct');
  });

  test('sorts products by price, low to high @regression', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();

    await catalog.sortBy('Price (Low - High)');

    // Sorting goes through a debounced pipeline (~2.5s to settle), so poll
    // the outcome rather than reading it once right after the action.
    await expect(async () => {
      const priceTexts = await catalog.productPrices.allTextContents();
      const prices = priceTexts.map((text) => parseFloat(text.replace(/[^0-9.]/g, '')));
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    }).toPass({ timeout: 20000 });
  });

  test('sorts products by price, high to low @regression', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();

    await catalog.sortBy('Price (High - Low)');

    await expect(async () => {
      const priceTexts = await catalog.productPrices.allTextContents();
      const prices = priceTexts.map((text) => parseFloat(text.replace(/[^0-9.]/g, '')));
      const sortedDescending = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sortedDescending);
    }).toPass({ timeout: 20000 });
  });

  test('category filter shows only products from that category @regression', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();

    await catalog.filterByCategory('Safety Gear');

    // Assert against a known member and a known non-member rather than an
    // exhaustive product list, which would be brittle against catalog reseeds.
    await expect(async () => {
      const names = await catalog.productNames.allTextContents();
      expect(names.length).toBeGreaterThan(0);
      expect(names.some((name) => name.includes('Safety Goggles'))).toBe(true);
      expect(names.some((name) => name.includes('Combination Pliers'))).toBe(false);
    }).toPass({ timeout: 20000 });
  });

  test('eco-friendly filter changes the result set @regression', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();
    const unfilteredNames = await catalog.productNames.allTextContents();

    await catalog.toggleEcoFriendlyOnly();

    await expect(async () => {
      const filteredNames = await catalog.productNames.allTextContents();
      expect(filteredNames).not.toEqual(unfilteredNames);
    }).toPass({ timeout: 20000 });
  });

  test('brand filter changes the result set @regression', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();
    const unfilteredNames = await catalog.productNames.allTextContents();

    await catalog.filterByBrand('ForgeFlex Tools');

    await expect(async () => {
      const filteredNames = await catalog.productNames.allTextContents();
      expect(filteredNames.length).toBeGreaterThan(0);
      expect(filteredNames).not.toEqual(unfilteredNames);
    }).toPass({ timeout: 20000 });
  });
});
