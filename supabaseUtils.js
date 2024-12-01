const { createClient } = require('@supabase/supabase-js') ;
const path = require('path');

// const supabaseUrl = 'https://nzegsplwspdegfvkyyyj.supabase.co';
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZWdzcGx3c3BkZWdmdmt5eXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5ODQwMDQsImV4cCI6MjA0MjU2MDAwNH0.n9s-AyhG3GuaUhU4O7GCSZB2b9ySOWMRUyn29pIjYJ0'; // Ensure this is set in your environment
// const supabase = createClient(supabaseUrl, supabaseKey);




// Supabase client for reading data
const supabaseUrlRead = 'https://nzegsplwspdegfvkyyyj.supabase.co'; // Replace with your read account URL
const supabaseKeyRead = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZWdzcGx3c3BkZWdmdmt5eXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5ODQwMDQsImV4cCI6MjA0MjU2MDAwNH0.n9s-AyhG3GuaUhU4O7GCSZB2b9ySOWMRUyn29pIjYJ0'; // Replace with your read account key
const supabaseRead = createClient(supabaseUrlRead, supabaseKeyRead);

// Supabase client for writing data
const supabaseUrlWrite = 'https://lxukddwtmwrpfxdzwtes.supabase.co'; // Replace with your write account URL
const supabaseKeyWrite = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dWtkZHd0bXdycGZ4ZHp3dGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMDA4NjcsImV4cCI6MjA0NzY3Njg2N30.HnUSNLDKHIF8Jnrz98jfCSXdiYus39E8zwztVCgFAQU'; // Replace with your write account key
const supabaseWrite = createClient(supabaseUrlWrite, supabaseKeyWrite);

















// const fs = require('fs');
// Load URLs from the source table
// async function loadUrlsFromSourceTable() {
//     const { data, error } = await supabase
//         .from('restaurant_websites_by_city') // Replace with your actual source table name
//         .select('website_urls, city_id'); // Select the necessary columns

//     if (error) {
//         console.error('Error loading URLs from source table:', error);
//         return [];
//     }
//     //console.log('Loaded URLs from source table:', data);
//     return data; // Return the data directly
// }


const logFilePath = path.join(__dirname, 'scraping.log');

function logMessage(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
}

// const fs = require('fs');

// // Fetch processed city IDs from supabaseWrite
// async function fetchProcessedCityIds() {
//     try {
//         // Fetch the processed city IDs from supabaseWrite
//         const { data, error } = await supabaseWrite
//             .from('city_restaurant_data') // Your table where processed cities are stored
//             .select('city_id'); // Select only the city_id field

//         if (error) {
//             throw error;  // If there's an error, throw it
//         }

//         // Extract city_ids from the response
//         const processedCityIds = data.map(entry => entry.city_id);
//         console.log('Processed city IDs:', processedCityIds);

//         return processedCityIds;
//     } catch (error) {
//         console.error('Error fetching processed city IDs:', error.message);
//         return [];  // Return an empty array if there's an error
//     }
// }

// // Fetch new cities from supabaseRead, excluding the processed ones
// async function fetchNewCities(processedCityIds) {
//     try {
//         const { data, error } = await supabaseRead
//             .from('restaurant_websites_by_city') // Your source table
//             .select('website_urls, city_id') // Select the relevant columns
//             .neq('count_of_urls', 0) // Ensure there's data
//             .limit(100); // Adjust this limit as needed

//         if (error) {
//             throw error;
//         }

//         // Filter out cities that have already been processed
//         const newCities = data.filter(entry => !processedCityIds.includes(entry.city_id));
//         console.log('New cities to process:', newCities);

//         return newCities;
//     } catch (error) {
//         console.error('Error fetching new cities:', error.message);
//         return [];  // Return an empty array if there's an error
//     }
// }

// // Insert accumulated scraped data into the city_restaurant_data table
// async function insertAccumulatedScrapedData(cityId, accumulatedData) {
//     const { error } = await supabaseWrite
//         .from('city_restaurant_data')
//         .insert([{ city_id: cityId, scraped_data: accumulatedData }]);

//     if (error) {
//         console.error('Error inserting accumulated scraped data into city_restaurant_data:', error.message);
//     } else {
//         console.log('Accumulated scraped data inserted into city_restaurant_data');
//     }
// }

// module.exports = { fetchProcessedCityIds, fetchNewCities, insertAccumulatedScrapedData };



const fs = require('fs');
const csv = require('csv-parser');

// Utility to add timeout logic for database queries
function fetchWithTimeout(promise, timeout = 30000) { // Default 30 seconds timeout
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timed out')), timeout)
    );
    return Promise.race([promise, timeoutPromise]);
}

// Fetch processed city IDs from supabaseWrite
async function fetchProcessedCityIds() {
    try {
        const queryPromise = supabaseWrite
            .from('city_restaurant_data')
            .select('city_id'); // Select only the city_id field

        const { data, error } = await fetchWithTimeout(queryPromise);

        if (error) {
            throw error;
        }

        // Extract city_ids from the response
        const processedCityIds = data.map(entry => entry.city_id);
        console.log('Processed city IDs:', processedCityIds);

        return processedCityIds;
    } catch (error) {
        console.error('Error fetching processed city IDs:', error.message);
        return []; // Return an empty array if there's an error
    }
}

// Fetch data for a specific city ID from supabaseRead
async function fetchDataForCity(cityId) {
    let retries = 3;
    let result = null;

    while (retries > 0) {
        try {
            const queryPromise = supabaseRead
                .from('restaurant_websites_by_city')
                .select('website_urls, city_id')
                .eq('city_id', cityId)
                .neq('count_of_urls', 0);

            const { data, error } = await fetchWithTimeout(queryPromise);

            if (error) {
                throw error;
            }

            result = data;
            break;
        } catch (error) {
            console.error(`Error fetching data for city ID ${cityId}:`, error.message);
            retries -= 1;
            if (retries > 0) {
                console.log(`Retrying... attempts left: ${retries}`);
            }
        }
    }

    return result || []; // Return empty array if no data is found after retries
}

// Function to read city IDs and names from CSV (file4.csv)
async function readCityDataFromCSV() {
    return new Promise((resolve, reject) => {
        const cityData = [];
        fs.createReadStream('file4.csv')
            .pipe(csv())
            .on('data', (row) => {
                // Check the structure of the CSV file to ensure columns 'id' and 'name' exist
                if (row.id && row.city_name) {
                    console.log(`Adding city: ${row.id} - ${row.city_name}`);
                    cityData.push({ id: row.id, name: row.city_name });
                } else {
                    console.warn(`Missing data for city in row:`, row);
                }
            })
            .on('end', () => {
                resolve(cityData);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}


// Function to insert accumulated scraped data into supabaseWrite
async function insertAccumulatedScrapedData(cityId, accumulatedData) {
    try {
        const { error } = await supabaseWrite
            .from('city_restaurant_data')
            .insert([{ city_id: cityId, scraped_data: accumulatedData }]);

        if (error) {
            console.error('Error inserting accumulated scraped data:', error.message);
        } else {
            console.log('Accumulated scraped data inserted successfully');
        }
    } catch (error) {
        console.error('Error inserting accumulated scraped data:', error.message);
    }
}

module.exports = {
    fetchProcessedCityIds,
    fetchDataForCity,
    readCityDataFromCSV,
    insertAccumulatedScrapedData
};


