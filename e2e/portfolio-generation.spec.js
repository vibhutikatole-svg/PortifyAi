import { test, expect } from '@playwright/test';

test.describe('Portify AI Portfolio Generation Engine & AI Enhancement E2E Journey', () => {
  test('Complete Flow: Upload -> Review -> AI Polish & Generation Modal -> Diff Review -> Apply Selected Enhancements -> Live Preview Verification -> Manual Edit Protection on Regeneration -> Public Portfolio', async ({
    page,
  }) => {
    test.setTimeout(90000);
    const timestamp = Date.now();
    const testEmail = `generator_tester_${timestamp}@portify.dev`;

    // 1. Register candidate user
    await page.goto('/register');
    await page.getByLabel(/Full Name/i).fill('Dante Rivera');
    await page.getByLabel(/Email Address/i).fill(testEmail);
    await page.locator('#password').fill('Password123!');
    await page.locator('#confirmPassword').fill('Password123!');
    await page.locator('#register-submit-btn').click();

    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // 2. Upload Sample Resume
    await page.getByRole('link', { name: /Upload New Resume/i }).first().click();
    await page.waitForURL(/\/upload/);

    const sampleBtn = page.getByRole('button', { name: /Load Sample Engineering Resume/i });
    await sampleBtn.click();
    await page.getByRole('button', { name: /Generate Portfolio Website/i }).click();

    await page.waitForURL(/\/editor\//, { timeout: 20000 });
    await expect(page.getByText(/Resume Review & Readiness Checklist/i)).toBeVisible();

    // 3. Open AI Polish & Generation Modal from Overview Tab
    const aiPolishBtn = page.getByRole('button', { name: /Enhance Descriptions & Grammar/i });
    await expect(aiPolishBtn).toBeVisible();
    await aiPolishBtn.click();

    // Verify Modal opens and displays diff comparisons
    await expect(
      page.getByRole('heading', { name: /AI Portfolio Content Enhancer & Generator/i })
    ).toBeVisible();

    // Wait for analysis to complete and diff to appear
    await expect(page.getByText(/Hero Headline/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/About \/ Professional Summary/i)).toBeVisible();
    await expect(page.getByText(/Work Experience Highlights/i)).toBeVisible();

    // 4. Test "Regenerate Suggestions" button inside modal
    const regenBtn = page.getByRole('button', { name: /Regenerate Suggestions/i });
    await expect(regenBtn).toBeVisible();
    await regenBtn.click();
    await expect(page.getByText(/Hero Headline/i)).toBeVisible({ timeout: 15000 });

    // 5. Apply Selected Improvements
    const applyBtn = page.getByRole('button', { name: /Apply Selected Improvements/i });
    await expect(applyBtn).toBeEnabled();
    await applyBtn.click();

    // Verify modal closes
    await expect(
      page.getByRole('heading', { name: /AI Portfolio Content Enhancer & Generator/i })
    ).toBeHidden();

    // Verify auto-saved to MongoDB
    await expect(page.getByRole('button', { name: /Saved to MongoDB!/i })).toBeVisible({ timeout: 10000 });

    // 6. Test Manual Edit Protection on Regeneration
    // Navigate to Section 1: Personal Info and make a custom manual edit
    await page.getByRole('button', { name: /1\. Personal Info/i }).click();
    const headlineInput = page.getByLabel(/Professional Headline/i);
    await headlineInput.fill('Protected Lead Systems Engineer');

    // Save the manual edit
    await page.getByRole('button', { name: /Save Changes/i }).click();
    await expect(page.getByRole('button', { name: /Saved to MongoDB!/i })).toBeVisible();

    // Now re-open AI Polish Modal from Top Toolbar
    const topAIBtn = page.getByRole('button', { name: /AI Polish & Generate/i });
    await topAIBtn.click();
    await expect(page.getByText(/Hero Headline/i)).toBeVisible({ timeout: 15000 });

    // Uncheck "Hero Headline" so the user explicitly keeps their manual edit!
    const headlineCheckbox = page.locator('input[type="checkbox"]').first();
    await headlineCheckbox.uncheck();
    await expect(headlineCheckbox).not.toBeChecked();

    // Apply the other improvements
    await page.getByRole('button', { name: /Apply Selected Improvements/i }).click();
    await expect(page.getByRole('button', { name: /Saved to MongoDB!/i })).toBeVisible();

    // Verify that the manually edited headline was strictly PROTECTED and preserved:
    await expect(headlineInput).toHaveValue('Protected Lead Systems Engineer');

    // 7. Verify Public Live Portfolio View reflects the generated content
    const publicUrlLink = page.locator('a[href*="/p/"]').first();
    const href = await publicUrlLink.getAttribute('href');
    await page.goto(href);

    // Verify public view loads with candidate name and preserved headline
    await expect(page.getByRole('heading', { name: /Dante Rivera|Alexander Vance/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Protected Lead Systems Engineer/i).first()).toBeVisible();
  });
});
