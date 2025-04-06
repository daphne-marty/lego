const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { v4: uuidv4 } = require('uuid');

/**
 * Scrape Dealabs RSS feed
 */
module.exports.scrape = async () => {
  const url = 'https://www.dealabs.com/rss?q=lego';
  const response = await fetch(url);
  const xml = await response.text();

  const $ = cheerio.load(xml, { xmlMode: true });
  const items = $('item');

  const deals = items.map((i, el) => {
    const title = $(el).find('title').text();
    const link = $(el).find('link').text();
    const description = $(el).find('description').text();

    const $desc = cheerio.load(description);
    const priceText = $desc('strong').first().text();
    const price = parseFloat(priceText.replace(/[^\d,.-]/g, '').replace(',', '.')) || null;
    const photo = $desc('img').attr('src');

    return {
      title,
      link,
      price,
      retail: null,
      discount: null,
      photo,
      temperature: null,
      published: new Date().toUTCString(),
      comments: null,
      community: 'dealabs',
      uuid: uuidv4()
    };
  }).get();

  return deals;
};
