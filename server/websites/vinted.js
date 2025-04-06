const fetch = require('node-fetch');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

(async () => {
  const legoSetId = "43230";
  const url = `https://www.vinted.fr/api/v2/catalog/items?search_text=${legoSetId}&page=1`;
  console.log(`Fetching sales data from: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'x-requested-with': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Referer': 'https://www.vinted.fr/'
      }
    });
  
    if (!response.ok) {
      console.error('Response not ok:', response.statusText);
      process.exit(1);
    }
  
    const data = await response.json();
    const items = data.items || [];
  
    const sales = items.map(item => ({
      title: item.title || '',
      price: item.price && item.price.amount ? item.price.amount : null,
      link: item.url ? `https://www.vinted.fr${item.url}` : '',
      photo: item.photo && item.photo.url ? item.photo.url : '',
      published: item.created_at || new Date().toUTCString(),
      community: 'vinted',
      uuid: uuidv4()
    }));
  
    fs.writeFileSync('vinted-sales.json', JSON.stringify(sales, null, 2));
    console.log(`✅ Saved ${sales.length} sales to vinted-sales.json`);
  } catch (error) {
    console.error('Error fetching Vinted sales:', error);
  }
})();
