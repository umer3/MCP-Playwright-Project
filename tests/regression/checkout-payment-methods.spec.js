// @ts-check
import { test, expect } from '@playwright/test';
import { reachPaymentStepAsGuest } from '../../utils/checkoutFlow.js';
import checkoutData from '../../test_data/checkout.json' with { type: 'json' };

test.describe('Checkout payment methods @regression', () => {
  test('completes an order with Cash on Delivery @regression', async ({ page }) => {
    const { checkout } = await reachPaymentStepAsGuest(page, checkoutData, 'qa.cod');

    await checkout.payWithCashOnDelivery();

    await expect(checkout.orderConfirmation).toContainText(/thanks for your order/i);
    await expect(checkout.orderConfirmation).toContainText(/INV-\d+/);
  });

  test('completes an order with Credit Card @regression', async ({ page }) => {
    const { checkout } = await reachPaymentStepAsGuest(page, checkoutData, 'qa.creditcard');

    await checkout.payWithCreditCard(checkoutData.creditCard);

    await expect(checkout.orderConfirmation).toContainText(/thanks for your order/i);
    await expect(checkout.orderConfirmation).toContainText(/INV-\d+/);
  });

  test('rejects a credit card number without the required hyphen format @regression', async ({ page }) => {
    const { checkout } = await reachPaymentStepAsGuest(page, checkoutData, 'qa.creditcard.invalid');

    await checkout.paymentMethodSelect.selectOption('Credit Card');
    // No hyphens - violates the required 0000-0000-0000-0000 format.
    await checkout.creditCardNumberInput.fill('4111111111111111');
    await checkout.expirationDateInput.fill(checkoutData.creditCard.expirationDate);
    await checkout.cvvInput.fill(checkoutData.creditCard.cvv);
    await checkout.cardHolderNameInput.fill(checkoutData.creditCard.holderName);

    await expect(checkout.confirmButton).toBeDisabled();
    await expect(page.getByText('Invalid card number format.')).toBeVisible();
  });

  test('completes an order with Gift Card @regression', async ({ page }) => {
    const { checkout } = await reachPaymentStepAsGuest(page, checkoutData, 'qa.giftcard');

    await checkout.payWithGiftCard(checkoutData.giftCard);

    await expect(checkout.orderConfirmation).toContainText(/thanks for your order/i);
    await expect(checkout.orderConfirmation).toContainText(/INV-\d+/);
  });

  test('rejects a gift card number that is not exactly 16 characters @regression', async ({ page }) => {
    const { checkout } = await reachPaymentStepAsGuest(page, checkoutData, 'qa.giftcard.invalid');

    await checkout.paymentMethodSelect.selectOption('Gift Card');
    await checkout.giftCardNumberInput.fill('GIFT-1234-5678-9012'); // hyphens push it over 16 chars
    await checkout.giftCardValidationCodeInput.fill(checkoutData.giftCard.validationCode);

    await expect(checkout.confirmButton).toBeDisabled();
    await expect(page.getByText(/exactly 16 letters/i)).toBeVisible();
  });

  test('completes an order with Buy Now Pay Later @regression', async ({ page }) => {
    const { checkout } = await reachPaymentStepAsGuest(page, checkoutData, 'qa.bnpl');

    await checkout.payWithBuyNowPayLater('3 Monthly Installments');

    await expect(checkout.orderConfirmation).toContainText(/thanks for your order/i);
    await expect(checkout.orderConfirmation).toContainText(/INV-\d+/);
  });
});
