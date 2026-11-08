// @ts-check
import { expect } from '@playwright/test';
import { HeaderComponent } from './HeaderComponent.js';

/**
 * Home / product listing page (/).
 */
export class CatalogPage {
  constructor(page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmitButton = page.getByTestId('search-submit');
    this.searchResetButton = page.getByTestId('search-reset');
    this.noProductsMessage = page.getByText('There are no products found.', { exact: true });
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
    this.sortSelect = page.getByTestId('sort');
    this.ecoFriendlyCheckbox = page.getByTestId('eco-friendly-filter');
    this.compareButtons = page.getByTestId('compare-btn');
    this.comparisonBar = page.getByTestId('comparison-bar');
    this.compareNowLink = page.getByRole('link', { name: 'Compare Now' });
  }

  categoryCheckbox(name) {
    return this.page.getByRole('checkbox', { name });
  }

  brandCheckbox(name) {
    return this.page.getByRole('checkbox', { name });
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    // WebKit hydrates the Angular app noticeably slower than Chromium/Firefox;
    // wait here so every caller sees a ready catalog instead of each having
    // to guard against a mid-hydration read.
    await expect(this.productNames.first()).toBeVisible({ timeout: 25000 });
  }

  async search(term) {
    await this.searchInput.fill(term);
    await this.searchSubmitButton.click();
    // The filtered list starts updating asynchronously. Callers should use a
    // retrying assertion for the final results because the UI is debounced.
    await this.page.waitForLoadState('networkidle');
  }

  async resetSearch() {
    await this.searchResetButton.click();
  }

  async openProduct(name) {
    // Each card link's accessible name includes surrounding text (a
    // "Compare" label, CO2 rating, price), so getByRole('link', { name })
    // can't match exactly - and several product names are substrings of
    // others (e.g. "Claw Hammer" vs "Claw Hammer with Shock Reduction
    // Grip"), so a plain substring match with .first() can silently open
    // the wrong one. Match exact text against the product-name element
    // itself instead, which holds nothing but the bare product name.
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await this.productNames.filter({ hasText: new RegExp(`^${escaped}$`) }).first().click();
  }

  /**
   * Opens a random product from the current (first-page) results rather
   * than always the first one. Tests that don't care which specific product
   * they use should call this instead of hardcoding index 0 - on a shared
   * public demo backend with real, mutable stock, many parallel tests all
   * targeting the same SKU (e.g. via repeated add-to-cart/checkout) can
   * genuinely exhaust its stock and disable "Add to cart" for everyone.
   * Spreading across products keeps any one SKU's load low.
   *
   * Clicks the element at the chosen index directly rather than reading its
   * name and re-locating by name afterwards - re-locating by (substring)
   * name risked resolving to a *different* product whose name contains the
   * chosen one, e.g. picking "Claw Hammer" but landing on "Claw Hammer with
   * Shock Reduction Grip".
   */
  async openRandomProduct() {
    const count = await this.productNames.count();
    const index = Math.floor(Math.random() * count);
    const target = this.productNames.nth(index);
    const name = (await target.textContent())?.trim() ?? '';
    await target.click();
    return name;
  }

  /**
   * Sort/filter results go through a debounced pipeline that takes ~2.5s to
   * settle, with a transient intermediate re-render along the way. That
   * makes a "wait until the DOM changes" signal unreliable (it fires on the
   * transient render, not the final one). Callers should assert on the
   * outcome using a retrying assertion (e.g. `expect(...).toPass()`) rather
   * than treating these as instantaneous actions.
   */
  async sortBy(option) {
    await this.sortSelect.selectOption(option);
  }

  async filterByCategory(name) {
    await this.categoryCheckbox(name).click();
  }

  async filterByBrand(name) {
    await this.brandCheckbox(name).click();
  }

  async toggleEcoFriendlyOnly() {
    await this.ecoFriendlyCheckbox.click();
  }
}
