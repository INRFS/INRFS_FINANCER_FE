import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const deliveryFile = fileURLToPath(new URL('../test-results/auth-delivery.jsonl', import.meta.url));
let registeredFinancerCredentials;

async function readOtp(destination) {
  await expect.poll(async () => {
    try {
      const entries = (await readFile(deliveryFile, 'utf8')).trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
      return entries.findLast((entry) => entry.destination === destination && entry.type === 'Otp')?.payload?.code || '';
    } catch {
      return '';
    }
  }, { timeout: 15_000 }).toMatch(/^\d{6}$/);

  const entries = (await readFile(deliveryFile, 'utf8')).trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
  return entries.findLast((entry) => entry.destination === destination && entry.type === 'Otp').payload.code;
}

async function readCredentials(destination) {
  await expect.poll(async () => {
    try {
      const entries = (await readFile(deliveryFile, 'utf8')).trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
      return entries.findLast((entry) => entry.destination === destination && entry.type === 'WelcomeCredentials')?.payload?.password || '';
    } catch { return ''; }
  }, { timeout: 15_000 }).not.toBe('');
  const entries = (await readFile(deliveryFile, 'utf8')).trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
  return entries.findLast((entry) => entry.destination === destination && entry.type === 'WelcomeCredentials').payload;
}

async function enterOtp(page, code) {
  for (const [index, digit] of [...code].entries()) {
    await page.getByLabel(`OTP digit ${index + 1}`).fill(digit);
  }
  await page.getByRole('button', { name: 'Verify OTP' }).click();
}

test('landing page navigation and protected routes are accessible and guarded', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Manage loans, repayments, ledgers, and reports/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Login', exact: true })).toHaveAttribute('href', '/financer/login');
  await expect(page.getByRole('link', { name: 'Create Account', exact: true }).first()).toHaveAttribute('href', '/financer/login?mode=register');
  await expect(page.getByRole('link', { name: 'Admin login' })).toHaveAttribute('href', '/admin/login');
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);

  await page.getByRole('button', { name: 'How do I create a financer account?' }).click();
  await expect(page.getByRole('region', { name: 'How do I create a financer account?' })).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Capabilities', exact: true }).click();
  await expect(page).toHaveURL(/#services$/);
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Everything needed for day-to-day lending operations/ })).toBeVisible();
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);

  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Security', exact: true }).click();
  await expect(page.locator('#security').evaluate((section) => {
    const header = document.querySelector('.landing-header');
    return section.getBoundingClientRect().top >= header.getBoundingClientRect().height - 1;
  })).resolves.toBe(true);

  await page.goto('/financer/login?mode=register');
  await expect(page.getByRole('heading', { name: 'Create your INRFS account' })).toBeVisible();

  await page.goto('/financer/dashboard');
  await expect(page).toHaveURL(/\/financer\/login$/);
  await page.goto('/admin/dashboard');
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('financer registers with OTP and can open core API-backed pages', async ({ page }) => {
  const suffix = Date.now();
  const mobile = `98${String(suffix).slice(-8)}`;
  const email = `financer-${suffix}@e2e.inrfs.test`;

  await page.goto('/financer/login');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByLabel('Full Name').fill('E2E Financer');
  await page.getByLabel('Business / Finance Name').fill('E2E Finance');
  await page.getByLabel('Mobile Number').fill(mobile);
  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('City').fill('Pune');
  await page.getByLabel('State').fill('Maharashtra');
  await page.getByRole('button', { name: 'Send OTP to Verify' }).click();
  await expect(page).toHaveURL(/\/financer\/verify-otp$/);

  await enterOtp(page, await readOtp(mobile));
  await expect(page).toHaveURL(/\/financer\/login$/);
  await expect(page.getByText(/User ID and password have been sent/)).toBeVisible();
  const credentials = await readCredentials(email);
  registeredFinancerCredentials = credentials;
  expect(credentials.userId).toBe(mobile);
  await page.getByLabel('Mobile Number').fill(credentials.userId);
  await page.getByLabel('Password').fill(credentials.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/financer\/welcome$/);
  await page.getByRole('button', { name: /Continue to Dashboard/ }).click();
  await expect(page.getByRole('heading', { name: /Welcome, E2E Financer/ })).toBeVisible();

  const customerName = `Customer ${suffix}`;
  await page.goto('/financer/customers');
  await page.getByRole('button', { name: 'Add Customer' }).click();
  await page.getByLabel('Full Name').fill(customerName);
  await page.getByLabel('Mobile Number').fill(`97${String(suffix).slice(-8)}`);
  await page.getByLabel('Email Address').fill(`customer-${suffix}@e2e.inrfs.test`);
  await page.getByLabel('Date of Birth').fill('1990-09-23');
  await page.getByLabel('Gender').selectOption('Male');
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByLabel('House / Flat Number').fill('12');
  await page.getByLabel('Street').fill('Main Road');
  await page.getByLabel('City').fill('Pune');
  await page.getByLabel('State').fill('Maharashtra');
  await page.getByLabel('PIN Code').fill('411001');
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByLabel('Aadhaar Number').fill('123456789012');
  await page.getByLabel('PAN Number').fill('ABCDE1234F');
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('button', { name: 'Save Customer' }).click();
  await expect(page.getByText(customerName).first()).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);

  for (const [path, heading] of [
    ['/financer/customers', /Customers/],
    ['/financer/loans', /Loan Applications|Loans/],
    ['/financer/payments', /Payments/],
    ['/financer/customer-ledger', /Customer Ledger/],
    ['/financer/reports', /Reports/],
    ['/financer/settings', /Settings/],
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  }

  await page.goto('/financer/support');
  await page.getByRole('button', { name: 'Create Support Ticket' }).click();
  await page.getByLabel('Ticket Subject').fill('E2E support workflow');
  await page.getByLabel('Category').selectOption('Billing');
  await page.getByLabel('Priority').selectOption('High');
  await page.getByLabel('Description').fill('Please verify the complete two-way support workflow.');
  await page.getByRole('button', { name: 'Submit Ticket' }).click();
  await expect(page.getByText('E2E support workflow')).toBeVisible();
  await page.getByRole('button', { name: /E2E support workflow/ }).click();
  await page.getByLabel('Follow-up message').fill('Additional information from the financer.');
  const financerReplyResponse = page.waitForResponse((response) => response.url().includes('/support-tickets/') && response.url().endsWith('/messages'));
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect((await financerReplyResponse).status()).toBe(200);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByLabel('Follow-up message')).toHaveValue('');
  await expect(page.getByText('Additional information from the financer.')).toBeVisible();
});

