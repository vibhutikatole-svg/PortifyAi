import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';

const ARTIFACT_DIR = 'C:/Users/Asus/.gemini/antigravity/brain/227da430-1621-496a-87b6-84f5068c4b32';

test.describe('Portify AI — Comprehensive Senior QA Visual & Responsive Audit', () => {
  test('Visual inspection of Landing, Dashboard, Studio Editor, All 5 Themes, and Standalone Offline ZIP', async ({
    page,
  }) => {
    test.setTimeout(90000);

    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore expected React Router future flag warnings if logged as errors
        if (!text.includes('React Router Future Flag Warning')) {
          consoleErrors.push(text);
        }
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    // -------------------------------------------------------------
    // 1. LANDING PAGE AUDIT (Desktop & Mobile)
    // -------------------------------------------------------------
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Verify Title & Key Visual Elements
    await expect(page).toHaveTitle(/Portify AI/);
    const heroH1 = page.locator('h1').first();
    await expect(heroH1).toBeVisible();

    // Verify Navigation Bar
    const brandLink = page.getByRole('link', { name: /Portify\.ai/i }).first();
    await expect(brandLink).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Build Portfolio/i }).first()).toBeVisible();

    // Check Landing Zero Horizontal Overflow on Desktop
    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(desktopOverflow).toBe(true);

    // Save Landing Desktop Screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'audit-landing-desktop.png'),
      fullPage: false,
    });

    // Landing Page Mobile Viewport Check
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(mobileOverflow).toBe(true);

    // -------------------------------------------------------------
    // 2. AUTHENTICATION & DASHBOARD AUDIT
    // -------------------------------------------------------------
    await page.setViewportSize({ width: 1280, height: 800 });
    const timestamp = Date.now();
    const auditUser = {
      name: 'Auditor Vance',
      email: `audit_lead_${timestamp}@portify.dev`,
      password: 'AuditPassword123!',
    };

    // Register
    await page.goto('/register');
    await page.getByLabel(/Full Name/i).fill(auditUser.name);
    await page.getByLabel(/Email Address/i).fill(auditUser.email);
    await page.locator('#password').fill(auditUser.password);
    await page.locator('#confirmPassword').fill(auditUser.password);
    await page.locator('#register-submit-btn').click();

    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(new RegExp(`Welcome back, ${auditUser.name}`, 'i'))).toBeVisible();

    // Verify Dashboard Metrics Cards (Total Portfolios, Published Live Slugs, Total Portfolio Views)
    await expect(page.getByText(/Total Portfolios/i)).toBeVisible();
    await expect(page.getByText(/Published Live/i)).toBeVisible();
    await expect(page.getByText(/Total Portfolio Views/i)).toBeVisible();

    // Capture Dashboard Screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'audit-dashboard-desktop.png'),
      fullPage: false,
    });

    // -------------------------------------------------------------
    // 3. RESUME UPLOAD & STUDIO MULTI-SECTION EDITOR AUDIT
    // -------------------------------------------------------------
    await page.getByRole('link', { name: /Upload New Resume/i }).first().click();
    await page.waitForURL(/\/upload/);

    // Load Sample Engineering Resume
    const sampleBtn = page.getByRole('button', { name: /Load Sample Engineering Resume/i });
    await expect(sampleBtn).toBeVisible();
    await sampleBtn.click();
    await page.getByRole('button', { name: /Generate Portfolio Website/i }).click();

    await page.waitForURL(/\/editor\//, { timeout: 25000 });
    await expect(page.getByText(/Resume Review & Readiness Checklist/i)).toBeVisible();

    // Verify 9 Section Navigation Tabs in Studio
    const expectedTabs = [
      '1. Personal Info',
      '2. Summary',
      '3. Skills',
      '4. Education',
      '5. Experience',
      '6. Projects',
      '7. Certifications',
      '8. Achievements',
      '9. Social Links',
    ];
    for (const tab of expectedTabs) {
      await expect(page.getByRole('button', { name: new RegExp(tab, 'i') }).first()).toBeVisible();
    }

    // Capture Studio Review & Editor Screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'audit-editor-desktop.png'),
      fullPage: false,
    });

    // Focus Editor Viewport Test
    const focusBtn = page.getByRole('button', { name: /Focus Editor/i });
    await focusBtn.click();
    await expect(page.getByRole('button', { name: /Split View/i })).toBeVisible();
    await page.getByRole('button', { name: /Split View/i }).click();

    // -------------------------------------------------------------
    // 4. ALL 5 THEMES VISUAL AUDIT & VIEWPORT COMPLIANCE
    // -------------------------------------------------------------
    const themesToAudit = [
      { id: 'minimal-pro', name: 'Minimal Pro', landmark: /Experience History/i },
      { id: 'dark-developer', name: 'Dark Developer', landmark: /git log --graph --career/i },
      { id: 'creative-gradient', name: 'Creative Gradient', landmark: /Creative Showcase/i },
      { id: 'corporate-elite', name: 'Corporate Elite', landmark: /Executive Leadership History/i },
      { id: 'modern-glass', name: 'Modern Glass', landmark: /Capabilities & Stack/i },
    ];

    await page.getByRole('button', { name: /Theme & Publish/i }).click();

    for (const theme of themesToAudit) {
      // Select theme card in Studio
      await page.getByText(theme.name).first().click();
      await page.waitForTimeout(400);

      // Verify theme landmark in Live Preview frame
      await expect(page.getByText(theme.landmark).first()).toBeVisible({ timeout: 5000 });

      // Capture Theme Screenshot
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `audit-theme-${theme.id}.png`),
        fullPage: false,
      });

      // Test mobile simulation in Studio Device Switcher
      const mobileBtn = page.getByRole('button', { name: /Mobile/i }).first();
      await mobileBtn.click();
      await page.waitForTimeout(300);
      await expect(page.getByText(theme.landmark).first()).toBeVisible();

      // Reset to Desktop Simulator
      await page.getByRole('button', { name: /Desktop/i }).first().click();
    }

    // -------------------------------------------------------------
    // 5. STANDALONE OFFLINE ZIP EXPORT & LOCAL DISK AUDIT
    // -------------------------------------------------------------
    // Download ZIP
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download ZIP/i }).first().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.zip$/);

    const tempZipPath = path.resolve('test-results/audit-export.zip');
    const extractDir = path.resolve('test-results/audit-unzipped');
    await download.saveAs(tempZipPath);
    expect(fs.existsSync(tempZipPath)).toBe(true);

    // Unpack ZIP
    const zipData = fs.readFileSync(tempZipPath);
    const unzipped = await JSZip.loadAsync(zipData);

    // Verify all 6 required files
    const requiredFiles = ['index.html', 'style.css', 'script.js', 'qrcode.png', 'README.md', 'portfolio.json'];
    for (const file of requiredFiles) {
      expect(unzipped.file(file), `Expected ${file} in ZIP`).not.toBeNull();
    }

    // Extract to disk
    if (fs.existsSync(extractDir)) {
      fs.rmSync(extractDir, { recursive: true, force: true });
    }
    fs.mkdirSync(extractDir, { recursive: true });

    for (const [filename, fileObj] of Object.entries(unzipped.files)) {
      if (!fileObj.dir) {
        const content = await fileObj.async('nodebuffer');
        fs.writeFileSync(path.join(extractDir, filename), content);
      }
    }

    // Load extracted index.html via file:// protocol
    const offlineHtmlPath = path.join(extractDir, 'index.html');
    expect(fs.existsSync(offlineHtmlPath)).toBe(true);

    await page.goto(`file://${offlineHtmlPath.replace(/\\/g, '/')}`);
    await page.waitForLoadState('domcontentloaded');

    // Verify all key sections render offline
    await expect(page.getByRole('heading', { name: /Alexander Vance/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Senior Software Engineer|git log|Experience/i).first()).toBeVisible();
    await expect(page.getByText(/CloudScale Monitoring Dashboard|featured_repositories|Projects/i).first()).toBeVisible();
    await expect(page.getByText(/JavaScript|TypeScript|dependencies & stack|Capabilities|Skills/i).first()).toBeVisible();
    await expect(page.getByText(/Bachelor of Science|academic_background|Education/i).first()).toBeVisible();
    await expect(page.locator('img[src="qrcode.png"]')).toBeVisible();
    await expect(page.getByText(/Portify AI/i).first()).toBeVisible();

    // Verify offline responsive behavior (Zero overflow on desktop and mobile)
    await page.setViewportSize({ width: 1280, height: 800 });
    const offlineDesktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(offlineDesktopOverflow).toBe(true);

    await page.setViewportSize({ width: 375, height: 667 });
    const offlineMobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(offlineMobileOverflow).toBe(true);

    // Capture Offline Standalone Website Screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'audit-offline-zip.png'),
      fullPage: false,
    });

    // -------------------------------------------------------------
    // 6. CONSOLE ERRORS & PAGE ERRORS AUDIT
    // -------------------------------------------------------------
    expect(pageErrors, `Unexpected uncaught page errors: ${pageErrors.join(', ')}`).toHaveLength(0);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join(', ')}`).toHaveLength(0);
  });
});
