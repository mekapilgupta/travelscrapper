const puppeteer = require('puppeteer');
const fs = require('fs');
const DuckGPT = require('./DuckGPT'); // Import DuckGPT for restaurant name extraction
const cheerio = require('cheerio'); // Cheerio for parsing HTML

const urlsFilePath = 'urls.json'; // The path to your urls.json file

// Load the URLs from the urls.json file
async function loadUrls() {
    try {
        const data = await fs.promises.readFile(urlsFilePath, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData.urls || [];
    } catch (error) {
        console.error('Error loading URLs from file:', error);
        return [];
    }
}

// Function to scrape relevant content from each page
// async function scrapePage(url, browser) {
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Wait until DOM is loaded

//     const content = await page.content();
//     const $ = cheerio.load(content); // Load the HTML into cheerio for easy parsing

//     // Extract relevant elements
//     const elements = $('h1, h2, h3, a, ul, li, td, tr')
//         .map((index, element) => {
//             return $(element).text().trim();
//         })
//         .get();

//     await page.close(); // Close the page

//     return elements; // Return the scraped content
// }




// Function to create a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapePage(url, browser) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Wait until DOM is loaded

    const content = await page.content();
    const $ = cheerio.load(content); // Load the HTML into cheerio for easy parsing

    // Define a list of irrelevant keywords to filter out
    const irrelevantKeywords = [
        'Login', 'Sign up', 'Restaurants', 'Suppliers', 'Chefs', 'Real estates',
        'Jobs', 'Magazine', 'Home Page', 'Newsletter', 'Registration', 'Prices',
        'About us', 'Contact us', 'Regulations', 'Privacy', 'Cookies', 'Terms',
        'Explore', 'Nearby', 'Map', 'Location', 'Search', 'Filter', 'Sort',
        'View', 'Details', 'More', 'See', 'All', 'List', 'Categories', 'Home',
        'Specials', 'Offers', 'Deals', 'Events', 'Contact', 'Follow', 'Social',
        'Media', 'FAQ', 'Help', 'Support', 'Terms of Service', 'Privacy Policy',
        'Disclaimer', 'Copyright', '©', '®', '™', '•', '–', '—', '…', 
        'Restaurant', 'Dining', 'Cuisine', 'Menu', 'Reservation', 'Location',
        'Address', 'Phone', 'Hours', 'Open', 'Closed', 'Special', 'Event',
        'Featured', 'Popular', 'Best', 'Top', 'New', 'Try', 'Visit', 'Check',
        'See Also', 'Related', 'More Info', 'Details', 'Read More', 'Get Directions',
        'Directions', 'Nearby', 'Explore', 'Discover', 'Find', 'Search', 'Browse',
        'View All', 'See All', 'All Restaurants', 'All Categories', 'All Locations',
        'All Menus', 'All Offers', 'All Deals', 'All Events', 'All Specials',
        'All Listings', 'All Items', 'All Products', 'All Services', 'All Suppliers',
        'All Chefs', 'All Real Estates', 'All Jobs', 'All Magazines', 'All Home Pages',
        'All Newsletters', 'All Registrations', 'All Prices', 'All About Us',
        'All Contacts', 'All Regulations', 'All Privacy Policies', 'All Terms',
        'All Disclaimers', 'All Copyrights', 'All Rights Reserved'
    ];

    // Extract relevant elements
    const elements = $('a, ul, li, td, tr,h1, h2, h3, h4, h5 ,h6,  p') // Include all relevant tags
        .map((index, element) => {
            const text = $(element).text().trim();
            // Filter out irrelevant content
            if (text.length > 0 && !irrelevantKeywords.some(keyword => text.includes(keyword))) {
                return text; // Return only relevant text
            }
            return null; // Ignore irrelevant content
        })
        .get()
        .filter(Boolean); // Remove null values

    // Further refine the results to ensure we only get unique restaurant names
    const uniqueRestaurantNames = [...new Set(elements)];

    // Filter out names that are too long or not likely to be restaurant names
    const filteredRestaurantNames = uniqueRestaurantNames.filter(name => {
        const wordCount = name.split(' ').length;
        return wordCount <= 5; // Keep names with 5 words or fewer
    });

    await page.close(); // Close the page

    // Wait for 30 seconds before returning the results
    await delay(30000); // 30 seconds delay

    return filteredRestaurantNames; // Return the unique restaurant names
}


// Function to interact with DuckGPT to extract restaurant names
async function getRestaurantNamesFromDuckGPT(content) {
    const duckGPT = new DuckGPT(); // Initialize DuckGPT

    try {
        const prompt = `Here is some text from a webpage:\n\n${content}\n\nExtract the restaurant names from this text and provide them as a list.`;
        const restaurantNames = await duckGPT.chat(prompt);
        console.log(`DuckGPT response: ${restaurantNames}`);
        return restaurantNames;
    } catch (error) {
        console.error('Error interacting with DuckGPT:', error.message);
        return 'Error fetching restaurant names.';
    }
}

// Function to write results to a file
async function writeResultsToFile(url, content) {
    const outputFilePath = './restaurants_output.txt';
    const formattedResult = `[${url}], [${content}]\n`;

    try {
        await fs.promises.appendFile(outputFilePath, formattedResult, 'utf-8');
        console.log('Result saved to restaurants_output.txt');
    } catch (error) {
        console.error('Error saving result to file:', error.message);
    }
}

// Main function to process all URLs asynchronously
async function processUrls() {
    const urls = await loadUrls();
    const browser = await puppeteer.launch({ headless: true }); // Launch Puppeteer browser

    for (const url of urls) {
        console.log(`Processing URL: ${url}`);

        try {
            // Scrape the page
            const scrapedData = await scrapePage(url, browser);
            console.log(`Scraped data: ${scrapedData}`);
            if (scrapedData.length === 0) {
                console.log(`No relevant content found on: ${url}`);
                await writeResultsToFile(url, 'No relevant content found');
                continue;
            }

            // Send the scraped data to DuckGPT for processing
            const restaurantNames = await getRestaurantNamesFromDuckGPT(scrapedData.join(' '));

            // Log the result to console and save it to the file
            console.log(`Restaurant names found on ${url}: ${restaurantNames}`);
            await writeResultsToFile(url, restaurantNames);

        } catch (error) {
            console.error(`Error processing URL ${url}:`, error.message);
            await writeResultsToFile(url, 'Error processing URL');
        }
    }

    await browser.close(); // Close the Puppeteer browser
}

// Run the script
processUrls().catch(error => {
    console.error('Error in processing URLs:', error.message);
});
