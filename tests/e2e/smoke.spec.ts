import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Public pages', () => {
  test('landing page renders the hero and primary CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /carbon hiding in your day/i })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /start free/i }).first()
    ).toBeVisible();
  });

  test('landing page has no detectable a11y violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('signup page is keyboard-labeled and a11y-clean', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('login page is keyboard-labeled and a11y-clean', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('a keyboard skip-link is the first focusable element', async ({
    page,
  }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveText(/skip to main content/i);
    await expect(focused).toHaveAttribute('href', '#main-content');
  });

  test('client-side validation announces an invalid email', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByText(/valid email address/i)).toBeVisible();
  });
});
