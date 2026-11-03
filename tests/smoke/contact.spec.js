// @ts-check
import { test, expect } from '@playwright/test';
import { ContactPage } from '../../pages/ContactPage.js';
import contactData from '../../test_data/contact.json' with { type: 'json' };

test.describe('Contact Us @smoke', () => {
  test('submits the contact form with valid data @smoke', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();

    await contactPage.fillForm(contactData.validMessage);
    await contactPage.submit();

    await expect(contactPage.successAlert).toBeVisible();
    await expect(contactPage.successAlert).toContainText('Thanks for your message');
  });
});
