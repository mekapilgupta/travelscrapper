const { scrapePage } = require('./scraper');
const { loadUrls, writeResultsToFile } = require('./utils');
const { cleanAndExtractRestaurantNames } = require('./nlp');
const DuckGPT = require('./DuckGPT'); 

const { loadUrlsFromSourceTable, insertAccumulatedScrapedData, writeScrapedDataToFile } = require('./supabaseUtils');



const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getRestaurantNamesFromDuckGPT(content) {
    const duckGPT = new DuckGPT(); 

    try {
        const prompt = `Here is some text from a webpage:\n\n${content}\n\nExtract the restaurant names from this text and provide them as an array. If no restaurant names are found, simply return "No Restaurant Found".`;       // Log the final filtered data being sent to DuckGPT
       console.log(`Sending the following data to DuckGPT:\n${content}`);
        
       // Wait for 40 seconds before sending data
       await delay(40000); // 40 seconds delay
       
        const restaurantNames = await duckGPT.chat(prompt);
        console.log(`DuckGPT response: ${restaurantNames}`);
        return restaurantNames;
    } catch (error) {
        console.error('Error interacting with DuckGPT:', error.message);
        return 'Error fetching restaurant names.';
    }
}

// // Main function to process all URLs asynchronously
// async function processUrls() {
//     const urlsFilePath = './urls.json'; 
//     const urls = await loadUrls(urlsFilePath);

//     for (const url of urls) {
//         console.log(`Processing URL: ${url}`);

//         try {
//             // Scrape the page and get filtered restaurant names
//             const scrapedData = await scrapePage(url);
//             console.log(`Scraped data: ${scrapedData}`);
            
//             if (scrapedData.length === 0) {
//                 console.log(`No relevant content found on: ${url}`);
//                 await writeResultsToFile(url, 'No relevant content found');
//                 continue;
//             }

//             // Send the scraped data to DuckGPT for processing using NLP cleaning if necessary.
//             //const cleanedData = cleanAndExtractRestaurantNames(scrapedData.join(' '));
//             const cleanedData = scrapedData.join(' ');

//             console.log(`..............cleaned data \n${cleanedData}`);
//             const restaurantNames = await getRestaurantNamesFromDuckGPT(cleanedData);

//             console.log(`Restaurant names found on ${url}: ${restaurantNames}`);
//             await writeResultsToFile(url, restaurantNames);

//         } catch (error) {
//             console.error(`Error processing URL ${url}:`, error.message);
//             await writeResultsToFile(url, 'Error processing URL');
//         }
//     }
// }






// Main function to process all URLs asynchronously
// async function processUrls() {
//     const sourceData = await loadUrlsFromSourceTable();

//     for (const entry of sourceData) {
//         await delay(2000); 
//         const { website_urls, city_id } = entry;

//         try {
//             const urls = Array.isArray(website_urls) ? website_urls : JSON.parse(website_urls);

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
//                 const restaurantNames = await getRestaurantNamesFromDuckGPT(cleanedData);

//                 // Structure restaurant names into an object
//                 const structuredRestaurants = {};
//                 const restaurantList = restaurantNames.split('\n').filter(name => name.trim() !== '');
//                 restaurantList.forEach((name, index) => {
//                     structuredRestaurants[index + 1] = name.replace(/^\d+\.\s*/, ''); // Remove leading numbers and spaces
//                 });

//                 // Insert the structured data into the database immediately
//                 await insertAccumulatedScrapedData(city_id, {
//                     url: url,
//                     restaurants: structuredRestaurants // Store the structured restaurant names
//                 });

//                 // Write the structured data to a file
//                 await writeScrapedDataToFile(city_id, {
//                     url: url,
//                     restaurants: structuredRestaurants
//                 });
//             }

//         } catch (error) {
//             console.error(`Error processing city_id ${city_id}:`, error.message);
//         }
//     }
// }






















async function processUrls() {
    const sourceData = await loadUrlsFromSourceTable();

    for (const entry of sourceData) {
        await delay(2000); 
        const { website_urls, city_id } = entry;

        try {
            const urls = Array.isArray(website_urls) ? website_urls : JSON.parse(website_urls);
            const accumulatedResults = []; // Array to store results for the current city

            for (const urlObj of urls) {
                const url = urlObj.url;

                // Scrape the page and get filtered restaurant names
                const scrapedData = await scrapePage(url); // Assume scrapePage is defined elsewhere

                // Check if scraped data is empty
                if (scrapedData.length === 0) {
                    await writeResultsToFile(url, 'No relevant content found');
                    continue; // Skip to the next URL
                }

                // Clean and extract restaurant names from the scraped data
                const cleanedData = scrapedData.join(' '); // Assuming this is the cleaning step
                let restaurantNames = await getRestaurantNamesFromDuckGPT(cleanedData);

                // // Check for unwanted text and handle no restaurant names
                // if (restaurantNames.includes("The text you provided does not contain any restaurant names.")) {
                //     restaurantNames = []; // Treat as no restaurant names
                // } else {
                //     // Remove unwanted introductory text
                //     restaurantNames = restaurantNames
                //         .replace(/Here are the restaurant names extracted from the text:\s*/, '')
                //         .replace(/\nLet me know if you need any further assistance.*/, '')
                //         .split('\n')
                //         .filter(name => name.trim() !== ''); // Split into an array and filter out empty names
                // }

                // Structure restaurant names into an object
                // const structuredRestaurants = {};
                // restaurantNames.forEach((name, index) => {
                //     structuredRestaurants[index + 1] = name.replace(/^\d+\.\s*/, ''); // Remove leading numbers and spaces
                // });

                // Store the result for the current URL
                accumulatedResults.push({
                    url: url,
                    restaurants: restaurantNames // Store the structured restaurant names
                });

                console.log("accumulatedResults",accumulatedResults);
            }

            // Insert all accumulated results for the city into the database
            for (const result of accumulatedResults) {
                await insertAccumulatedScrapedData(city_id, result);
            }

            // Write all accumulated results to a file
            for (const result of accumulatedResults) {
                await writeScrapedDataToFile(city_id, result);
            }

        } catch (error) {
            console.error(`Error processing city_id ${city_id}:`, error.message);
        }
    }
}















// Run the script
processUrls().catch(error => {
    console.error('Error in processing URLs:', error.message);
});