test('admin completes password and OTP login, then reaches platform workflows', async ({ page }) => {
  const email = 'admin.e2e@inrfs.test';
  await page.goto('/admin/login');
  await page.getByLabel('Email Address').fill(email);
  await page.locator('#admin-password').fill('StrongAdminE2E123!');
  await page.getByRole('button', { name: 'Login to Admin Portal' }).click();
  await expect(page).toHaveURL(/\/admin\/verify-otp$/);

  await enterOtp(page, await readOtp(email));
  await expect(page).toHaveURL(/\/admin\/welcome$/);
  await page.getByRole('button', { name: /Continue to Dashboard/ }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Platform Fee Overview' })).toBeVisible();
  await expect(page.getByText(/System Environment:/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Portal Switcher' })).toHaveCount(0);
  await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);
  await expect(page.locator('.admin-sidebar').evaluate((sidebar) => {
    const bounds = sidebar.getBoundingClientRect();
    return Math.abs(bounds.top) < 1 && Math.abs(bounds.bottom - window.innerHeight) < 1;
  })).resolves.toBe(true);
  await expect(page.locator('.admin-sidebar-nav').evaluate((nav) => {
    const styles = window.getComputedStyle(nav);
    return styles.overflowY === 'auto' && styles.scrollbarWidth === 'none';
  })).resolves.toBe(true);
  await expect(page.locator('.billing-dashboard-table-wrap').evaluate((wrapper) => wrapper.scrollWidth <= wrapper.clientWidth)).resolves.toBe(true);

  for (const [path, heading] of [
    ['/admin/financers', /Financer Institutions/],
    ['/admin/monthly-billing', /Monthly Billing/],
    ['/admin/collections', /Platform Fee Collections/],
    ['/admin/reports', /Platform Reports/],
    ['/admin/support', /Platform Support Desk/],
    ['/admin/operations', /Platform Operations/],
    ['/admin/settings', /System Settings/],
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).resolves.toBe(true);
  }

  await page.goto('/admin/monthly-billing');
  const generatedInvoiceResponse = page.waitForResponse((response) =>
    response.url().includes('/service-charges/invoices/generate') && response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Generate Current Month' }).click();
  const invoiceResponse = await generatedInvoiceResponse;
  expect(invoiceResponse.status()).toBe(200);
  const invoicePayload = await invoiceResponse.json();
  const generatedInvoice = invoicePayload.data ?? invoicePayload;
  expect(generatedInvoice.invoiceNumber).toMatch(/^INV-/);
  await expect(page.getByText(generatedInvoice.invoiceNumber).first()).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'View', exact: true }).first().click();
  const invoiceDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download Demo PDF' }).click();
  expect((await invoiceDownload).suggestedFilename()).toMatch(/-invoice-DEMO\.pdf$/);
  await page.getByRole('button', { name: 'Close', exact: true }).click();

  await page.goto('/admin/settings');
  await page.getByRole('button', { name: 'Administrators' }).click();
  await expect(page.getByRole('heading', { name: 'Add Administrator' })).toBeVisible();
  await expect(page.getByLabel('Email Address')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create Administrator' })).toBeEnabled();

  await page.goto('/admin/support');
  await expect(page.getByText('E2E support workflow')).toBeVisible();
  await page.getByRole('button', { name: 'View and respond' }).click();
  await expect(page.getByText('Additional information from the financer.')).toBeVisible();
  await page.getByLabel('Assigned administrator').selectOption({ index: 1 });
  const assignmentResponse = page.waitForResponse((response) => response.url().endsWith('/assign'));
  await page.getByRole('button', { name: 'Save assignment' }).click();
  await expect((await assignmentResponse).status()).toBe(200);
  await page.getByLabel('Reply to financer').fill('The platform support reply is available.');
  await page.getByRole('button', { name: 'Send reply' }).click();
  await expect(page.getByText('The platform support reply is available.')).toBeVisible();
  await page.getByRole('button', { name: 'Resolve' }).click();
  await expect(page.getByRole('button', { name: 'Reopen' })).toBeVisible();

  await page.goto('/financer/login');
  await page.getByLabel('Mobile Number').fill(registeredFinancerCredentials.userId);
  await page.getByLabel('Password').fill(registeredFinancerCredentials.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/financer\/welcome$/);
  await page.getByRole('button', { name: /Continue to Dashboard/ }).click();
  await page.goto('/financer/support');
  await page.getByRole('button', { name: /E2E support workflow/ }).click();
  await expect(page.getByText('The platform support reply is available.')).toBeVisible();
});
