import { test, expect } from '@playwright/test';

test.describe('Authentication & Dashboard Full User Journey', () => {
  const uniqueTimestamp = Date.now();
  const testUser = {
    name: 'Evelyn Reed',
    updatedName: 'Dr. Evelyn Reed',
    email: `evelyn_${uniqueTimestamp}@testjourney.dev`,
    initialPassword: 'SecretPassword123!',
    newPassword: 'NewSecretPassword456!',
  };

  test('Registration -> Dashboard -> Profile Settings Update -> Password Change -> Logout -> Protected Route Guard -> Login with New Password -> Session Persistence', async ({ page }) => {
    // 1. Visit Register Page
    await page.goto('/register');
    await expect(page).toHaveTitle(/Portify AI/);
    await expect(page.getByRole('heading', { name: /Create your Portify account/i })).toBeVisible();

    // 2. Complete Registration Form
    await page.locator('#name').fill(testUser.name);
    await page.locator('#email').fill(testUser.email);
    await page.locator('#password').fill(testUser.initialPassword);
    await page.locator('#confirmPassword').fill(testUser.initialPassword);
    await page.locator('#register-submit-btn').click();

    // 3. Arrive on Dashboard & Verify Initial Welcome State
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: new RegExp(`Welcome back, ${testUser.name}`, 'i') })).toBeVisible();
    await expect(page.getByText('No portfolios created yet')).toBeVisible();
    await expect(page.getByRole('button', { name: /Profile Settings/i })).toBeVisible();

    // 4. Open Profile Settings Modal & Update Display Name
    await page.getByRole('button', { name: /Profile Settings/i }).click();
    await expect(page.getByText('Account & Profile Settings')).toBeVisible();

    const nameInput = page.locator('#profile-name');
    await expect(nameInput).toHaveValue(testUser.name);
    await nameInput.fill(testUser.updatedName);
    await page.locator('#save-profile-btn').click();

    // Verify modal closes and welcome banner reflects updated name
    await expect(page.getByRole('heading', { name: new RegExp(`Welcome back, ${testUser.updatedName}`, 'i') })).toBeVisible({ timeout: 5000 });

    // 5. Open Profile Settings Modal & Change Password
    await page.getByRole('button', { name: /Profile Settings/i }).click();
    await page.locator('#security-tab-btn').click();

    await page.locator('#profile-current-password').fill(testUser.initialPassword);
    await page.locator('#profile-new-password').fill(testUser.newPassword);
    await page.locator('#profile-confirm-password').fill(testUser.newPassword);
    await page.locator('#change-password-btn').click();

    // Verify password change completes and modal closes
    await expect(page.getByText('Account & Profile Settings')).not.toBeVisible({ timeout: 5000 });

    // 6. Sign Out
    const signOutBtn = page.locator('#sign-out-btn');
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();

    // Arrive at homepage & verify logged out
    await page.waitForURL(/\//);
    await expect(page.getByRole('link', { name: 'Sign in' }).first()).toBeVisible();

    // 7. Test Protected Route Guard
    // Navigating directly to /dashboard while unauthenticated must redirect to /login
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Sign in to Portify AI/i })).toBeVisible();

    // 8. Attempt Login with Old Password (Must Fail)
    await page.locator('#email').fill(testUser.email);
    await page.locator('#password').fill(testUser.initialPassword);
    await page.locator('#login-submit-btn').click();

    await expect(page.getByText(/Invalid email or password/i)).toBeVisible({ timeout: 5000 });

    // 9. Login with New Password (Must Succeed)
    await page.locator('#password').fill(testUser.newPassword);
    await page.locator('#login-submit-btn').click();

    // Arrive on Dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: new RegExp(`Welcome back, ${testUser.updatedName}`, 'i') })).toBeVisible();

    // 10. Session Persistence on Browser Refresh
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: new RegExp(`Welcome back, ${testUser.updatedName}`, 'i') })).toBeVisible();
  });
});
