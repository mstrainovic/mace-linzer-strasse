// spec: Konami code easter egg – ↑↑↓↓←→←→BA
import { test, expect } from '@playwright/test';
import { skipToGame, getGameState } from './helpers';

const KONAMI = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a',
];

test.describe('Konami Code Easter Egg', () => {
    test('entering konami code activates gentleman mode', async ({ page }) => {
        await skipToGame(page);

        for (const key of KONAMI) {
            await page.keyboard.press(key);
        }

        const state = await getGameState(page);
        expect(state.konamiActive).toBe(true);
    });

    test('konami code adds 3 charm', async ({ page }) => {
        await skipToGame(page);
        const before = await getGameState(page);

        for (const key of KONAMI) {
            await page.keyboard.press(key);
        }

        const after = await getGameState(page);
        expect(after.charm).toBe(Math.min(10, before.charm + 3));
    });

    test('achievement popup appears after konami code', async ({ page }) => {
        await skipToGame(page);

        for (const key of KONAMI) {
            await page.keyboard.press(key);
        }

        await expect(page.locator('#achievement-popup')).toHaveClass(/show/, { timeout: 2000 });
        await expect(page.locator('#achievement-desc')).toContainText('Gentleman');
    });

    test('konami code activates konami-active CSS class on body', async ({ page }) => {
        await skipToGame(page);

        for (const key of KONAMI) {
            await page.keyboard.press(key);
        }

        await expect(page.locator('body')).toHaveClass(/konami-active/);
    });

    test('konami code only activates once', async ({ page }) => {
        await skipToGame(page);

        // Enter once
        for (const key of KONAMI) await page.keyboard.press(key);
        await page.waitForTimeout(300);

        const charmAfterFirst = (await getGameState(page)).charm;

        // Enter again
        for (const key of KONAMI) await page.keyboard.press(key);
        await page.waitForTimeout(300);

        const charmAfterSecond = (await getGameState(page)).charm;
        expect(charmAfterSecond).toBe(charmAfterFirst); // no additional charm added
    });
});
