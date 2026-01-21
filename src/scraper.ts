import { chromium } from 'playwright';
import type { BooliSnapshot } from './database';

export interface ScrapedData {
  forSale: number;
  soonToBeSold: number;
}

export async function scrapeBooli(): Promise<ScrapedData> {
  console.log('Starting Booli scrape...');

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    await page.goto('https://www.booli.se/sok/till-salu', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    const forSaleText = await page.locator('text=/for sale/i').first().textContent();
    const soonToBeSoldText = await page.locator('text=/soon to be sold/i').first().textContent();

    const forSale = extractNumber(forSaleText || '');
    const soonToBeSold = extractNumber(soonToBeSoldText || '');

    console.log(`Scraped data: For sale=${forSale}, Soon to be sold=${soonToBeSold}`);

    return { forSale, soonToBeSold };
  } finally {
    await browser.close();
  }
}

function extractNumber(text: string): number {
  const match = text.match(/[\d,]+/);
  if (!match) {
    throw new Error(`Could not extract number from text: "${text}"`);
  }
  return parseInt(match[0].replace(/,/g, ''), 10);
}

export function createSnapshot(data: ScrapedData): BooliSnapshot {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  return {
    date: dateStr,
    forSale: data.forSale,
    soonToBeSold: data.soonToBeSold,
  };
}
