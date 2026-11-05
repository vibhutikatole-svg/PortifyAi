import { chromium } from '@playwright/test';
import path from 'path';

async function captureInspection() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log('1. Navigating to Landing Page...');
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');

  const title = await page.title();
  console.log('   Page Title:', title);

  const screenshotPath = path.resolve('test-results/landing-inspection.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('   ✓ Screenshot saved to:', screenshotPath);

  // Check Design System elements
  const h1Text = await page.locator('h1').first().innerText();
  console.log('   Hero Heading:', h1Text.replace(/\n/g, ' '));

  const buttons = await page.locator('button').allInnerTexts();
  console.log('   Available Interactive Buttons:', buttons.filter(Boolean));

  await browser.close();
}

captureInspection().catch(err => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
