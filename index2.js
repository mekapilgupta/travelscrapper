// const { scrapePage } = require('./scraper');
// const { loadUrls, writeResultsToFile } = require('./utils');
// const DuckGPT = require('./DuckGPT'); 
// const { loadUrlsFromSourceTable, insertAccumulatedScrapedData, writeScrapedDataToFile, getLastProcessedUrl, updateLastProcessedUrl } = require('./supabaseUtils');

// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// async function getRestaurantNamesFromDuckGPT(content) {
//     const duckGPT = new DuckGPT(); 

//     try {
//         const prompt = `Here is some text from a webpage:\n\n${content}\n\nExtract the restaurant names from this text and provide them as an array. If no restaurant names are found, simply return "No Restaurant Found".`;       
//         console.log(`Sending the following data to DuckGPT:\n${content}`);
        
//         await delay(40000); // 40 seconds delay
       
//         const restaurantNames = await duckGPT.chat(prompt);
//         console.log(`DuckGPT response: ${restaurantNames}`);
        
//         // Clean the response to ensure it's a simple array
//         if (Array.isArray(restaurantNames)) {
//             return restaurantNames.map(name => name.trim()).filter(name => name); // Trim whitespace and filter out empty names
//         } else {
//             return 'No Restaurant Found';
//         }
//     } catch (error) {
//         console.error('Error interacting with DuckGPT:', error.message);
//         return 'Error fetching restaurant names.';
//     }
// }

// function isValidUrl(url) {
//     const invalidDomains = ['reddit.com', 'airbnb.com', 'booking.com', 'trivago.com', 'facebook.com', 'instagram.com', 'tiktok.com'];
//     return !invalidDomains.some(domain => url.includes(domain));
// }

// async function processUrls() {
//     const sourceData = await loadUrlsFromSourceTable();

//     for (const entry of sourceData) {
//         const { website_urls, city_id } = entry;
//         const lastProcessedUrl = await getLastProcessedUrl(city_id); // Get the last processed URL for this city

//         try {
//             const urls = Array.isArray(website_urls) ? website_urls : JSON.parse(website_urls);
//             const accumulatedResults = []; // Array to store results for the current city

//             for (const urlObj of urls) {
//                 const url = urlObj.url;

//                 // Skip invalid URLs
//                 if (!isValidUrl(url)) {
//                     console.log(`Skipping invalid URL: ${url}`);
//                     continue;
//                 }

//                 // Check if this URL has already been processed
//                 if (url === lastProcessedUrl) {
//                     console.log(`Resuming from last processed URL: ${url}`);
//                 } else if (lastProcessedUrl && url < lastProcessedUrl) {
//                     continue; // Skip already processed URLs
//                 }

//                 // Scrape the page and get filtered restaurant names
//                 const scrapedData = await scrapePage(url);

//                 // Check if scraped data is empty
//                 if (scrapedData.length === 0) {
//                     await writeResultsToFile(url, 'No relevant content found');
//                     continue; // Skip to the next URL
//                 }

//                 // Clean and extract restaurant names from the scraped data
//                 const cleanedData = scrapedData.join(' ');
//                 let restaurantNames = await getRestaurantNamesFromDuckGPT(cleanedData);

//                 // Store the result for the current URL
//                 accumulatedResults.push({
//                     url: url,
//                     restaurants: restaurantNames // Store the structured restaurant names
//                 });

//                 console.log("accumulatedResults", accumulatedResults);

//                 // Update the last processed URL
//                 await updateLastProcessedUrl(city_id, url);
//             }

//             // Insert all accumulated results for the city into the database
//             for (const result of accumulatedResults) {
//                 await insertAccumulatedScrapedData(city_id, result);
//             }

//             // Write all accumulated results to a file
//             for (const result of accumulatedResults) {
//                 await writeScrapedDataToFile(city_id, result);
//             }

//         } catch (error) {
//             console.error(`Error processing city_id ${city_id}:`, error.message);
//         }
//     }
// }

