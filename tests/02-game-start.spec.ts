// spec: Game starts correctly, HUD shows initial stats
import { test, expect } from '@playwright/test';
import { skipToGame, getGameState } from './helpers';

test.describe('Game Start & Initial State', () => {
    test('clicking through screens reaches playing state', async ({ page }) => {
        await skipToGame(page);
        const state = await getGameState(page);
        expect(state.state).toBe('playing');
    });

    test('HUD is visible when game starts', async ({ page }) => {
        await skipToGame(page);
        await expect(page.locator('#hud')).toHaveClass(/active/);
    });

    test('initial money is 150€', async ({ page }) => {
        await skipToGame(page);
        await expect(page.locator('#hud-money')).toHaveText('150€');
        const state = await getGameState(page);
        expect(state.money).toBe(150);
    });

    test('initial charm is 3/10', async ({ page }) => {
        await skipToGame(page);
        await expect(page.locator('#hud-charm')).toHaveText('3/10');
    });

    test('initial desperation is 0/10', async ({ page }) => {
        await skipToGame(page);
        await expect(page.locator('#hud-desperation')).toHaveText('0/10');
    });

    test('initial embarrassment is 0/10', async ({ page }) => {
        await skipToGame(page);
        await expect(page.locator('#hud-embarrassment')).toHaveText('0/10');
    });

    test('initial selfRespect is 10/10', async ({ page }) => {
        await skipToGame(page);
        await expect(page.locator('#hud-selfrespect')).toHaveText('10/10');
    });

    test('timer starts at 02:00', async ({ page }) => {
        await skipToGame(page);
        await expect(page.locator('#hud-time')).toHaveText('02:00');
    });

    test('inventory shows starting items', async ({ page }) => {
        await skipToGame(page);
        const invText = await page.locator('#inv-items').innerText();
        expect(invText).toContain('Axe Body Spray');
        expect(invText).toContain('Kaugummi');
    });

    test('game canvas is rendered', async ({ page }) => {
        await skipToGame(page);
        const canvas = page.locator('#game-canvas');
        await expect(canvas).toBeVisible();
        const box = await canvas.boundingBox();
        expect(box!.width).toBeGreaterThan(0);
        expect(box!.height).toBeGreaterThan(0);
    });
});
