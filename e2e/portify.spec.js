import { test, expect } from '@playwright/test';

test.describe('Portify AI End-to-End User Journeys', () => {
  test('Complete journey: Landing -> Demo Sign In -> Dashboard -> Upload Resume -> Studio Live Preview -> Public View', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto('/');
    await expect(page).toHaveTitle(/Portify AI/);
    await expect(page.getByRole('heading', { name: /Your Resume, Your Identity/i })).toBeVisible();

    // Test Theme Selector on Landing Page
    const darkDevBtn = page.getByRole('button', { name: 'Dark Developer' });
    await expect(darkDevBtn).toBeVisible();
    await darkDevBtn.click();
    await expect(page.getByText('portfolio.ts')).toBeVisible();

    // 2. Authentication Flow
    await page.getByRole('link', { name: 'Sign in' }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Sign in to Portify AI' })).toBeVisible();

    // Click 1-Click Demo Sign In
    const demoBtn = page.getByRole('button', { name: '1-Click Demo Sign In' });
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // Redirection to Dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/Welcome back/i)).toBeVisible();

    // 3. Navigate to Upload Resume
    await page.getByRole('link', { name: 'Upload New Resume' }).first().click();
    await page.waitForURL(/\/upload/);
    await expect(page.getByText('Upload Your Resume')).toBeVisible();

    // Load sample engineering resume
    const sampleResumeBtn = page.getByRole('button', { name: 'Load Sample Engineering Resume' });
    await expect(sampleResumeBtn).toBeVisible();
    await sampleResumeBtn.click();

    // Verify ready to parse
    await expect(page.getByText(/Ready to parse/i)).toBeVisible();

    // Click Generate Portfolio Website
    const generateBtn = page.getByRole('button', { name: 'Generate Portfolio Website' });
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Verify Studio Editor loads with live preview
    await page.waitForURL(/\/editor\//, { timeout: 20000 });
    await expect(page.getByText('Alexander Vance').first()).toBeVisible({ timeout: 10000 });

    // Open Personal Info tab
    await page.getByRole('button', { name: /1\. Personal Info/i }).click();

    // Verify Personal details tab inputs
    const fullNameInput = page.locator('input[value="Alexander Vance"]');
    await expect(fullNameInput).toBeVisible();

    // Test Responsive Device Viewports in Studio
    await page.getByTitle('Tablet view (768px)').click();
    await page.getByTitle('Mobile view (375px)').click();
    await page.getByTitle('Desktop view (100%)').click();

    // Switch to Theme Tab
    await page.getByRole('button', { name: /Theme & Publish/i }).click();
    await expect(page.getByText('Select Portfolio Theme')).toBeVisible();

    // Switch to Modern Glass theme
    const modernGlassOption = page.getByText('Modern Glass').first();
    await modernGlassOption.click();

    // Save changes
    const saveBtn = page.getByRole('button', { name: 'Save Changes' });
    await saveBtn.click();
    await expect(page.getByText(/Saved to MongoDB!/i)).toBeVisible({ timeout: 10000 });

    // 5. Public Portfolio Verification
    // Get public URL link from top of editor
    const publicLink = page.locator('a[href*="/p/"]').first();
    await expect(publicLink).toBeVisible();
    const publicUrl = await publicLink.getAttribute('href');
    expect(publicUrl).toContain('/p/');

    // Navigate to the public portfolio
    await page.goto(publicUrl);
    await expect(page.getByText('Alexander Vance').first()).toBeVisible();
    await expect(page.getByText('Portify AI').first()).toBeVisible();
    await expect(page.getByText('Senior Full Stack Engineer').first()).toBeVisible();
  });
});
