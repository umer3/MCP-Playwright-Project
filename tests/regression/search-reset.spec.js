// @ts-check
import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../pages/CatalogPage.js';

test('resetting an unmatched search restores the catalog @regression', async ({ page }) => {
  const catalog = new CatalogPage(page);
  await catalog.goto();

  await catalog.search('zz-no-such-tool-git-practice');
  await expect(catalog.noProductsMessage).toBeVisible({ timeout: 20000 });
  await expect(catalog.productNames).toHaveCount(0);

  await catalog.resetSearch();

  await expect(catalog.searchInput).toHaveValue('');
  await expect(catalog.productNames.first()).toBeVisible({ timeout: 20000 });
  await expect(catalog.noProductsMessage).not.toBeVisible();
});
