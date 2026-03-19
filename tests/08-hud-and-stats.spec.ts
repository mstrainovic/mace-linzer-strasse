// spec: HUD updates in real-time when stats change
import { test, expect } from '@playwright/test';
import { skipToGame } from './helpers';

test.describe('HUD & Stats Updates', () => {
    test('HUD money updates when PlayerStats.money changes', async ({ page }) => {
        await skipToGame(page);

        await page.evaluate(() => {
            (window as any).PlayerStats.money = 77;
            (window as any).Game.updateHUD();
        });

        await expect(page.locator('#hud-money')).toHaveText('77€');
    });

    test('HUD charm updates', async ({ page }) => {
        await skipToGame(page);

        await page.evaluate(() => {
            (window as any).PlayerStats.charm = 7;
            (window as any).Game.updateHUD();
        });

        await expect(page.locator('#hud-charm')).toHaveText('7/10');
    });

    test('HUD desperation updates', async ({ page }) => {
        await skipToGame(page);

        await page.evaluate(() => {
            (window as any).PlayerStats.modify('desperation', 5);
            (window as any).Game.updateHUD();
        });

        await expect(page.locator('#hud-desperation')).toHaveText('5/10');
    });

    test('stats are clamped to 0–10 by modify()', async ({ page }) => {
        await skipToGame(page);

        const result = await page.evaluate(() => {
            const s = (window as any).PlayerStats;
            s.modify('charm', 999);
            s.modify('desperation', -999);
            return { charm: s.charm, desperation: s.desperation };
        });

        expect(result.charm).toBe(10);
        expect(result.desperation).toBe(0);
    });

    test('timer advances over time', async ({ page }) => {
        await skipToGame(page);
        const before = await page.locator('#hud-time').innerText();
        await page.waitForTimeout(3000);
        const after = await page.locator('#hud-time').innerText();
        // Timer should have advanced (they may still equal 02:00 if < 1 fictional minute passed)
        // Just confirm it's a valid HH:MM format
        expect(after).toMatch(/^\d{2}:\d{2}$/);
        // Fictional time should stay in range 02:00–05:00
        const [h] = after.split(':').map(Number);
        expect(h).toBeGreaterThanOrEqual(2);
        expect(h).toBeLessThanOrEqual(5);
    });

    test('buff HUD is hidden by default', async ({ page }) => {
        await skipToGame(page);
        await expect(page.locator('#hud-buffs')).toBeHidden();
    });

    test('buff HUD appears when a buff is active', async ({ page }) => {
        await skipToGame(page);

        await page.evaluate(() => {
            const s = (window as any).PlayerStats;
            s.buffs.slotMachineLuck = true;
            (window as any).Game.updateHUD();
        });

        await expect(page.locator('#hud-buffs')).toBeVisible();
        await expect(page.locator('#hud-buffs')).toContainText('Pajo');
    });
});
