/* eslint-disable no-console, no-process-exit */
const fs = require('fs');
const avenuedelabrique = require('./websites/avenuedelabrique');
const dealabs = require('./websites/dealabs');

async function scrapeAvenue(url = 'https://www.avenuedelabrique.com/nouveautes-lego') {
  console.log(`🧱 Scraping AvenueDeLaBrique: ${url}`);
  const deals = await avenuedelabrique.scrape(url);
  fs.writeFileSync('avenuedelabrique-deals.json', JSON.stringify(deals, null, 2));
  console.log(`✅ ${deals.length} deals saved to avenuedelabrique-deals.json`);
}

async function scrapeDealabs() {
  console.log('🔥 Scraping Dealabs (RSS)...');
  const deals = await dealabs.scrape();
  fs.writeFileSync('dealabs-rss-deals.json', JSON.stringify(deals, null, 2));
  console.log(`✅ ${deals.length} deals saved to dealabs-rss-deals.json`);
}

const [,, site, url] = process.argv;

(async () => {
  try {
    if (site === 'avb') {
      await scrapeAvenue(url);
    } else if (site === 'dealabs') {
      await scrapeDealabs();
    } else {
      console.log('❗️Please specify a site: "avb" or "dealabs"');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
