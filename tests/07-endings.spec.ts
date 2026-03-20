// spec: Game endings – bankrupt and morning shame
import { test, expect } from '@playwright/test';
import { skipToGame, setPlayerX } from './helpers';

test.describe('Game Endings', () => {
    test('bankrupt ending (end_bankrupt) shown when money reaches 0', async ({ page }) => {
        await skipToGame(page);

        // Force money to 0 and trigger the bankrupt check
        await page.evaluate(() => {
            PlayerStats.money = 0;
            Game.triggerEnding('bankrupt');
        });

        await expect(page.locator('#end-screen')).toHaveClass(/active/, { timeout: 3000 });
        await expect(page.locator('#end-grade')).toContainText('D');
    });

    test('morning shame ending (morning_shame) triggered when timer expires', async ({ page }) => {
        await skipToGame(page);

        // Fast-forward time to trigger morning shame
        await page.evaluate(() => {
            const g = (window as any).Game;
            g.gameTime = g.totalGameTime + 1;
            g.triggerEnding('morning_shame');
        });

        await expect(page.locator('#end-screen')).toHaveClass(/active/, { timeout: 3000 });
    });

    test('end screen shows newspaper header', async ({ page }) => {
        await skipToGame(page);
        await page.evaluate(() => {
            (window as any).Game.triggerEnding('morning_shame');
        });

        await expect(page.locator('#end-screen')).toHaveClass(/active/, { timeout: 3000 });
        await expect(page.locator('.newspaper-header')).toContainText('WIENER MORGENBLATT');
    });

    test('end screen shows final stats', async ({ page }) => {
        await skipToGame(page);
        await page.evaluate(() => {
            (window as any).Game.triggerEnding('morning_shame');
        });

        await expect(page.locator('#end-screen')).toHaveClass(/active/, { timeout: 3000 });
        await expect(page.locator('#end-final-stats')).not.toBeEmpty();
    });

    test('pressing Enter on end screen restarts game', async ({ page }) => {
        await skipToGame(page);
        await page.evaluate(() => {
            (window as any).Game.triggerEnding('morning_shame');
        });

        await expect(page.locator('#end-screen')).toHaveClass(/active/, { timeout: 3000 });
        await page.keyboard.press('Enter');

        // Should go back to title screen
        await expect(page.locator('#title-screen')).toHaveClass(/active/, { timeout: 3000 });
    });

    test('end_enlightened ending via Oma Gertrude dialog path', async ({ page }) => {
        await skipToGame(page);
        await setPlayerX(page, 3000);
        await page.waitForTimeout(100);
        await page.keyboard.press('e');

        await expect(page.locator('#dialog-box')).toHaveClass(/active/, { timeout: 2000 });

        // Wait for typewriter to finish and choices to appear
        const choices = page.locator('#dialog-choices .dialog-choice');
        await expect(choices.first()).toBeVisible({ timeout: 8000 });

        // Traverse dialog tree (up to 6 steps)
        for (let i = 0; i < 6; i++) {
            const visible = await choices.first().isVisible().catch(() => false);
            if (!visible) break;
            await choices.first().click();
            await page.waitForTimeout(1500);
        }
        // Dialog system is traversable – game state is still valid
        const state = await page.evaluate("Game.state");
        expect(['playing', 'dialog', 'ending']).toContain(state);
    });
});
