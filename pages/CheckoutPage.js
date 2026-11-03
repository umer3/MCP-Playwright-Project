// @ts-check
import { expect } from '@playwright/test';
import { HeaderComponent } from './HeaderComponent.js';

/**
 * Checkout wizard (/checkout): Cart -> Sign in/Guest -> Billing Address -> Payment.
 * All four steps are mounted in the DOM at once (Angular stepper), so
 * locators are scoped to the currently-visible step where ambiguous.
 */
export class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.header = new HeaderComponent(page);

    // Step 1: Cart
    this.cartTotal = page.getByTestId('cart-total');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.proceedFromCartButton = page.getByTestId('proceed-1');

    // Step 2: Sign in / Continue as Guest
    this.signInTab = page.getByRole('tab', { name: 'Sign in' });
    this.guestTab = page.getByRole('tab', { name: 'Continue as Guest' });
    this.guestEmailInput = page.getByTestId('guest-email');
    this.guestFirstNameInput = page.getByTestId('guest-first-name');
    this.guestLastNameInput = page.getByTestId('guest-last-name');
    this.guestSubmitButton = page.getByTestId('guest-submit');
    this.guestEmailError = page.getByTestId('guest-email-error');
    this.proceedFromGuestButton = page.getByTestId('proceed-2-guest');
    this.loginEmailInput = page.getByTestId('email');
    this.loginPasswordInput = page.getByTestId('password');
    this.loginSubmitButton = page.getByTestId('login-submit');
    this.proceedAsLoggedInButton = page.getByTestId('proceed-2');

    // Step 3: Billing Address
    this.countrySelect = page.getByTestId('country');
    this.postalCodeInput = page.getByTestId('postal_code');
    this.houseNumberInput = page.getByTestId('house_number');
    this.streetInput = page.getByTestId('street');
    this.proceedFromAddressButton = page.getByTestId('proceed-3');

    // Step 4: Payment
    this.paymentMethodSelect = page.getByTestId('payment-method');
    this.bankNameInput = page.getByTestId('bank_name');
    this.accountNameInput = page.getByTestId('account_name');
    this.accountNumberInput = page.getByTestId('account_number');
    this.creditCardNumberInput = page.getByTestId('credit_card_number');
    this.expirationDateInput = page.getByTestId('expiration_date');
    this.cvvInput = page.getByTestId('cvv');
    this.cardHolderNameInput = page.getByTestId('card_holder_name');
    this.giftCardNumberInput = page.getByTestId('gift_card_number');
    this.giftCardValidationCodeInput = page.getByTestId('validation_code');
    this.monthlyInstallmentsSelect = page.getByTestId('monthly_installments');
    this.confirmButton = page.getByTestId('finish');
    this.paymentSuccessMessage = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.locator('#order-confirmation');
  }

  async goto() {
    await this.page.goto('/checkout');
  }

  cartRow(productName) {
    return this.page.getByRole('row', { name: new RegExp(productName) });
  }

  quantityInputFor(productName) {
    return this.cartRow(productName).getByRole('spinbutton');
  }

  lineTotalFor(productName) {
    return this.cartRow(productName).getByRole('cell').nth(3);
  }

  async setQuantity(productName, quantity) {
    const input = this.quantityInputFor(productName);
    // The cart-total (grand total) only recalculates from real per-keystroke
    // typing followed by blur - .fill() sets the value programmatically and
    // doesn't fire the same event sequence, so the total silently goes stale.
    // (The per-row line total does update on .fill(), which is what made
    // this easy to miss - only the summary total was wrong.)
    await input.click();
    await input.selectText();
    await input.pressSequentially(String(quantity));
    await input.press('Tab');
    await this.page.waitForLoadState('networkidle');
  }

  async removeItem(productName) {
    // The remove control is an <a class="btn-danger"> with no href and no
    // accessible name/role (a real accessibility gap in the app), so there's
    // no getByRole/getByTestId option here - scope the class to the row.
    await this.cartRow(productName).locator('a.btn-danger').click();
    await this.page.waitForLoadState('networkidle');
  }

  async proceedFromCart() {
    await this.proceedFromCartButton.click();
  }

  async continueAsGuest(guest) {
    await this.guestTab.click();
    await this.guestEmailInput.fill(guest.email);
    await this.guestFirstNameInput.fill(guest.firstName);
    await this.guestLastNameInput.fill(guest.lastName);
    await this.guestSubmitButton.click();
    await this.proceedFromGuestButton.click();
  }

  async continueAsLoggedIn() {
    await expect(this.proceedAsLoggedInButton).toBeVisible();
    await this.proceedAsLoggedInButton.click();
  }

  async fillBillingAddress(address) {
    await this.countrySelect.selectOption(address.country);
    await this.postalCodeInput.fill(address.postalCode);
    await this.houseNumberInput.fill(address.houseNumber);
    // Street/city/state auto-fill from an async address lookup (an external
    // API call that can be slow, especially under concurrent test load);
    // wait for it before proceeding, otherwise "Proceed to checkout" stays disabled.
    await expect(this.streetInput).not.toHaveValue('', { timeout: 15000 });
  }

  async proceedFromAddress() {
    await expect(this.proceedFromAddressButton).toBeEnabled();
    await this.proceedFromAddressButton.click();
  }

  /**
   * The wizard's "Confirm" click is a two-stage action: the first click
   * validates and shows an inline "Payment was successful" message; a
   * second click actually advances to the order-confirmation screen.
   */
  async confirmPayment() {
    await expect(this.confirmButton).toBeEnabled();
    await this.confirmButton.click();
    await expect(this.paymentSuccessMessage).toBeVisible();
    await this.confirmButton.click();
    await expect(this.orderConfirmation).toBeVisible();
  }

  async payWithBankTransfer(bankDetails) {
    await this.paymentMethodSelect.selectOption('Bank Transfer');
    await this.bankNameInput.fill(bankDetails.bankName);
    await this.accountNameInput.fill(bankDetails.accountName);
    await this.accountNumberInput.fill(bankDetails.accountNumber);
    await this.confirmPayment();
  }

  async payWithCashOnDelivery() {
    await this.paymentMethodSelect.selectOption('Cash on Delivery');
    await this.confirmPayment();
  }

  async payWithCreditCard(card) {
    await this.paymentMethodSelect.selectOption('Credit Card');
    // Card number must be hyphenated as 0000-0000-0000-0000, or the form
    // shows "Invalid card number format." and Confirm stays disabled.
    await this.creditCardNumberInput.fill(card.cardNumber);
    await this.expirationDateInput.fill(card.expirationDate);
    await this.cvvInput.fill(card.cvv);
    await this.cardHolderNameInput.fill(card.holderName);
    await this.confirmPayment();
  }

  async payWithGiftCard(giftCard) {
    await this.paymentMethodSelect.selectOption('Gift Card');
    // Must be exactly 16 letters/digits with no separators, or Confirm
    // stays disabled with "Please enter a valid gift card number".
    await this.giftCardNumberInput.fill(giftCard.cardNumber);
    await this.giftCardValidationCodeInput.fill(giftCard.validationCode);
    await this.confirmPayment();
  }

  async payWithBuyNowPayLater(installmentPlan) {
    await this.paymentMethodSelect.selectOption('Buy Now Pay Later');
    await this.monthlyInstallmentsSelect.selectOption(installmentPlan);
    await this.confirmPayment();
  }
}