// const { scrapePage } = require('./scraper');
// const { loadUrlsFromSourceTable, insertAccumulatedScrapedData, writeScrapedDataToFile, getLastProcessedUrl, updateLastProcessedUrl } = require('./supabaseUtils');
// const DuckGPT = require('./DuckGPT'); 
// const OVH = require('./ovhgpt'); // Assuming you have an OVH module

// // Utility function to introduce delays
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // Function to get restaurant names from DuckGPT
// async function getRestaurantNamesFromDuckGPT(content) {
//     const duckGPT = new DuckGPT(); 
//     const prompt = `Here is some text from a webpage:\n\n${content}\n\nExtract the restaurant names from this text and provide them as an array. If no restaurant names are found, simply return "No Restaurant Found".`;       

//     try {
//         console.log(`Sending data to DuckGPT:\n${content}`);
//         await delay(40000); // 40 seconds delay for DuckGPT
//         const restaurantNames = await duckGPT.chat(prompt);
//         console.log(`DuckGPT response: ${restaurantNames}`);
        
//         if (Array.isArray(restaurantNames)) {
//             return restaurantNames.map(name => name.trim()).filter(name => name);
//         } else {
//             return 'No Restaurant Found';
//         }
//     } catch (error) {
//         console.error('Error interacting with DuckGPT:', error.message);
//         return 'Error fetching restaurant names.';
//     }
// }

// // Function to get response from OVH
// async function getResponseFromOVH(content) {
//     try {
//         console.log(`Sending data to OVH:\n${content}`);
//         await delay(20000); // 20 seconds delay for OVH
//         const response = await OVH(content);
//         console.log(`OVH response: ${response}`);
        
//         return response;
//     } catch (error) {
//         console.error('Error interacting with OVH:', error.message);
//         return 'Error fetching restaurant names.';
//     }
// }

// // Function to validate URLs
// function isValidUrl(url) {
//     const invalidDomains = ['reddit.com', 'airbnb.com', 'booking.com', 'trivago.com', 'facebook.com', 'instagram.com', 'tiktok.com'];
//     return !invalidDomains.some(domain => url.includes(domain));
// }

// // Function to process individual URLs
// async function processUrl(urlObj, city_id) {
//     const url = urlObj.url;
//     const scrapedData = await scrapePage(url);

//     if (scrapedData.length === 0) {
//         await writeScrapedDataToFile(city_id, { url, restaurants: 'No relevant content found' });
//         return;
//     }

//     const cleanedData = scrapedData.join(' ');

//     // Create promises for both DuckGPT and OVH
//     const duckGPTPromise = getRestaurantNamesFromDuckGPT(cleanedData);
//     const ovhPromise = getResponseFromOVH(cleanedData);

//     try {
//         // Wait for both responses
//         const [duckGPTResponse, ovhResponse] = await Promise.all([duckGPTPromise, ovhPromise]);

//         // Combine results
//         const result = {
//             url,
//             restaurants: {
//                 duckGPT: duckGPTResponse,
//                 ovh: ovhResponse
//             }
//         };

//         // Write results to a file and database
//         await writeScrapedDataToFile(city_id, result);
//         await insertAccumulatedScrapedData(city_id, result);

//     } catch (error) {
//         console.error(`Error processing ${url}:`, error.message);
//     }
// }

// // Main function to process all URLs for each city
// async function processUrls() {
//     const sourceData = await loadUrlsFromSourceTable();

//     for (const entry of sourceData) {
//         const { website_urls, city_id } = entry;
//         const lastProcessedUrl = await getLastProcessedUrl(city_id);

//         try {
//             const urls = Array.isArray(website_urls) ? website_urls : JSON.parse(website_urls);

//             for (const urlObj of urls) {
//                 const url = urlObj.url;

//                 // Skip invalid URLs
//                 if (!isValidUrl(url)) {
//                     console.log(`Skipping invalid URL: ${url}`);
//                     continue;
//                 }

//                 // Check if this URL has already been processed
//                 if (lastProcessedUrl && url <= lastProcessedUrl) {
//                     console.log(`Skipping already processed URL: ${url}`);
//                     continue; 
//                 }

