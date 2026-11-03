// @ts-check
import { expect } from '@playwright/test';
import { CatalogPage } from '../pages/CatalogPage.js';
import { ProductPage } from '../pages/ProductPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { uniqueEmail } from './testDataGenerator.js';

/**
 * Adds a random catalog product to cart and walks a guest through Cart ->
 * Guest -> Billing Address, leaving the wizard on the Payment step ready
 * for a payment-method-specific fill + confirm.
 *
 * Uses a random product rather than always the first one: this suite
 * completes real orders against a shared public demo backend, and several
 * tests running in parallel all targeting the same SKU can genuinely
 * exhaust its stock, disabling "Add to cart" for everyone mid-run.
 */
export async function reachPaymentStepAsGuest(page, checkoutData, emailPrefix = 'qa.checkout') {
  const catalog = new CatalogPage(page);
  await catalog.goto();
  const productName = await catalog.openRandomProduct();

  const product = new ProductPage(page);
  await product.addToCart();

  const checkout = new CheckoutPage(page);
  await product.header.cartLink.click();
  await expect(checkout.cartRow(productName)).toBeVisible();
  await checkout.proceedFromCart();

  const guest = { ...checkoutData.guest, email: uniqueEmail(emailPrefix) };
  await checkout.continueAsGuest(guest);

  await checkout.fillBillingAddress(checkoutData.billingAddress);
  await checkout.proceedFromAddress();

  return { checkout, productName };
}
