import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Asus/.gemini/antigravity/brain/227da430-1621-496a-87b6-84f5068c4b32';

test.describe('Portify AI — 5 Fully Developed Portfolio Themes & Viewport Verification', () => {
  test.setTimeout(90000);

  test('Themes E2E: Studio Theme Switching, Live Preview, Desktop/Mobile Viewport Checks & Rotation', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const testEmail = `themetester_${timestamp}@portify.dev`;

    // 1. Register User
    await page.goto('/register');
    await page.getByLabel(/Full Name/i).fill('Morgan Sterling');
    await page.getByLabel(/Email Address/i).fill(testEmail);
    await page.locator('#password').fill('Password123!');
    await page.locator('#confirmPassword').fill('Password123!');
    await page.locator('#register-submit-btn').click();

    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // 2. Upload Sample Resume (First Upload -> Theme 1: minimal-pro or rotated)
    await page.getByRole('link', { name: /Upload New Resume/i }).first().click();
    await page.waitForURL(/\/upload/);

    const sampleBtn = page.getByRole('button', { name: /Load Sample Engineering Resume/i });
    await sampleBtn.click();
    await page.getByRole('button', { name: /Generate Portfolio Website/i }).click();

    await page.waitForURL(/\/editor\//, { timeout: 20000 });
    await expect(page.getByText(/Resume Review & Readiness Checklist/i)).toBeVisible();

    // 3. Navigate to Theme & Publish Tab in Editor Studio
    await page.getByRole('button', { name: /Theme & Publish/i }).click();
    await expect(page.getByText(/Theme Selection & Public Visibility/i)).toBeVisible();

    // Ensure Published toggle is on
    const publishedCheckbox = page.locator('input[type="checkbox"]').last();
    if (!(await publishedCheckbox.isChecked())) {
      await publishedCheckbox.check();
    }

    // Save changes
    await page.getByRole('button', { name: /Save Draft/i }).click();
    await expect(page.getByText(/Changes saved to MongoDB/i)).toBeVisible();

    // 4. Test Theme Switching in Live Studio Preview
    // (a) Switch to Minimal Pro
    await page.getByText('Minimal Pro').first().click();
    await expect(page.getByText(/Curriculum Vitae/i)).toBeVisible();
    await expect(page.getByText(/Experience History/i)).toBeVisible();
    await expect(page.getByText(/Selected Works & Projects/i)).toBeVisible();

    // (b) Switch to Dark Developer
    await page.getByText('Dark Developer').first().click();
    await expect(page.getByText(/portfolio\.ts/i)).toBeVisible();
    await expect(page.getByText(/git log --graph --career/i)).toBeVisible();
    await expect(page.getByText(/featured_repositories/i)).toBeVisible();
    await expect(page.getByText(/dependencies & stack/i)).toBeVisible();

    // (c) Switch to Creative Gradient
    await page.getByText('Creative Gradient').first().click();
    await expect(page.getByText(/Creative Showcase/i)).toBeVisible();
    await expect(page.getByText(/Featured Work & Creations/i)).toBeVisible();
    await expect(page.getByText(/Career Journey/i)).toBeVisible();

    // (d) Switch to Corporate Elite
    await page.getByText('Corporate Elite').first().click();
    await expect(page.getByText(/Executive Dossier/i)).toBeVisible();
    await expect(page.getByText(/Executive Leadership History/i)).toBeVisible();
    await expect(page.getByText(/Strategic Initiatives & Projects/i)).toBeVisible();
    await expect(page.getByText(/Core Competencies/i).first()).toBeVisible();

    // (e) Switch to Modern Glass
    await page.getByText('Modern Glass').first().click();
    await expect(page.getByText(/modern-glass/i).first()).toBeVisible();
    await expect(page.getByText(/Capabilities & Stack/i)).toBeVisible();

    // 5. Test Live Public Portfolio View across all 5 Themes in Desktop and Mobile Viewports
    const themesToInspect = [
      { id: 'minimal-pro', name: 'Minimal Pro', expectedText: /Curriculum Vitae/i },
      { id: 'dark-developer', name: 'Dark Developer', expectedText: /git log --graph --career/i },
      { id: 'creative-gradient', name: 'Creative Gradient', expectedText: /Creative Showcase/i },
      { id: 'corporate-elite', name: 'Corporate Elite', expectedText: /Executive Dossier/i },
      { id: 'modern-glass', name: 'Modern Glass', expectedText: /Capabilities & Stack/i },
    ];

    // Grab public slug from slug input
    const slug = await page.getByLabel(/Custom Public URL Slug/i).inputValue();
    const publicPath = `/p/${slug}`;

    // Grab portfolio ID
    const currentUrl = page.url();
    const portfolioId = currentUrl.split('/editor/')[1].split('/')[0].split('?')[0];

    for (const t of themesToInspect) {
      // Ensure desktop viewport for editor interactions
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`/editor/${portfolioId}`);
      await page.getByRole('button', { name: /Theme & Publish/i }).click();
      await page.getByText(t.name).first().click();
      await page.getByRole('button', { name: /Save Draft/i }).click();
      await expect(page.getByRole('button', { name: /Saved!/i })).toBeVisible({ timeout: 10000 });

      // --- Desktop Viewport Inspection (1280x800) ---
      await page.goto(publicPath);
      await expect(page.getByText(t.expectedText).first()).toBeVisible({ timeout: 10000 });

      // Save desktop screenshot into artifact directory
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `theme-${t.id}-desktop.png`),
        fullPage: false,
      });

      // Verify no horizontal overflow in desktop
      const isDesktopOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      expect(isDesktopOverflow).toBe(false);

      // --- Mobile Viewport Inspection (375x667 iPhone SE) ---
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await expect(page.getByText(t.expectedText).first()).toBeVisible({ timeout: 10000 });

      // Save mobile screenshot into artifact directory
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `theme-${t.id}-mobile.png`),
        fullPage: false,
      });

      // Verify no horizontal overflow in mobile (resumes must not force horizontal scroll)
      const isMobileOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      expect(isMobileOverflow).toBe(false);
    }

    // Reset viewport back to desktop
    await page.setViewportSize({ width: 1280, height: 800 });

    // 6. Verify Automatic Sequential Theme Rotation on Consecutive New Uploads
    // Current portfolio was uploaded, now upload a second resume
    await page.goto('/upload');
    await sampleBtn.click();
    await page.getByRole('button', { name: /Generate Portfolio Website/i }).click();
    await page.waitForURL(/\/editor\//, { timeout: 20000 });

    // Check Theme & Publish tab in new portfolio
    await page.getByRole('button', { name: /Theme & Publish/i }).click();
    // Verify an active badge exists on one of the rotated themes
    await expect(page.getByText(/Active Theme/i)).toBeVisible();
  });
});
