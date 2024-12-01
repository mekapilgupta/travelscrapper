const { scrapePage } = require('./scraper');
const ChatGPT = require('./Chatgpt.js'); // Change this to your ChatGPT module
const { 
    fetchProcessedCityIds, 
    fetchDataForCity, 
    insertAccumulatedScrapedData, 
    readCityDataFromCSV 
} = require('./supabaseUtils');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get restaurant names using ChatGPT from the scraped content.
 * @param {string} content The scraped content from the webpage.
 * @returns {Promise<Array>} Array of restaurant names or an error message.
 */
async function getRestaurantNamesFromChatGPT(content) {
    const chatGPT = new ChatGPT(); // Instantiate ChatGPT
    const prompt = `
    Here is some text from a webpage:\n\n${content}\n\n
    Extract the restaurant names from this text and provide them as an array. If no restaurant names are found, return "No Restaurant Found".
    Output should strictly be in the form of an array: ["Restaurant A", "Restaurant B", "Restaurant C"].
    `;

    try {
        // Wait for 5 seconds before sending data (for throttling purposes)
        await delay(5000);
        const restaurantNames = await chatGPT.chat(prompt); // Call the chat method on ChatGPT
        console.log('ChatGPT response:', restaurantNames); // Log the response immediately for verification
        return restaurantNames;

    } catch (error) {
        console.error('Error interacting with ChatGPT:', error.message);
        return [];
    }
}

/**
 * Check if the URL is valid (not from invalid domains).
 * @param {string} url The URL to validate.
 * @returns {boolean} Whether the URL is valid.
 */
function isValidUrl(url) {
    const invalidDomains = [
        'reddit.com', 'airbnb.com', 'booking.com', 'trivago.com',
        'facebook.com', 'instagram.com', 'tiktok.com',
        'youtube.com', 'makemytrip.com', 'expedia.com'
    ];
    return !invalidDomains.some(domain => url.includes(domain));
}

/**
 * Process a single URL and accumulate restaurant names.
 * @param {Array} urls Array of URL objects to scrape.
 * @param {number} cityId The city ID associated with the URLs.
 * @param {string} cityName The name of the city for logging purposes.
 * @returns {Promise<Object|null>} The result object with city ID, URL, and restaurants, or null if no data found.
 */
async function processUrl(urls, cityId, cityName) {
    if (!Array.isArray(urls) || urls.length === 0) {
        console.log(`No URLs to process for city ${cityName} (ID: ${cityId})`);
        return null;
    }

    const promises = urls.map(async ({ url, title, website_id }) => {
        if (!isValidUrl(url)) {
            console.log(`Skipping invalid URL for city ${cityName} (ID: ${cityId}):`, url);
            return null; // Skip invalid URLs
        }

        console.log(`Scraping URL: ${url} for city ${cityName} (ID: ${cityId})`);
        const scrapedData = await scrapePage(url);

        if (!scrapedData || scrapedData.length === 0) {
            console.log(`No relevant content found for URL: ${url}`);
            return null; // Skip if no relevant content
        }

        const cleanedData = scrapedData.join(' ');
        const restaurantNames = await getRestaurantNamesFromChatGPT(cleanedData);

        if (restaurantNames.length > 0) {
            console.log(`Processing city: ${cityName}, Found restaurants:`, restaurantNames);
            // Insert data into the database immediately
            await insertAccumulatedScrapedData(cityId, [{ city_id: cityId, url, title, website_id, restaurants: restaurantNames }]);
        } else {
            console.log(`No restaurant names found for URL: ${url}`);
        }
    });

    // Wait for all promises to resolve
    await Promise.all(promises);
}

/**
 * Process a chunk of city data.
 * @param {Array} cityChunk Array of city objects to process.
 */
async function processCityChunk(cityChunk) {
    for (const { id, name } of cityChunk) {
        console.log(`Processing city: ${name} (ID: ${id})`);

        const cityUrlsResponse = await fetchDataForCity(id);
        const cityUrls = cityUrlsResponse.flatMap(urlData => 
            Array.isArray(urlData.website_urls) ? urlData.website_urls : []
        );

        console.log(`City URLs:`, cityUrls);

        if (cityUrls.length === 0) {
            console.log(`No URLs found for city: ${name} (ID: ${id})`);
            continue; // Skip if no URLs
        }

        // Process each URL for this city
        await processUrl(cityUrls, id, name);
    }
}

/**
 * Main function to process cities.
 */
async function processCities() {
    try {
        const processedCityIds = await fetchProcessedCityIds();
        const cityData = await readCityDataFromCSV();

        const chunkSize = Math.ceil(cityData.length / 4); // Adjust the number of instances here
        const cityChunks = [];
        
        for (let i = 0; i < cityData.length; i += chunkSize) {
            cityChunks.push(cityData.slice(i, i + chunkSize));
        }

        // Process each chunk in parallel, passing the processedCityIds
        await Promise.all(cityChunks.map(chunk => processCityChunk(chunk, processedCityIds)));

    } catch (error) {
        console.error('Error in processing cities:', error.message);
    }
}

// Run the main processing
processCities().catch(error => console.error('Error in processing cities:', error.message));