//                 // Process the URL
//                 await processUrl(urlObj, city_id);
                
//                 // Update the last processed URL
//                 await updateLastProcessedUrl(city_id, url);
//             }
            
//         } catch (error) {
//             console.error(`Error processing city_id ${city_id}:`, error.message);
//         }
//     }
// }

// // Example usage of the main processing function
// (async () => {
//     try {
//         await processUrls();
//     } catch (error) {
//         console.error('Error in main execution:', error.message);
//     }
// })();

// const { scrapePage } = require('./scraper');
// const { loadUrls, writeResultsToFile, writeResultsToCSV } = require('./utils');
// const OVH = require('./ovhgpt'); // Import the OVH function
// const { loadUrlsFromSourceTable, insertAccumulatedScrapedData, writeScrapedDataToFile } = require('./supabaseUtils');

// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// async function getRestaurantNamesFromOVH(content) {
//     try {
//         const prompt = `Here is some text from a webpage:\n\n${content}\n\nExtract the restaurant names from this text and provide them as an array. If no restaurant names are found, simply return "No Restaurant Found". Do not include any additional text or explanations. Here is an example of the expected output: ["Restaurant A", "Restaurant B", "Restaurant C"]. Please strictly note that the output should be in the form of a array.`;
//         console.log(`Sending the following data to OVH:\n${prompt}`);
        
//         // Wait for 40 seconds before sending data
//         await delay(4000); // 4 seconds delay
        
//         const restaurantNames = await OVH(prompt);
//         console.log(`OVH response: ${restaurantNames}`);
//         return restaurantNames;
//     } catch (error) {
//         console.error('Error interacting with OVH:', error.message);
//         return 'Error fetching restaurant names.';
//     }
// }

// async function processUrls() {
//     const sourceData = await loadUrlsFromSourceTable();

//     for (const entry of sourceData) {
//         await delay(2000); 
//         const { website_urls, city_id } = entry;

//         try {
//             const urls = Array.isArray(website_urls) ? website_urls : JSON.parse(website_urls);
//             const accumulatedResults = []; // Array to store results for the current city

//             for (const urlObj of urls) {
//                 const url = urlObj.url;

//                 // Scrape the page and get filtered restaurant names
//                 const scrapedData = await scrapePage(url); // Assume scrapePage is defined elsewhere

//                 // Check if scraped data is empty
//                 if (scrapedData.length === 0) {
//                     await writeResultsToFile(url, 'No relevant content found');
//                     continue; // Skip to the next URL
//                 }

//                 // Clean and extract restaurant names from the scraped data
//                 const cleanedData = scrapedData.join(' '); // Assuming this is the cleaning step
//                 let restaurantNames = await getRestaurantNamesFromOVH(cleanedData);

//                 // Check if the response is an array
//                 if (Array.isArray(restaurantNames) && restaurantNames.length > 0) {
//                     // Store the result for the current URL
//                     accumulatedResults.push({
//                         url: url,
//                         restaurants: restaurantNames // Store the structured restaurant names
//                     });

//                     // Write results to CSV
//                     await writeResultsToCSV(city_id, url, cleanedData, restaurantNames);
//                 } else {
//                     console.log(`No restaurant names found for URL: ${url}`);
//                 }

//                 console.log("accumulatedResults", accumulatedResults);
//             }

//             // Insert all accumulated results for the city into the database
//             for (const result of accumulatedResults) {
//                 await insertAccumulatedScrapedData(city_id, result);
//             }

//             // Write all accumulated results to a file
//             for (const result of accumulatedResults) {
//                 await writeScrapedDataToFile(city_id, result);
//             }

//         } catch (error) {
//             console.error(`Error processing city_id ${city_id}:`, error.message);
//         }
//     }
// }




// // Run the script
// processUrls().catch(error => {
//     console.error('Error in processing URLs:', error.message);
// });

