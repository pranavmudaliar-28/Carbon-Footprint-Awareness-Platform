import { test, expect } from '@playwright/test';

/**
 * Full critical path: signup → onboarding → log → dashboard updates → accept
 * action (spec §13). Requires a real Supabase project with email confirmation
 * DISABLED and the DB seeded. Enable by setting E2E_SUPABASE_READY=1.
 */
test.describe('Critical path (requires live Supabase)', () => {
  test.skip(
    !process.env.E2E_SUPABASE_READY,
    'Set E2E_SUPABASE_READY=1 with a seeded Supabase project to run.'
  );

  test('a new user can sign up, log, and see their footprint', async ({
    page,
  }) => {
    const email = `e2e+${Date.now()}@verda.test`;
    const password = 'verda-test-pass-123';

    // Sign up
    await page.goto('/signup');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /create account/i }).click();

    // Onboarding
    await expect(page).toHaveURL(/\/onboarding/);
    await page.getByRole('button', { name: /see my starting point/i }).click();

    // Dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Track a petrol-car entry (chip-based pickers)
    await page.goto('/track');
    await page.getByRole('button', { name: 'Transport' }).click();
    await page.getByRole('button', { name: 'Petrol car' }).click();
    await page.getByLabel(/Amount/).fill('100');
    // Live preview: 100 km × 0.17 = 17 kg
    await expect(page.getByText('17 kg CO₂e')).toBeVisible();
    await page.getByRole('button', { name: /track activity/i }).click();

    // Dashboard reflects the entry
    await page.goto('/dashboard');
    await expect(page.getByText(/By category/i)).toBeVisible();

    // Accept an action
    await page.goto('/actions');
    await page
      .getByRole('button', { name: /accept/i })
      .first()
      .click();
    await expect(page.getByText(/marked done|projected footprint/i)).toBeVisible();
  });
});
