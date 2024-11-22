const fs = require('fs');

async function loadUrls(filePath) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData.urls || [];
    } catch (error) {
        console.error('Error loading URLs from file:', error);
        return [];
    }
}

async function writeResultsToFile(url, message) {
    const path = 'results.log';
    fs.appendFileSync(path, `URL: ${url} - Message: ${message}\n`);
}




// Utility function to write results to a CSV file
async function writeResultsToCSV(cityId, url, scrapedData, ovhData) {
    
    const path = `results_${cityId}.csv`;

    // Check if the file exists, if not, write the header
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, 'id,url,scraped_data,ovh_data\n'); // CSV header
    }

    // Prepare the data to write
    const id = Date.now(); // Use timestamp as a unique ID
    const ovhDataString = Array.isArray(ovhData) ? ovhData.join('; ') : ovhData; // Convert array to string

    // Write the data to the CSV file
    fs.appendFileSync(path, `${id},"${url}","${scrapedData}","${ovhDataString}"\n`);
}
module.exports = { loadUrls, writeResultsToFile , writeResultsToCSV };