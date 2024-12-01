const { scrapePage } = require('./scraper');  // Import the scrapePage function from your scraper

// Define the test URL
const testUrl = 'https://www.tripadvisor.com/Restaurants-g1185549-Vosu_Laane_Viru_County.html';  // Replace with the URL you want to test

async function testScraping() {
    try {
        console.log(`Starting to scrape URL: ${testUrl}`);
        
        // Call the scrapePage function and wait for the result
        const restaurantNames = await scrapePage(testUrl);
        
        // Log the result to see if it worked as expected
        if (restaurantNames.length > 0) {
            console.log('Successfully scraped restaurant names:', restaurantNames);
        } else {
            console.log('No restaurant names found or error occurred.');
        }
    } catch (error) {
        console.error('Error during scraping:', error.message);
    }
}

// Run the test function
testScraping();
