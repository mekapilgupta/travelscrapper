// const puppeteer = require('puppeteer');
// const { extractRelevantContent } = require('./extractor');

// async function scrapePage(url) {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
    
//     await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Wait until DOM is loaded

//     const content = await page.content();
    
//     const filteredRestaurantNames = extractRelevantContent(content);

//     await page.close(); // Close the page
//     await browser.close(); // Close the Puppeteer browser
    
//     return filteredRestaurantNames; // Return the unique restaurant names
// }

// module.exports = { scrapePage };


const puppeteer = require('puppeteer-extra');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { extractRelevantContent } = require('./extractor');

// Use the stealth and adblocker plugins
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

async function scrapePage(url) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
        defaultViewport: null
    });
    
    const page = await browser.newPage();
    
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Wait until DOM is loaded

        const content = await page.content();
        
        const filteredRestaurantNames = extractRelevantContent(content);

        return filteredRestaurantNames; // Return the unique restaurant names
    } catch (error) {
        console.error('Error scraping the page:', error);
        return []; // Return an empty array on error
    } finally {
        await page.close(); // Close the page
        await browser.close(); // Close the Puppeteer browser
    }
}

module.exports = { scrapePage };
