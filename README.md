# Toolshop E2E Test Automation (Playwright)

[![Playwright Tests](https://github.com/<your-username>/<repo-name>/actions/workflows/playwright.yml/badge.svg)](https://github.com/<your-username>/<repo-name>/actions/workflows/playwright.yml)

End-to-end UI test suite for [Practice Software Testing – Toolshop](https://practicesoftwaretesting.com), a demo e-commerce store built for test-automation practice. Written in JavaScript with [Playwright Test](https://playwright.dev), using the Page Object Model and run in CI on Chromium, Firefox and WebKit.

Locators are based on the live site's real structure. Pages were explored with [Playwright MCP](https://github.com/microsoft/playwright-mcp) (AI-assisted browser exploration) before writing the page objects.

## What's covered

**32 tests**, run on 3 browsers (96 runs per full suite).

| Area | Smoke (`@smoke`) | Regression (`@regression`) |
|---|---|---|
| Catalog | Home page loads, search works | Search results, price sort (both directions), category / brand / eco-friendly filters |
| Product detail | Add to cart | Quantity limits (1–99), favourite while logged out, product comparison |
| Cart & checkout | Guest checkout and logged-in checkout, end to end | Change quantity, remove item, continue shopping, invalid guest email, required billing fields |
| Payment methods | Bank Transfer (in both smoke checkouts) | Cash on Delivery, Credit Card, Gift Card, Buy Now Pay Later, card-number format errors |
| Authentication | Register, log in, invalid login, log out, forgot password | — |
| Contact | Submit the contact form | — |

## Project structure

```
├── pages/                  # Page objects: one class per page (locators + actions)
│   ├── HeaderComponent.js  # Shared nav bar, used by every page object
│   ├── CatalogPage.js
│   ├── ProductPage.js
│   ├── CheckoutPage.js     # Cart → sign-in/guest → address → payment wizard
│   └── ...
├── tests/
│   ├── smoke/              # Critical-path checks, tagged @smoke
│   └── regression/         # Deeper coverage and negative cases, tagged @regression
├── test_data/              # JSON inputs: user template, addresses, payment details
├── utils/                  # Shared helpers (unique emails, checkout setup)
├── .github/workflows/      # GitHub Actions CI
└── playwright.config.js
```

## Getting started

**Requirements:** Node.js 20 or newer.

```bash
npm ci                        # install dependencies
npx playwright install        # download the browsers
```

### Running tests

```bash
npx playwright test                          # full suite, all browsers
npx playwright test --grep @smoke            # smoke tests only
npx playwright test --grep @regression       # regression tests only
npx playwright test --project=chromium       # one browser
npx playwright test tests/smoke/login.spec.js  # one file
npx playwright test --ui                     # interactive UI mode
npx playwright show-report                   # open the last HTML report
```

## Design decisions

- **Page Object Model.** Locators and actions live in `pages/`; assertions live only in the specs. When the UI changes, a page object needs updating, not every test.
- **Stable locators only.** The site exposes `data-test` attributes, so the config sets `testIdAttribute: 'data-test'` and tests use `getByTestId`, `getByRole` and `getByText`. No CSS class or XPath selectors.
- **Independent, parallel-safe tests.** Each test registers its own user with a unique email (`utils/testDataGenerator.js`) and does not depend on any other test or on pre-existing accounts.
- **No credentials in specs.** All inputs come from `test_data/`.
- **Assert outcomes, not steps.** Tests check what the user ends up seeing (URL, confirmation text, invoice number, cart state), not that each click happened.
- **Written for a shared, live backend.** The site is a public demo with real stock. Checkout tests pick a random product, and the worker count is capped (`2` locally, `1` in CI) so parallel orders don't run a product out of stock mid-run.
- **Explicit waits for async behaviour.** The address form fills street/city from an external lookup, and the checkout's "Confirm" is a two-step action. Page objects wait for these states rather than using fixed timeouts.

## Continuous integration

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs the full suite on every push and pull request to `main`/`master`:

1. Checks out the code and sets up Node.js (LTS)
2. Installs dependencies (`npm ci`) and Playwright browsers
3. Runs all tests on Chromium, Firefox and WebKit, with 2 retries on failure
4. Uploads the HTML report as a build artifact (kept 30 days)

To view a report: open the workflow run on the **Actions** tab, download `playwright-report`, unzip it, and run `npx playwright show-report <folder>`.

## Roadmap

- [ ] Account area: profile update, change password, favourites, invoices, messages
- [ ] Validation: registration errors, account lockout, contact form errors
- [ ] Catalog: name sort, pagination, empty search, category and Rentals pages, language switch
- [ ] Custom fixtures and saved login state (`storageState`)
- [ ] API-based test setup for faster runs
- [ ] Migrate to TypeScript

## Tech stack

Playwright Test · JavaScript (ES modules) · Node.js · GitHub Actions · Playwright MCP
