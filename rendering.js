import puppeteer from 'puppeteer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, 'uploads', 'posts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Renders an HTML string to a PNG image.
 * @param {string} html - The HTML content to render.
 * @param {string} filename - The target filename (e.g., 'post_123.png').
 * @returns {Promise<string>} - The local path to the rendered image.
 */
export async function renderHtmlToPng(html, filename) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    const size = 1080;
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const outputPath = path.join(outputDir, filename);
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 0, y: 0, width: size, height: size },
      fullPage: false,
    });
    
    return outputPath;
  } finally {
    await browser.close();
  }
}
