const playwright = require('playwright-core');
const path = require('path');

/**
 * Capture high-fidelity page screenshots using Playwright.
 * Optimized for Render.com free tier (headless, no-sandbox).
 */
async function captureScreenshot(url, width = 1280, height = 800) {
  let browser;
  try {
    // Launch chromium via playwright-core
    // Note: requires playwright-core and @playwright/browser-chromium
    browser = await playwright.chromium.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ]
    });

    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });

    const page = await context.newPage();

    // Optimize: block heavy media resources to speed up capture
    await page.route('**/*.{mp4,webm,ogg,mp3,gif,woff,woff2,ttf}', route => route.abort());

    // Navigate with a reasonable timeout for slower sites
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 20000 
    });

    // Wait for internal renders/animations to settle
    await page.waitForTimeout(2000);

    // Capture as high-quality JPEG (smaller than PNG for DB storage)
    const buffer = await page.screenshot({
      type: 'jpeg',
      quality: 75,
      fullPage: false,
      clip: { x: 0, y: 0, width, height }
    });

    return buffer.toString('base64');
  } catch (error) {
    console.error('[Screenshotter] Error:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { captureScreenshot };
