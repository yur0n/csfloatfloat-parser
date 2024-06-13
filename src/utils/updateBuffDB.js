import { Skin } from '../models/models.js'
import skinIDs from './getSkinIDs.js';
import * as cheerio from 'cheerio';
import { CronJob } from 'cron';

updateSkins();

new CronJob(
	'0 0 */7 * * *',
  updateSkins,
	null,
	true,
	'America/Los_Angeles'
);

async function updateSkins() {
  console.log('Updating BUFF skins...');
  const usdToCny = await fetchCurrency()
  for (const { name, id } of skinIDs) {
    try {
      const price = await getSkinPrice(id, usdToCny);
      if (!price) continue;
      await saveSkin(id, name, price);
    } catch (error) {
      console.error(`Error updating BUFF skin ${name}:`, error);
    }
  }
  console.log('BUFF skins updated');
}

async function saveSkin(_id, name, price ) {
	try {
    await Skin.findOneAndUpdate(
      { _id }, 
      { $set: { name, price } }, 
      { upsert: true }
    );
  } catch (error) {
    console.error(`Error saving skin ${name}:`, error);
  }
}

async function getSkinPrice(id, usdToCny, attempts = 0) {
  await new Promise(resolve => setTimeout(resolve, 500));
  let price = 0;
	if (attempts > 1) return price;
  try {
    const url = `https://buff.163.com/api/market/goods/sell_order?game=csgo&goods_id=${id}&page_num=1&sort_by=default&mode=&allow_tradable_cooldown=1`;
    const response = await fetch(url);
    if (response.ok) {
      const res = await response.json();
      const cnyPrice = res.data.items[0]?.lowest_bargain_price;
      price = cnyPrice ? Math.max(0.01, (cnyPrice / usdToCny).toFixed(2)) : 0;
    } else {
      // console.error(`HTTP-Error: ${response.status}`);
      price = await getSkinPrice(id, usdToCny, ++attempts);
    }
  } catch (error) {
    // console.error(`Error fetching skin price:`, error);
		price = await getSkinPrice(id, usdToCny, ++attempts);
  }

  return price;
}

async function fetchCurrency() {
  return fetch('https://www.currency.me.uk/convert/usd/cny')
    .then(res => res.text())
    .then(res => {
        const $ = cheerio.load(res);
        const cur = $('.mini.ccyrate').text();
        return parseFloat(cur.split(" ")[3]);
    })
    .catch(error => {
        console.error(error);
        console.error('Error fetching currency, returning default value');
        return 7.2381;
    });
}
