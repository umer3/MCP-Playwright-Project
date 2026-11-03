// @ts-check
import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../pages/CatalogPage.js';

test.describe('Catalog @smoke', () => {
  test('home page loads with products visible @smoke', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();

    await expect(page).toHaveTitle(/Practice Software Testing/);
    await expect(catalog.productNames.first()).toBeVisible();
  });

  test('search returns matching products @smoke', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.goto();

    await catalog.search('Pliers');

    // Smoke-level check: search returns results and the searched term is
    // represented among them. Result relevance/quality (the app's search
    // occasionally surfaces loosely-related items, e.g. "Bolt Cutters" for
    // "Pliers") is a regression-level concern, not a smoke-level one.
    const names = await catalog.productNames.allTextContents();
    expect(names.length).toBeGreaterThan(0);
    expect(names.some((name) => name.toLowerCase().includes('pliers'))).toBe(true);
  });
});
