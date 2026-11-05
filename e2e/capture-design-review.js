import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const STAGE = process.env.CAPTURE_STAGE || 'before';
const OUTPUT_DIR = path.resolve(`test-results/design-review/${STAGE}`);
const ARTIFACT_DIR = path.resolve('C:/Users/Asus/.gemini/antigravity/brain/227da430-1621-496a-87b6-84f5068c4b32');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runCapture() {
  console.log(`=== Starting Design Review Capture [Stage: ${STAGE.toUpperCase()}] ===`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const timestamp = Date.now();
  const user = {
    name: 'Elena Rostova',
    email: `designer_${STAGE}_${timestamp}@portify.dev`,
    password: 'DesignPassword123!',
  };

  // Helper to save screenshot both to test-results and artifact directory
  async function saveScreenshot(name, isMobile = false) {
    const filename = `${STAGE}-${name}.png`;
    const localPath = path.join(OUTPUT_DIR, `${name}.png`);
    const artifactPath = path.join(ARTIFACT_DIR, filename);

    await page.screenshot({ path: localPath, fullPage: true });
    fs.copyFileSync(localPath, artifactPath);
    console.log(`  ✓ Saved: ${name} (${isMobile ? '375px mobile' : '1440px desktop'}) -> ${filename}`);
  }

  // 1. Landing Page
  console.log('1. Capturing Landing Page...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await saveScreenshot('landing-desktop');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);
  await saveScreenshot('landing-mobile', true);

  // 2. Register & Dashboard
  console.log('2. Registering & Capturing Dashboard...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/register');
  await page.getByLabel(/Full Name/i).fill(user.name);
  await page.getByLabel(/Email Address/i).fill(user.email);
  await page.locator('#password').fill(user.password);
  await page.locator('#confirmPassword').fill(user.password);
  await page.locator('#register-submit-btn').click();

  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await saveScreenshot('dashboard-desktop');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);
  await saveScreenshot('dashboard-mobile', true);

  // 3. Upload Sample Resume & Studio Editor
  console.log('3. Uploading Resume & Capturing Studio Editor...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/upload');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Load Sample Engineering Resume/i }).click();
  await page.getByRole('button', { name: /Generate Portfolio Website/i }).click();

  await page.waitForURL(/\/editor\//, { timeout: 25000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await saveScreenshot('editor-desktop');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);
  await saveScreenshot('editor-mobile', true);

  // Get portfolio id and slug
  const currentUrl = page.url();
  const portfolioId = currentUrl.split('/editor/')[1].split('/')[0].split('?')[0];

  // Publish the portfolio so public link is live
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: /Theme & Publish/i }).click();
  await page.waitForTimeout(500);

  const publishedCheckbox = page.locator('input[type="checkbox"]').last();
  if (!(await publishedCheckbox.isChecked())) {
    await publishedCheckbox.check();
  }
  const slugInput = page.getByLabel(/Custom Public URL Slug/i);
  const slug = await slugInput.inputValue();
  await page.getByRole('button', { name: /Save Draft/i }).click();
  await page.waitForTimeout(1000);

  const publicUrl = `http://localhost:5173/p/${slug}`;
  console.log(`Portfolio Public URL: ${publicUrl}`);

  // 4. Capture all 5 themes on the live public URL
  const themes = [
    { id: 'minimal-pro', name: 'Minimal Pro' },
    { id: 'dark-developer', name: 'Dark Developer' },
    { id: 'creative-gradient', name: 'Creative Gradient' },
    { id: 'corporate-elite', name: 'Corporate Elite' },
    { id: 'modern-glass', name: 'Modern Glass' },
  ];

  for (const theme of themes) {
    console.log(`4. Theme: ${theme.name}...`);
    // Select theme in editor and save
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`http://localhost:5173/editor/${portfolioId}`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Theme & Publish/i }).click();
    await page.waitForTimeout(300);
    await page.getByText(theme.name).first().click();
    await page.getByRole('button', { name: /Save Draft/i }).click();
    await page.waitForTimeout(800);

    // Navigate to live public route
    await page.goto(publicUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    await saveScreenshot(`theme-${theme.id}-desktop`);

    // Mobile view of live public route
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(400);
    await saveScreenshot(`theme-${theme.id}-mobile`, true);
  }

  await browser.close();
  console.log(`=== Design Review Capture [Stage: ${STAGE.toUpperCase()}] Complete! ===`);
}

runCapture().catch((err) => {
  console.error('Capture script error:', err);
  process.exit(1);
});

