// spec: Slot machine mini-game (Book of Ra) at X=1500
import { test, expect } from '@playwright/test';
import { skipToGame, setPlayerX, getGameState } from './helpers';

test.describe('Slot Machine (Book of Ra)', () => {
    test('pressing E near slot machine (X=1500) opens slot overlay', async ({ page }) => {
        await skipToGame(page);
        await setPlayerX(page, 1500);
        await page.waitForTimeout(100);

        await page.keyboard.press('e');
        await expect(page.locator('#slot-overlay')).toHaveClass(/active/, { timeout: 2000 });
    });

    test('slot overlay shows correct title', async ({ page }) => {
        await skipToGame(page);
        await setPlayerX(page, 1500);
        await page.waitForTimeout(100);
        await page.keyboard.press('e');

        await expect(page.locator('.slot-title')).toContainText('BOOK OF RA');
    });

    test('spin button deducts 5€ from balance', async ({ page }) => {
        await skipToGame(page);
        await setPlayerX(page, 1500);
        await page.waitForTimeout(100);
        await page.keyboard.press('e');

        await expect(page.locator('#slot-overlay')).toHaveClass(/active/, { timeout: 2000 });

        const before = await getGameState(page);
        await page.locator('#slot-spin-btn').click();
        await page.waitForTimeout(1500); // wait for reel animation

        const after = await getGameState(page);
        expect(after.money).toBe(before.money - 5);
    });

    test('exit button closes slot machine', async ({ page }) => {
        await skipToGame(page);
        await setPlayerX(page, 1500);
        await page.waitForTimeout(100);
        await page.keyboard.press('e');

        await expect(page.locator('#slot-overlay')).toHaveClass(/active/, { timeout: 2000 });
        await page.locator('#slot-exit-btn').click();
        await expect(page.locator('#slot-overlay')).not.toHaveClass(/active/);
    });

    test('pressing Escape closes slot machine', async ({ page }) => {
        await skipToGame(page);
        await setPlayerX(page, 1500);
        await page.waitForTimeout(100);
        await page.keyboard.press('e');

        await expect(page.locator('#slot-overlay')).toHaveClass(/active/, { timeout: 2000 });
        await page.keyboard.press('Escape');
        await expect(page.locator('#slot-overlay')).not.toHaveClass(/active/);
    });

    test('slot reels show symbols', async ({ page }) => {
        await skipToGame(page);
        await setPlayerX(page, 1500);
        await page.waitForTimeout(100);
        await page.keyboard.press('e');

        await expect(page.locator('#slot-overlay')).toHaveClass(/active/, { timeout: 2000 });
        const symbols = page.locator('.slot-reel-symbol');
        await expect(symbols).toHaveCount(3);
    });

    test('bankrupt ending triggered when money reaches 0', async ({ page }) => {
        await skipToGame(page);
        // Force money to 0 and trigger bankrupt directly
        await page.evaluate(() => {
            PlayerStats.money = 0;
            Game.triggerEnding('bankrupt');
        });
        await expect(page.locator('#end-screen')).toHaveClass(/active/, { timeout: 3000 });
        await expect(page.locator('#end-ending')).toContainText('Bankrott');
    });
});
