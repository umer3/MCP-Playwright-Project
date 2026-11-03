// @ts-check
import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../pages/CatalogPage.js';
import { ProductPage } from '../../pages/ProductPage.js';
import { CheckoutPage } from '../../pages/CheckoutPage.js';
import { uniqueEmail } from '../../utils/testDataGenerator.js';
import checkoutData from '../../test_data/checkout.json' with { type: 'json' };

/**
 * Adds a random catalog product to cart and lands on the cart step of
 * checkout (step 1), navigating via the header cart link rather than a hard
 * page.goto('/checkout') reload, which races the app's cart-state hydration.
 * Random rather than always the first product to avoid many parallel tests
 * colliding on (and depleting) the same shared-backend SKU.
 */
async function addFirstProductToCartAndOpenCheckout(page) {
  const catalog = new CatalogPage(page);
  await catalog.goto();
  const productName = await catalog.openRandomProduct();

  const product = new ProductPage(page);
  await product.addToCart();

  const checkout = new CheckoutPage(page);
  await product.header.cartLink.click();
  await expect(checkout.cartRow(productName)).toBeVisible();

  return { checkout, productName };
}

test.describe('Checkout @regression', () => {
  test('updates the line total when quantity changes in the cart @regression', async ({ page }) => {
    const { checkout, productName } = await addFirstProductToCartAndOpenCheckout(page);

    const unitPriceText = (await checkout.lineTotalFor(productName).textContent()) ?? '';
    const unitPrice = parseFloat(unitPriceText.replace(/[^0-9.]/g, ''));

    await checkout.setQuantity(productName, 3);

    const newLineTotalText = (await checkout.lineTotalFor(productName).textContent()) ?? '';
    const newLineTotal = parseFloat(newLineTotalText.replace(/[^0-9.]/g, ''));
    expect(newLineTotal).toBeCloseTo(unitPrice * 3, 2);

    // The summary cart-total recalculates on a short debounce after the
    // quantity change, so poll for it rather than reading it once.
    const expectedTotal = (unitPrice * 3).toFixed(2);
    await expect(async () => {
      const cartTotalText = (await checkout.cartTotal.textContent()) ?? '';
      expect(parseFloat(cartTotalText.replace(/[^0-9.]/g, ''))).toBeCloseTo(Number(expectedTotal), 2);
    }).toPass({ timeout: 10000 });
  });

  test('removes an item from the cart @regression', async ({ page }) => {
    const { checkout, productName } = await addFirstProductToCartAndOpenCheckout(page);

    await checkout.removeItem(productName);

    await expect(checkout.cartRow(productName)).not.toBeVisible();
    await expect(checkout.header.cartLink).not.toBeVisible();
  });

  test('"Continue Shopping" returns to the catalog without completing checkout @regression', async ({ page }) => {
    const { checkout } = await addFirstProductToCartAndOpenCheckout(page);

    await checkout.continueShoppingButton.click();

    await expect(page).toHaveURL(/\/$/);
  });

  test('guest checkout rejects an invalid email format @regression', async ({ page }) => {
    const { checkout } = await addFirstProductToCartAndOpenCheckout(page);
    await checkout.proceedFromCart();

    await checkout.guestTab.click();
    await checkout.guestEmailInput.fill('not-an-email');
    await checkout.guestFirstNameInput.fill(checkoutData.guest.firstName);
    await checkout.guestLastNameInput.fill(checkoutData.guest.lastName);
    await checkout.guestSubmitButton.click();

    // The form validates on submit (the button itself isn't pre-disabled):
    // an inline error appears and progression past the guest step is blocked.
    await expect(checkout.guestEmailError).toBeVisible();
    await expect(checkout.guestEmailError).toContainText(/email format is invalid/i);
    await expect(checkout.proceedFromGuestButton).not.toBeVisible();
  });

  test('billing address blocks proceeding until required fields are complete @regression', async ({ page }) => {
    const { checkout } = await addFirstProductToCartAndOpenCheckout(page);
    await checkout.proceedFromCart();

    const guest = { ...checkoutData.guest, email: uniqueEmail('qa.checkout.regress') };
    await checkout.continueAsGuest(guest);

    // Country left unselected, address fields empty: proceed must stay disabled.
    await expect(checkout.proceedFromAddressButton).toBeDisabled();
  });
});
