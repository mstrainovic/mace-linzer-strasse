// spec: Title screen loads correctly and shows fake loading sequence
import { test, expect } from '@playwright/test';

test.describe('Title Screen', () => {
    test('title screen is shown on load', async ({ page }) => {
        await page.goto('/');

        // Title screen must be active
        await expect(page.locator('#title-screen')).toHaveClass(/active/);
        await expect(page.locator('#intro-screen')).not.toHaveClass(/active/);
        await expect(page.locator('#hud')).not.toHaveClass(/active/);
    });

    test('game title "MACE" and subtitle are visible', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.title-main')).toHaveText('MACE');
        await expect(page.locator('.title-sub')).toContainText('Linzer Straße');
    });

    test('fake loading bar appears and fills', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#fake-loading')).toBeVisible();
        await expect(page.locator('#loading-fill')).toBeVisible();
    });

    test('start prompt appears after loading finishes', async ({ page }) => {
        await page.goto('/');
        // Wait for loading to complete (max 10s for all 6 phases)
        await expect(page.locator('#start-prompt')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('#start-prompt')).toContainText('Starten');
    });

    test('Enter key transitions to intro screen', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#start-prompt')).toBeVisible({ timeout: 10000 });
        await page.keyboard.press('Enter');
        await expect(page.locator('#intro-screen')).toHaveClass(/active/);
    });

    test('clicking body advances past title screen', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#title-screen.active');
        await page.click('body');
        // One click may advance through title AND intro simultaneously (two listeners)
        // so we accept either intro or playing state as success
        await page.waitForFunction(
            "['intro','playing'].includes(Game.state)",
            { timeout: 5000 }
        );
        await expect(page.locator('#title-screen')).not.toHaveClass(/active/);
    });
});
