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

    console.log('Navigating to Booli.se...');
    await page.goto('https://www.booli.se/sok/till-salu', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    console.log('Waiting for page to load...');
    await page.waitForTimeout(5000);

    console.log('Looking for housing data...');
    
    // Try multiple selectors to find the data
    let forSaleText = null;
    let soonToBeSoldText = null;

    try {
      forSaleText = await page.locator('text=/till salu/i').first().textContent({ timeout: 10000 });
    } catch (e) {
      console.log('Could not find "till salu" text, trying English...');
      forSaleText = await page.locator('text=/for sale/i').first().textContent({ timeout: 10000 });
    }

    try {
      soonToBeSoldText = await page.locator('text=/snart till salu/i').first().textContent({ timeout: 10000 });
    } catch (e) {
      console.log('Could not find "snart till salu" text, trying English...');
      soonToBeSoldText = await page.locator('text=/soon to be sold/i').first().textContent({ timeout: 10000 });
    }

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
