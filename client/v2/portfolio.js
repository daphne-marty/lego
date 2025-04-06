// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}" target="_blank">${deal.title}</a>  
        <span>${deal.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals)
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

// feature 2 : 

document.querySelector('#filter-discount').addEventListener('click', () => {
  const filteredDeals = currentDeals.filter(deal => {
    const discount = ((deal.retail - deal.price) / deal.retail) * 100;
    return discount >= 50;
  });
  
  renderDeals(filteredDeals);
});

//feature 3 : no comment field in "deals" couldn't sort them by comments counts

document.querySelector('#filter-comments').addEventListener('click', () => {
  const filteredDeals = currentDeals.filter(deal => {
    return deal.commentCount >= 15;
  });
  console.table(currentDeals.map(deal => ({
    title: deal.title,
    commentCount: deal.commentCount
  })));
  
  renderDeals(filteredDeals);
});

//feature 1 :

/**
 * Select the page to browse
 */
selectPage.addEventListener('change', async (event) => {
  const selectedPage = parseInt(event.target.value);
  const selectedSize = parseInt(selectShow.value);

  const deals = await fetchDeals(selectedPage, selectedSize);

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

selectLegoSetIds.addEventListener('change', async (event) => {
  const selectedId = event.target.value;
  const sales = await fetchVintedSales(selectedId);
  renderVintedSales(sales);
});


// feature 4 : 

document.querySelector('#filter-hot').addEventListener('click', () => {
  const filteredDeals = currentDeals.filter(deal => {
    return deal.temperature > 100;
  });

  renderDeals(filteredDeals);
});

//feature 5 and feature 6 : 

document.querySelector('#sort-select').addEventListener('change', event => {
  const value = event.target.value;
  let sortedDeals = [...currentDeals]; // copy to avoid  modyfying the original variable


  if (value === 'price-asc') {
    sortedDeals.sort((a, b) => a.price - b.price);
  } else if (value === 'price-desc') {
    sortedDeals.sort((a, b) => b.price - a.price);
  } else if (value === 'date-asc') {
    // Du plus récent au plus ancien
    sortedDeals.sort((a, b) => b.published - a.published);
  } else if (value === 'date-desc') {
    // Du plus ancien au plus récent
    sortedDeals.sort((a, b) => a.published - b.published);
  }

  renderDeals(sortedDeals);
});



// feature 7:

const fetchVintedSales = async (id) => {
  try {
    const response = await fetch(`https://lego-api-blue.vercel.app/sales?id=${id}`);
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return [];
    }

    return body.data.result;
  } catch (error) {
    console.error("Error fetching Vinted sales:", error);
    return [];
  }
};

const renderVintedSales = (sales) => {
  const container = document.querySelector('#vinted-sales');
  if (sales.length === 0) {
    container.innerHTML = '<p>No sales found for this set.</p>';
    return;
  }

  console.log("Vinted sales example:", sales[0]);


  const html = sales.map(sale => `
    <div class="sale">
      <a href="${sale.link}" target="_blank">${sale.title}</a> - ${sale.price}€
    </div>
  `).join('');

  container.innerHTML = html;
  // feature 8 :
  document.querySelector('#nbSales').textContent = sales.length;

  //feature 9 :

  // Met à jour nbSales
  document.querySelector('#nbSales').textContent = sales.length;

  // Récupère tous les prix en float
  const prices = sales.map(sale => parseFloat(sale.price)).sort((a, b) => a - b);

  // Calcule la moyenne
  const average = prices.reduce((acc, val) => acc + val, 0) / prices.length || 0;

  // Calcule les percentiles
  const p5 = prices[Math.floor(prices.length * 0.05)] || 0;
  const p25 = prices[Math.floor(prices.length * 0.25)] || 0;
  const p50 = prices[Math.floor(prices.length * 0.50)] || 0;

  // Met à jour les éléments HTML
  document.querySelector('#p5').textContent = `${p5.toFixed(2)}€`;
  document.querySelector('#p25').textContent = `${p25.toFixed(2)}€`;
  document.querySelector('#p50').textContent = `${p50.toFixed(2)}€`;

  //feature 10 :
  if (sales.length > 0) {
    const timestamps = sales.map(sale => new Date(sale.published).getTime());
  
    const oldest = Math.min(...timestamps);
    const newest = Math.max(...timestamps);
  
    const lifetimeInMs = newest - oldest;
    const lifetimeInDays = Math.round(lifetimeInMs / (1000 * 60 * 60 * 24));
  
    document.querySelector('#lifetime').textContent = `${lifetimeInDays} days`;
  } else {
    document.querySelector('#lifetime').textContent = `0 days`;
  }

};


//feature 12 : already implemented













