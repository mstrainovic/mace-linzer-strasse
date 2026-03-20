// spec: NPC interaction – walking close and pressing E opens dialog
import { test, expect } from '@playwright/test';
import { skipToGame, setPlayerX } from './helpers';

test.describe('NPC Interaction', () => {
    test('pressing E near Svetlana (X=600) opens dialog', async ({ page }) => {
        await skipToGame(page);
        await setPlayerX(page, 600);
        await page.waitForTimeout(100);

        await page.keyboard.press('e');
        await expect(page.locator('#dialog-box')).toHaveClass(/active/, { timeout: 2000 });
        await expect(page.locator('#dialog-name')).not.toHaveText('???');
    });

    test('dialog shows NPC name and text', async ({ page }) => {
        await skipToGame(page);
        await setPlayerX(page, 600);
        await page.waitForTimeout(100);
        await page.keyboard.press('e');

        await expect(page.locator('#dialog-name')).toContainText('Svetlana');
        await expect(page.locator('#dialog-text')).not.toBeEmpty();
    });

    test('dialog choices are rendered', async ({ page }) => {
        await skipToGame(page);
        await setPlayerX(page, 600);
        await page.waitForTimeout(100);
        await page.keyboard.press('e');

        // Wait for typewriter to finish rendering choices
        await page.waitForTimeout(2000);
        const choices = page.locator('#dialog-choices .dialog-choice');
        await expect(choices.first()).toBeVisible();
    });

    test('pressing E far from NPC does not open dialog', async ({ page }) => {
        await skipToGame(page);
        // Player starts at X=300, far from any NPC
        await page.keyboard.press('e');
        await page.waitForTimeout(300);
        await expect(page.locator('#dialog-box')).not.toHaveClass(/active/);
    });

    test('Vedro NPC (X=900) can be interacted with', async ({ page }) => {
        await skipToGame(page);
        await setPlayerX(page, 900);
        await page.waitForTimeout(100);
        await page.keyboard.press('e');

        await expect(page.locator('#dialog-box')).toHaveClass(/active/, { timeout: 2000 });
        await expect(page.locator('#dialog-name')).toContainText('Vedro');
    });

    test('Oma Gertrude (X=3000) can be interacted with', async ({ page }) => {
        await skipToGame(page);
        await setPlayerX(page, 3000);
        await page.waitForTimeout(100);
        await page.keyboard.press('e');

        await expect(page.locator('#dialog-box')).toHaveClass(/active/, { timeout: 2000 });
        await expect(page.locator('#dialog-name')).toContainText('Oma');
    });
});
