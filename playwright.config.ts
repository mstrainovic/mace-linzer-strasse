import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 15000,
    use: {
        baseURL: 'http://localhost:3333',
        headless: true,
        launchOptions: {
            executablePath: process.env.CHROMIUM_PATH ||
                '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
});
