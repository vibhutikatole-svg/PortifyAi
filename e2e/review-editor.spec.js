import { test, expect } from '@playwright/test';

test.describe('Resume Review & Multi-Section Editing Full Browser Journey', () => {
  test('Complete Review & Edit Journey: Upload -> Review Overview -> Multi-Section Edits (Add/Edit/Remove) -> Continue Flow -> Save to MongoDB -> Refresh Persistence Verification -> Public View', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `reviewer_${timestamp}@playwright.portify.dev`;

    // 1. Visit Register Page and create a new test user
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /Create your Portify account/i })).toBeVisible();

    await page.getByLabel(/Full Name/i).fill('Elena Rostova');
    await page.getByLabel(/Email Address/i).fill(testEmail);
    await page.locator('#password').fill('Password123!');
    await page.locator('#confirmPassword').fill('Password123!');
    await page.locator('#register-submit-btn').click();

    // 2. Arrive at Dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/Welcome back/i)).toBeVisible();

    // 3. Navigate to Upload Page
    await page.getByRole('link', { name: /Upload New Resume/i }).first().click();
    await page.waitForURL(/\/upload/);
    await expect(page.getByText(/Upload Your Resume/i)).toBeVisible();

    // Load sample resume document
    const sampleResumeBtn = page.getByRole('button', { name: /Load Sample Engineering Resume/i });
    await expect(sampleResumeBtn).toBeVisible();
    await sampleResumeBtn.click();
    await expect(page.getByText(/Ready to parse/i)).toBeVisible();

    // Click Generate Portfolio Website to trigger upload and parse
    const generateBtn = page.getByRole('button', { name: /Generate Portfolio Website/i });
    await generateBtn.click();

    // 4. Arrive at Review & Editor Studio
    await page.waitForURL(/\/editor\//, { timeout: 20000 });
    await expect(page.getByText(/Resume Review & Readiness Checklist/i)).toBeVisible({ timeout: 10000 });

    // Verify Review Overview displays all 9 sections
    await expect(page.getByText(/1\. Personal Information/i).first()).toBeVisible();
    await expect(page.getByText(/2\. Professional Summary/i).first()).toBeVisible();
    await expect(page.getByText(/3\. Skills/i).first()).toBeVisible();
    await expect(page.getByText(/4\. Education/i).first()).toBeVisible();
    await expect(page.getByText(/5\. Work Experience/i).first()).toBeVisible();
    await expect(page.getByText(/6\. Featured Projects/i).first()).toBeVisible();
    await expect(page.getByText(/7\. Certifications/i).first()).toBeVisible();
    await expect(page.getByText(/8\. Key Achievements/i).first()).toBeVisible();
    await expect(page.getByText(/9\. Social/i).first()).toBeVisible();

    // 5. Test Section 1: Personal Information (Edit & Validation)
    await page.getByRole('button', { name: /1\. Personal Info/i }).click();
    await expect(page.getByText(/Section 1: Personal Information/i)).toBeVisible();

    const nameInput = page.getByLabel(/Full Name \*/i);
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue('Alexander Vance');

    // Edit full name
    await nameInput.fill('Dr. Alexander Vance, PhD');
    await expect(nameInput).toHaveValue('Dr. Alexander Vance, PhD');

    // Test input validation: clear name
    await nameInput.fill('');
    await expect(page.getByText(/Full Name is required for your portfolio/i)).toBeVisible();

    // Restore valid name
    await nameInput.fill('Dr. Alexander Vance, PhD');

    // Click Continue to Next Section
    const continueBtn = page.getByRole('button', { name: /Continue to Next Section/i });
    await continueBtn.click();

    // 6. Test Section 2: Professional Summary
    await expect(page.getByText(/Section 2: Professional Summary/i)).toBeVisible({ timeout: 10000 });
    const summaryTextarea = page.locator('textarea').first();
    await summaryTextarea.fill('Distinguished software architect with 10+ years engineering resilient cloud platforms.');

    // Click Continue
    await continueBtn.click();

    // 7. Test Section 3: Skills (Add Soft Skill & New Category)
    await expect(page.getByText(/Section 3: Skills & Competencies/i)).toBeVisible({ timeout: 10000 });

    // Add suggested soft skill: Mentoring
    const mentoringChip = page.getByRole('button', { name: /\+ Mentoring/i });
    if (await mentoringChip.isVisible()) {
      await mentoringChip.click();
      await expect(page.getByText('Mentoring').first()).toBeVisible();
    }

    // Add new skill category
    const catInput = page.getByPlaceholder(/Add category/i);
    await catInput.fill('Cloud & Distributed Systems');
    await page.getByRole('button', { name: /Add Category/i }).click();
    await expect(page.locator('input[value="Cloud & Distributed Systems"]')).toBeVisible();

    // Click Continue
    await continueBtn.click();

    // 8. Test Section 4: Education (Add New Degree)
    await expect(page.getByText(/Section 4: Education/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /Add Degree/i }).click();
    await expect(page.getByText(/Degree #2/i)).toBeVisible();

    // Click Continue
    await continueBtn.click();

    // 9. Test Section 5: Experience
    await expect(page.getByText(/Section 5: Work Experience/i)).toBeVisible({ timeout: 10000 });
    await continueBtn.click();

    // 10. Test Section 6: Projects
    await expect(page.getByText(/Section 6: Featured Projects/i)).toBeVisible({ timeout: 10000 });
    await continueBtn.click();

    // 11. Test Section 7: Certifications (Add New Record)
    await expect(page.getByText(/Section 7: Certifications & Licenses/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /Add Certification/i }).click();

    const certNameInput = page.getByPlaceholder(/AWS Certified Solutions Architect/i).first();
    await certNameInput.fill('AWS Solutions Architect Professional');

    const certIssuerInput = page.getByPlaceholder(/Amazon Web Services/i).first();
    await certIssuerInput.fill('Amazon Web Services');

    // Click Continue
    await continueBtn.click();

    // 12. Test Section 8: Key Achievements (Add Record)
    await expect(page.getByText(/Section 8: Key Achievements/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /Add Achievement/i }).click();

    const achTextarea = page.getByPlaceholder(/Awarded Outstanding Graduate/i).first();
    await achTextarea.fill('Keynote Speaker at Distributed Systems Summit 2024');

    // Click Continue
    await continueBtn.click();

    // 13. Test Section 9: Social Links
    await expect(page.getByText(/Section 9: Social Links/i)).toBeVisible({ timeout: 10000 });
    const ghInput = page.getByPlaceholder(/github\.com\/yourusername/i);
    await ghInput.fill('https://github.com/alexvance-phd');

    // 14. Save Changes to MongoDB
    const saveBtn = page.getByRole('button', { name: /Save Changes/i });
    await saveBtn.click();
    await expect(page.getByText(/Saved to MongoDB!/i)).toBeVisible({ timeout: 10000 });

    // 15. VERIFY REFRESH PERSISTENCE (Reload page and verify all edits survive)
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify name remains persisted in title
    await expect(page.getByText(/Dr\. Alexander Vance, PhD/i).first()).toBeVisible({ timeout: 10000 });

    // Verify Personal Info input after refresh
    await page.getByRole('button', { name: /1\. Personal Info/i }).click();
    const persistedNameInput = page.getByLabel(/Full Name \*/i);
    await expect(persistedNameInput).toHaveValue('Dr. Alexander Vance, PhD');

    // Verify Certifications remain persisted after refresh
    await page.getByRole('button', { name: /7\. Certifications/i }).click();
    await expect(page.locator('input[value="AWS Solutions Architect Professional"]')).toBeVisible();

    // Verify Achievements remain persisted after refresh
    await page.getByRole('button', { name: /8\. Achievements/i }).click();
    await expect(page.getByText(/Keynote Speaker at Distributed Systems Summit 2024/i).first()).toBeVisible();

    // Verify Soft Skills remain persisted after refresh
    await page.getByRole('button', { name: /3\. Skills/i }).click();
    await expect(page.getByText('Mentoring').first()).toBeVisible();

    // 16. Verify Public Portfolio View
    const publicLink = page.locator('a[href*="/p/"]').first();
    const publicUrl = await publicLink.getAttribute('href');
    expect(publicUrl).toContain('/p/');

    await page.goto(publicUrl);
    await expect(page.getByText('Dr. Alexander Vance, PhD').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/AWS Solutions Architect Professional/i).first()).toBeVisible();
    await expect(page.getByText(/Keynote Speaker at Distributed Systems Summit 2024/i).first()).toBeVisible();
  });
});
