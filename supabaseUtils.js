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

















const fs = require('fs');
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

async function loadUrlsFromSourceTable() {
    const { data, error } = await supabaseRead
        .from('restaurant_websites_by_city') // Replace with your actual source table name
        .select('website_urls, city_id') // Select the necessary columns
        .neq('count_of_urls', 0) // Exclude rows where count_of_urls is 0
        .order('city_id', { ascending: true }) // Order by city_id in ascending order
        .limit(100); // Limit the number of results to 100 (adjust as needed)

    if (error) {
        console.error('Error loading URLs from source table:', error);
        return [];
    }
    return data; // Return the data directly
}


// Insert accumulated scraped data into the city_restaurant_data table
async function insertAccumulatedScrapedData(cityId, accumulatedData) {
    const { error } = await supabaseWrite
        .from('city_restaurant_data') // Replace with your actual destination table name
        .insert([{ city_id: cityId, scraped_data: accumulatedData }]); // Adjust the object structure as needed

    if (error) {
        console.error('Error inserting accumulated scraped data into city_restaurant_data:', error.message);
    } else {
        console.log('Accumulated scraped data inserted into city_restaurant_data');
    }
}

// Write scraped data to a CSV or TXT file
async function writeScrapedDataToFile(cityId, scrapedData) {
    const filePath = path.join(__dirname, `city_restaurants_scraped_${cityId}.txt`);
    const dataToWrite = `City ID: ${cityId}\nURL: ${scrapedData.url}\nRestaurants:\n`;

    // Format the restaurants object into a string
    const restaurantEntries = Object.entries(scrapedData.restaurants)
        .map(([key, name]) => `${key}: ${name}`)
        .join('\n');

    fs.appendFile(filePath, dataToWrite + restaurantEntries + '\n\n', (err) => {
        if (err) {
            console.error('Error writing to file:', err.message);
        }
    });
}


async function getLastProcessedUrl(city_id) {
    const { data, error } = await supabase
        .from('processed_urls')
        .select('last_processed_url')
        .eq('city_id', city_id)
        .single();

    if (error) {
        console.error('Error fetching last processed URL:', error.message);
        return null;
    }
    return data ? data.last_processed_url : null;
}

async function updateLastProcessedUrl(city_id, url) {
    const { error } = await supabase
        .from('processed_urls')
        .upsert({ city_id, last_processed_url: url });

    if (error) {
        console.error('Error updating last processed URL:', error.message);
    }
}


module.exports = { loadUrlsFromSourceTable, insertAccumulatedScrapedData, writeScrapedDataToFile ,updateLastProcessedUrl ,getLastProcessedUrl};