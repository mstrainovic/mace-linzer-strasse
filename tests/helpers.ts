import { Page } from '@playwright/test';

/** Skips title screen loading animation and starts the intro. */
export async function skipToIntro(page: Page) {
    await page.goto('/');
    await page.waitForSelector('#title-screen.active');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    // Wait for either intro or game (one click triggers both handlers in sequence)
    await page.waitForFunction(
        "['intro','playing'].includes(Game.state)",
        { timeout: 8000 }
    );
}

/** Skips all screens and starts the actual game. */
export async function skipToGame(page: Page) {
    await page.goto('/');
    await page.waitForSelector('#title-screen.active');
    await page.waitForTimeout(200);
    // Each Enter press advances one screen: title→intro, intro→playing
    for (let i = 0; i < 3; i++) {
        const inGame = await page.evaluate("Game.state === 'playing'");
        if (inGame) break;
        await page.keyboard.press('Enter');
        await page.waitForTimeout(400);
    }
    await page.waitForFunction(
        "Game.state === 'playing'",
        { timeout: 10000 }
    );
    await page.waitForTimeout(200);
}

/** Teleports the player to a given X position via JS. */
export async function setPlayerX(page: Page, x: number) {
    await page.evaluate((px) => { Game.player.x = px; }, x);
}

/** Returns the current game state object. */
export async function getGameState(page: Page) {
    return page.evaluate(() => ({
        state: Game.state,
        playerX: Game.player.x,
        money: PlayerStats.money,
        charm: PlayerStats.charm,
        desperation: PlayerStats.desperation,
        embarrassment: PlayerStats.embarrassment,
        selfRespect: PlayerStats.selfRespect,
        konamiActive: PlayerStats.konamiActive,
    }));
}
