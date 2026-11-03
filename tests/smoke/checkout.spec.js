// @ts-check
import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../pages/CatalogPage.js';
import { ProductPage } from '../../pages/ProductPage.js';
import { CheckoutPage } from '../../pages/CheckoutPage.js';
import { RegisterPage } from '../../pages/RegisterPage.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { uniqueEmail } from '../../utils/testDataGenerator.js';
import checkoutData from '../../test_data/checkout.json' with { type: 'json' };
import users from '../../test_data/users.json' with { type: 'json' };

test.describe('Checkout @smoke', () => {
  test('completes a guest checkout end-to-end @smoke', async ({ page }) => {
    // Add a product to cart.
    const catalog = new CatalogPage(page);
    await catalog.goto();
    const productName = await catalog.openRandomProduct();

    const product = new ProductPage(page);
    await product.addToCart();

    // Step 1: Cart. Navigate via the header's cart link (client-side route
    // change) rather than a hard page.goto('/checkout') reload, which races
    // the app's cart-state hydration and can render the step empty.
    const checkout = new CheckoutPage(page);
    await product.header.cartLink.click();
    await expect(checkout.cartRow(productName)).toBeVisible();
    await checkout.proceedFromCart();

    // Step 2: Continue as guest.
    const guest = { ...checkoutData.guest, email: uniqueEmail('qa.checkout') };
    await checkout.continueAsGuest(guest);

    // Step 3: Billing address.
    await checkout.fillBillingAddress(checkoutData.billingAddress);
    await checkout.proceedFromAddress();

    // Step 4: Payment.
    await checkout.payWithBankTransfer(checkoutData.bankTransfer);

    // Outcome: order confirmation with an invoice number, and the cart is cleared.
    await expect(checkout.orderConfirmation).toContainText(/thanks for your order/i);
    await expect(checkout.orderConfirmation).toContainText(/INV-\d+/);
    await expect(checkout.header.cartQuantity).not.toBeVisible();
  });

  test('completes a logged-in checkout end-to-end @smoke', async ({ page }) => {
    test.setTimeout(60000);

    // Register and sign in with a fresh customer so the checkout is isolated.
    const user = {
      ...users.newUserTemplate,
      email: uniqueEmail('qa.authenticated-checkout'),
    };
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user);

    const loginPage = new LoginPage(page);
    await loginPage.login(user.email, user.password);
    await expect(page).toHaveURL(/\/account$/);

    // Add a product and enter checkout through the cart navigation.
    const catalog = new CatalogPage(page);
    await catalog.goto();
    const productName = await catalog.openRandomProduct();

    const product = new ProductPage(page);
    await product.addToCart();

    const checkout = new CheckoutPage(page);
    await product.header.cartLink.click();
    await expect(checkout.cartRow(productName)).toBeVisible();
    await checkout.proceedFromCart();

    // The identity step recognizes the session, so no credentials or guest
    // details are needed. Continue with the customer's billing address.
    await checkout.continueAsLoggedIn();
    await expect(checkout.countrySelect).toBeVisible();
    await expect(checkout.postalCodeInput).toHaveValue(user.postalCode);
    await checkout.fillBillingAddress(checkoutData.billingAddress);
    await checkout.proceedFromAddress();

    await checkout.payWithBankTransfer(checkoutData.bankTransfer);

    await expect(checkout.orderConfirmation).toContainText(/thanks for your order/i);
    await expect(checkout.orderConfirmation).toContainText(/INV-\d+/);
    await expect(checkout.header.cartQuantity).not.toBeVisible();
  });
});
