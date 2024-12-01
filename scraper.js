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
        ///console.log('Content:', content);
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

// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const { extractRelevantContent } = require('./extractor');

// // Use stealth plugin to evade detection by anti-bot systems
// puppeteer.use(StealthPlugin());

// // Setup User-Agent and other configurations for more realistic scraping
// const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

// async function scrapePage(url) {
//     const browser = await puppeteer.launch({
//         headless: false, // Run in headful mode to mimic real user interaction
//         args: [
//             '--no-sandbox',
//             '--disable-setuid-sandbox',
//             '--window-size=1920,1080',
//             '--disable-infobars',
//             '--disable-blink-features=AutomationControlled',
//             '--disable-web-security',
//             '--dns-prefetch-disable', // Disable DNS prefetching
//         ],
//         defaultViewport: { width: 1920, height: 1080 }, // Set a realistic viewport
//     });

//     //const context = await browser.createIncognitoBrowserContext(); // Use incognito mode
//     const page = await browser.newPage();

//     // Set realistic user-agent to mimic a browser request
//     await page.setUserAgent(userAgent);

//     // Set a referer header if needed
//     // await page.setExtraHTTPHeaders({
//     //     'referer': 'https://www.google.com/',
//     // });

//     // Add realistic browser interaction
//     await page.evaluateOnNewDocument(() => {
//         Object.defineProperty(navigator, 'webdriver', { get: () => undefined });  // Avoid detection
//     });

//     try {
//         console.log('Navigating to URL:', url);
//         await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Wait until DOM is loaded

//         // Random delay to mimic human behavior
//         await delay(randomIntFromInterval(1000, 3000));

//         // Scroll the page to simulate real user behavior and trigger lazy loading
//         await autoScroll(page);

//         // Extract the content once everything is loaded
//         const content = await page.content();
//         console.log('Page loaded, extracting content...', content);

//         // Extract relevant data (e.g., restaurant names)
//         const filteredRestaurantNames = extractRelevantContent(content);
//         return filteredRestaurantNames; // Return extracted data
//     } catch (error) {
//         console.error('Error scraping the page:', error);
//         return []; // Return empty array on error
//     } finally {
//         await page.close(); // Close the page
//         //await context.close(); // Close the incognito context
//         await browser.close(); // Close the Puppeteer browser
//     }
// }

// // Function to scroll the page and simulate user scrolling (triggers dynamic content loading)
// async function autoScroll(page) {
//     await page.evaluate(async () => {
//         await new Promise((resolve) => {
//             let totalHeight = 0;
//             let distance = 100;
//             const timer = setInterval(() => {
//                 window.scrollBy(0, distance);
//                 totalHeight += distance;

//                 if (totalHeight >= document.body.scrollHeight) {
//                     clearInterval(timer);
//                     resolve();
//                 }
//             }, 100);
//         });
//     });
// }

// // Helper function to introduce a delay
// function delay(time) {
//     return new Promise(resolve => setTimeout(resolve, time));
// }

// // Helper function to generate a random integer between min and max
// function randomIntFromInterval(min, max) { 
//     return Math.floor(Math.random() * (max - min + 1) + min);
// }

// module.exports = { scrapePage };