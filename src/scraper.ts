import { chromium } from 'playwright';

export interface ScrapedData {
  booli: {
    forSale: number;
    soonToBeSold: number;
  };
  hemnet: {
    forSale: number;
    coming: number;
  };
}

export async function scrapeBooli(): Promise<{ forSale: number; soonToBeSold: number }> {
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

    await page.waitForTimeout(5000);
    
    const fullText = await page.locator('text=/till salu och.*snart till salu/i').first().textContent({ timeout: 10000 });
    
    if (!fullText) {
      throw new Error('Could not find housing statistics on Booli');
    }

    const forSaleMatch = fullText.match(/([\d\s]+)\s+till salu/i);
    const soonMatch = fullText.match(/([\d\s]+)\s+snart till salu/i);
    
    if (!forSaleMatch || !soonMatch) {
      throw new Error(`Could not extract numbers from Booli text: "${fullText}"`);
    }

    const forSale = parseInt(forSaleMatch[1].replace(/\s/g, ''), 10);
    const soonToBeSold = parseInt(soonMatch[1].replace(/\s/g, ''), 10);

    console.log(`Booli: For sale=${forSale}, Soon to be sold=${soonToBeSold}`);

    return { forSale, soonToBeSold };
  } finally {
    await browser.close();
  }
}

export async function scrapeHemnet(): Promise<{ forSale: number; coming: number }> {
  console.log('Starting Hemnet scrape...');

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'sv-SE',
    });

    const page = await context.newPage();

    console.log('Navigating to Hemnet.se...');
    await page.goto('https://www.hemnet.se/bostader', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await page.waitForTimeout(5000);
    
    // Take screenshot for debugging if needed
    const pageText = await page.locator('body').textContent();
    console.log('Hemnet page loaded, searching for numbers...');
    
    // Look for specific patterns
    let forSale = 0;
    let coming = 0;

    // Try different selectors
    try {
      const allText = pageText || '';
      
      // Look for patterns like "XXX till salu" or "XXX bostäder"
      const forSaleMatch = allText.match(/(\d+[\s\d]*)\s*(?:till salu|bostäder till salu)/i);
      const comingMatch = allText.match(/(\d+[\s\d]*)\s*(?:kommande|snart)/i);
      
      if (forSaleMatch) {
        forSale = parseInt(forSaleMatch[1].replace(/\s/g, ''), 10);
      }
      
      if (comingMatch) {
        coming = parseInt(comingMatch[1].replace(/\s/g, ''), 10);
      }
    } catch (e) {
      console.error('Error parsing Hemnet data:', e);
    }

    if (forSale === 0 || coming === 0) {
      throw new Error('Could not extract Hemnet numbers - website structure may have changed');
    }

    console.log(`Hemnet: For sale=${forSale}, Coming=${coming}`);

    return { forSale, coming };
  } finally {
    await browser.close();
  }
}

export async function scrapeAll(): Promise<ScrapedData> {
  const booli = await scrapeBooli();
  const hemnet = await scrapeHemnet();
  
  return {
    booli,
    hemnet,
  };
}