const { scrapePage } = require('./scraper');
const OVH = require('./ovhgpt'); // Import the OVH function
const { fetchProcessedCityIds, fetchNewCities, insertAccumulatedScrapedData } = require('./supabaseUtils'); // Updated supabaseUtils import

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getRestaurantNamesFromOVH(content) {
    try {
        const prompt = `Here is some text from a webpage:\n\n${content}\n\nExtract the restaurant names from this text and provide them as an array. If no restaurant names are found, simply return "No Restaurant Found". Do not include any additional text or explanations. Here is an example of the expected output: ["Restaurant A", "Restaurant B", "Restaurant C"]. Please strictly note that the output should be in the form of an array.`;
        console.log(`Sending the following data to OVH:\n${prompt}`);

        await delay(4000); // 4 seconds delay

        const restaurantNames = await OVH(prompt);
        console.log(`OVH response: ${restaurantNames}`);

        if (Array.isArray(restaurantNames)) {
            return restaurantNames.map(name => name.replace(/[$$$$"]/g, '').trim()); // Clean up the names
        } else if (restaurantNames === "No Restaurant Found") {
            return [];
        } else {
            return ['Error fetching restaurant names.'];
        }
    } catch (error) {
        console.error('Error interacting with OVH:', error.message);
        return [];
    }
}

function isValidUrl(url) {
    const invalidDomains = [
        'reddit.com', 'airbnb.com', 'booking.com', 'trivago.com',
        'facebook.com', 'instagram.com', 'tiktok.com',
        'youtube.com', 'makemytrip.com', 'expedia.com'
    ];
    return !invalidDomains.some(domain => url.includes(domain));
}

async function processUrl(url, city_id, accumulatedResults) {
    if (!isValidUrl(url)) {
        console.log(`Skipping invalid URL: ${url}`);
        return;
    }

    // Scrape the page and get filtered restaurant names
    const scrapedData = await scrapePage(url); // Assume scrapePage is defined elsewhere

    // Check if scraped data is empty
    if (scrapedData.length === 0) {
        console.log(`No relevant content found for URL: ${url}`);
        return; // Skip to the next URL
    }

    const cleanedData = scrapedData.join(' '); // Clean up data
    let restaurantNames = await getRestaurantNamesFromOVH(cleanedData);

    // Store the result for the current URL
    if (restaurantNames.length > 0) {
        accumulatedResults.push({
            url: url,
            restaurants: restaurantNames // Store the structured restaurant names
        });

        // Disabled file and CSV writing for time/space optimization
        // await writeResultsToCSV(city_id, url, cleanedData, restaurantNames);
    } else {
        console.log(`No restaurant names found for URL: ${url}`);
    }
}

async function processUrls() {
    try {
        // Fetch already processed city IDs from the supabaseWrite table
        const processedCityIds = await fetchProcessedCityIds();

        // Fetch new cities (not processed yet)
        const newCities = await fetchNewCities(processedCityIds);

        if (newCities.length === 0) {
            console.log('No new cities to process.');
            return;
        }

        for (const entry of newCities) {
            const { website_urls, city_id } = entry;

            try {
                const urls = Array.isArray(website_urls) ? website_urls : JSON.parse(website_urls);
                const accumulatedResults = []; // Array to store results for the current city

                // Process URLs in batches
                for (let i = 0; i < urls.length; i += 4) {
                    const batch = urls.slice(i, i + 4);
                    const promises = batch.map(urlObj => processUrl(urlObj.url, city_id, accumulatedResults));
                    await Promise.all(promises); // Wait for all promises in the batch to resolve

                    // Wait for 20 seconds before processing the next batch
                    await delay(20000); // 20 seconds delay
                }

                // Insert all accumulated results for the city into the database
                for (const result of accumulatedResults) {
                    await insertAccumulatedScrapedData(city_id, result);
                }

            } catch (error) {
                console.error(`Error processing city_id ${city_id}:`, error.message);
            }
        }

    } catch (error) {
        console.error('Error in fetching or processing cities:', error.message);
    }
}

// Run the script
processUrls().catch(error => {
    console.error('Error in processing URLs:', error.message);
});