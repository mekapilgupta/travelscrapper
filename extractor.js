const cheerio = require('cheerio');

// Define a list of irrelevant keywords to filter out
const irrelevantKeywords = [
    'Login', 'Sign up', 'Restaurants', 'Suppliers', 'Chefs', 'Real estates',
    'Jobs', 'Magazine', 'Home Page', 'Newsletter', 'Registration', 'Prices',
    'About us', 'Contact us', 'Regulations', 'Privacy', 'Cookies', 'Terms',
    // Add more keywords as needed...
];

function extractRelevantContent(content) {
    const $ = cheerio.load(content); // Load the HTML into cheerio for easy parsing

    // Extract relevant elements
    const elements = $('a, ul, li, td, tr, h1, h2, h3, h4, h5, h6, p') // Include all relevant tags
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

    return filteredRestaurantNames; // Return the unique restaurant names
}

module.exports = { extractRelevantContent };