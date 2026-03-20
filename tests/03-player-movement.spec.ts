// spec: Player movement via keyboard input
import { test, expect } from '@playwright/test';
import { skipToGame, getGameState } from './helpers';

test.describe('Player Movement', () => {
    test('player starts at X=300', async ({ page }) => {
        await skipToGame(page);
        const state = await getGameState(page);
        expect(state.playerX).toBe(300);
    });

    test('ArrowRight moves player to the right', async ({ page }) => {
        await skipToGame(page);
        const before = await getGameState(page);

        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(500);
        await page.keyboard.up('ArrowRight');

        const after = await getGameState(page);
        expect(after.playerX).toBeGreaterThan(before.playerX);
    });

    test('ArrowLeft moves player to the left', async ({ page }) => {
        await skipToGame(page);
        // Move right first so there's room to go left
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(600);
        await page.keyboard.up('ArrowRight');

        const before = await getGameState(page);
        await page.keyboard.down('ArrowLeft');
        await page.waitForTimeout(500);
        await page.keyboard.up('ArrowLeft');

        const after = await getGameState(page);
        expect(after.playerX).toBeLessThan(before.playerX);
    });

    test('player cannot move past world left boundary (X=0)', async ({ page }) => {
        await skipToGame(page);
        await page.keyboard.down('ArrowLeft');
        await page.waitForTimeout(3000);
        await page.keyboard.up('ArrowLeft');

        const state = await getGameState(page);
        expect(state.playerX).toBeGreaterThanOrEqual(0);
    });

    test('Space bar triggers jump (velocityY set when jumping)', async ({ page }) => {
        await skipToGame(page);
        // Hold Space down so the game loop can read it in the next frame
        await page.keyboard.down(' ');
        await page.waitForTimeout(100); // allow at least one animation frame
        await page.keyboard.up(' ');

        const jumped = await page.waitForFunction(
            "Game.player.velocityY > 0 || Game.player.y > 0",
            { timeout: 2000 }
        );
        expect(jumped).toBeTruthy();
    });

    test('player returns to ground after jump', async ({ page }) => {
        await skipToGame(page);
        await page.keyboard.press('Space');
        await page.waitForTimeout(1500);

        const state = await page.evaluate(() => (window as any).Game.player);
        expect(state.isGrounded).toBe(true);
        expect(state.y).toBe(0);
    });
});
