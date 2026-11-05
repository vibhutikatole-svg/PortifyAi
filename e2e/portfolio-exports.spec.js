import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import JSZip from 'jszip';

test.describe('Portify AI — Complete Portfolio Export Systems E2E', () => {
  test('Complete Flow: Live Portfolio (Slug, Live Render, Updates, Copy-Link, QR, Unpublish Protection) & Standalone Offline ZIP Export (Generation, Extraction, All Sections, Responsive, Theme Preservation)', async ({
    page,
    browser,
  }) => {
    test.setTimeout(90000);
    const timestamp = Date.now();
    const testEmail = `export_user_${timestamp}@portify.dev`;
    const customSlug = `export-live-${timestamp}`;

    // 1. Register candidate user
    await page.goto('/register');
    await page.getByLabel(/Full Name/i).fill('Cassian Vance');
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

    // Add a Certification in Section 7
    await page.getByRole('button', { name: /7\. Certifications/i }).click();
    await page.getByRole('button', { name: /Add Certification/i }).first().click();
    await page.getByLabel(/Certification Name/i).first().fill('AWS Certified Solutions Architect Professional');

    // Add an Achievement in Section 8
    await page.getByRole('button', { name: /8\. Achievements/i }).click();
    await page.getByRole('button', { name: /Add Achievement/i }).first().click();
    await page.locator('textarea').first().fill('Keynote Speaker at TechCon 2023');

    // 3. Customize Slug and Theme on Theme & Publish Tab
    await page.getByRole('button', { name: /Theme & Publish/i }).click();
    await expect(page.getByText(/Theme Selection & Public Visibility/i)).toBeVisible();

    // Set custom unique slug
    const slugInput = page.getByLabel(/Custom Public URL Slug/i);
    await slugInput.fill(customSlug);

    // Select Creative Gradient theme
    await page.getByText('Creative Gradient').first().click();

    // Save changes to MongoDB
    await page.getByRole('button', { name: /Save Draft/i }).click();
    await expect(page.getByRole('button', { name: /Saved!/i })).toBeVisible({ timeout: 10000 });

    // 4. Test Copy-Link in Editor Header
    const copyBtn = page.getByTitle(/Copy Public Portfolio Link/i);
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(page.getByText(/Copied!/i)).toBeVisible();

    // 5. Test QR Code Modal in Editor
    const qrModalBtn = page.getByTitle(/Share & QR Code/i);
    await qrModalBtn.click();
    await expect(page.getByRole('heading', { name: /Portfolio QR Code/i })).toBeVisible();
    await expect(page.getByText(customSlug).first()).toBeVisible();
    await page.keyboard.press('Escape');

    // 6. Test Live Public Portfolio Route (/p/:slug)
    const publicPath = `/p/${customSlug}`;
    await page.goto(publicPath);

    // Verify live page renders candidate name and Creative Gradient theme landmark
    await expect(page.getByRole('heading', { name: /Alexander Vance|Cassian Vance/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Creative Showcase/i)).toBeVisible();
    await expect(page.getByText(/Career Journey/i)).toBeVisible();

    // Verify top branding bar actions
    const publicCopyBtn = page.getByRole('button', { name: /Copy Link/i });
    await expect(publicCopyBtn).toBeVisible();
    await publicCopyBtn.click();
    await expect(page.getByText(/Link Copied!/i)).toBeVisible();

    // 7. Test Theme Update Reflection on Live Route
    // Go back to editor, switch to Corporate Elite, save, and reload public page
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /Studio/i }).first().click();
    await page.waitForURL(/\/editor\//);

    await page.getByRole('button', { name: /Theme & Publish/i }).click();
    await page.getByText('Corporate Elite').first().click();
    await page.getByRole('button', { name: /Save Draft/i }).click();
    await expect(page.getByRole('button', { name: /Saved!/i })).toBeVisible({ timeout: 10000 });

    // Navigate to public page and verify Corporate Elite theme is immediately rendered!
    await page.goto(publicPath);
    await expect(page.getByText(/Executive Dossier/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Executive Leadership History/i)).toBeVisible();

    // 8. Test Unpublished Protection
    // In editor, toggle isPublished to OFF
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /Studio/i }).first().click();
    await page.waitForURL(/\/editor\//);
    await page.getByRole('button', { name: /Theme & Publish/i }).click();

    // Uncheck Public Visibility checkbox
    const visibilityCheckbox = page.locator('input[type="checkbox"]').last();
    if (await visibilityCheckbox.isChecked()) {
      await visibilityCheckbox.uncheck();
    }
    await page.getByRole('button', { name: /Save Draft/i }).click();
    await expect(page.getByRole('button', { name: /Saved!/i })).toBeVisible({ timeout: 10000 });

    // (a) Unauthenticated guest context: should receive 404 / "Portfolio Unavailable"
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto(publicPath);
    await expect(guestPage.getByRole('heading', { name: /Portfolio Unavailable/i })).toBeVisible({ timeout: 10000 });
    await expect(guestPage.getByText(/private/i)).toBeVisible();
    await guestContext.close();

    // (b) Logged-in owner context: should show Draft Preview banner with "Publish to Live Web" button
    await page.goto(publicPath);
    await expect(page.getByText(/Draft Preview \(Private\)/i)).toBeVisible({ timeout: 10000 });
    const publishBtn = page.getByRole('button', { name: /Publish to Live Web/i });
    await expect(publishBtn).toBeVisible();

    // Click Publish to Live Web
    await publishBtn.click();
    await expect(page.getByText(/Draft Preview \(Private\)/i)).toBeHidden({ timeout: 10000 });

    // Verify it is published again for guests
    const guestContext2 = await browser.newContext();
    const guestPage2 = await guestContext2.newPage();
    await guestPage2.goto(publicPath);
    await expect(guestPage2.getByText(/Executive Dossier/i)).toBeVisible({ timeout: 10000 });
    await guestContext2.close();

    // ===================================================================
    // 9. STANDALONE OFFLINE ZIP EXPORT: GENERATION, EXTRACTION & BROWSER CHECK
    // ===================================================================
    // Trigger ZIP export download from the public page top bar
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.getByRole('link', { name: /ZIP Export/i }).click(),
    ]);

    // Save the downloaded zip
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portify-e2e-zip-'));
    const zipFilePath = path.join(tempDir, 'exported.zip');
    await download.saveAs(zipFilePath);

    // Verify ZIP exists and has realistic file size (> 5KB)
    expect(fs.existsSync(zipFilePath)).toBe(true);
    const zipStats = fs.statSync(zipFilePath);
    expect(zipStats.size).toBeGreaterThan(5000);

    // Extract the ZIP contents to disk
    const zipData = fs.readFileSync(zipFilePath);
    const unzipped = await JSZip.loadAsync(zipData);
    const extractedDir = path.join(tempDir, 'extracted');
    fs.mkdirSync(extractedDir, { recursive: true });

    for (const fileName of Object.keys(unzipped.files)) {
      const content = await unzipped.file(fileName).async('nodebuffer');
      fs.writeFileSync(path.join(extractedDir, fileName), content);
    }

    // Verify required standalone files exist on disk
    expect(fs.existsSync(path.join(extractedDir, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(extractedDir, 'style.css'))).toBe(true);
    expect(fs.existsSync(path.join(extractedDir, 'script.js'))).toBe(true);
    expect(fs.existsSync(path.join(extractedDir, 'qrcode.png'))).toBe(true);
    expect(fs.existsSync(path.join(extractedDir, 'README.md'))).toBe(true);
    expect(fs.existsSync(path.join(extractedDir, 'portfolio.json'))).toBe(true);

    // Open index.html directly via file:// URL in Playwright (testing 100% offline functionality)
    const fileUrl = `file://${path.resolve(extractedDir, 'index.html').replace(/\\/g, '/')}`;
    await page.goto(fileUrl);

    // 10. Check all sections in standalone offline HTML:
    // Section 1: Hero & Personal Info
    await expect(page.getByRole('heading', { name: /Alexander Vance|Cassian Vance/i }).first()).toBeVisible({ timeout: 10000 });
    // Section 2: Summary
    await expect(page.getByText(/Executive Summary/i)).toBeVisible();
    // Section 3: Skills
    await expect(page.getByText(/Core Competencies/i)).toBeVisible();
    // Section 4: Education
    await expect(page.getByText(/Higher Education & Degrees/i)).toBeVisible();
    // Section 5: Experience
    await expect(page.getByText(/Executive Leadership History/i)).toBeVisible();
    // Section 6: Projects
    await expect(page.getByText(/Strategic Initiatives & Projects/i)).toBeVisible();
    // Section 7: Certifications
    await expect(page.getByText(/Credentials & Licenses/i)).toBeVisible();
    // Section 8: Achievements
    await expect(page.getByText(/Board Recognitions & Key Achievements/i)).toBeVisible();
    // Section 9: QR Code
    const qrImage = page.locator('img[src="qrcode.png"]');
    await expect(qrImage).toBeVisible();

    // 11. Check Responsive Behavior in Offline Website
    // (a) Desktop (1280x800)
    await page.setViewportSize({ width: 1280, height: 800 });
    const isDesktopOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 2;
    });
    expect(isDesktopOverflow).toBe(false);

    // (b) Mobile Viewport (375x667 iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });
    const isMobileOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 2;
    });
    expect(isMobileOverflow).toBe(false);

    // Clean up temporary files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore temp cleanup errors on Windows
    }
  });
});
