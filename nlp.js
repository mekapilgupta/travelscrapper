// const nlp = require('compromise');
// const natural = require('natural');

// // Expanded list of stopwords
// const stopWords = [
//     'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
//     'have', 'has', 'had', 'do', 'does', 'did', 'doing',
//     // Add more stopwords as needed...
// ];

// function preprocessText(text) {
//     let cleanedText = text.replace(/https?:\/\/[^\s]+/g, '')  // Remove URLs
//                            .replace(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g, '')  // Remove emails
//                            .replace(/(\+?\d[\d -]{8,}\d)/g, '')  // Remove phone numbers

//     return cleanedText.trim();
// }

// function nlpCleanText(text) {
//     let doc = nlp(text);

//     stopWords.forEach(word => {
//         doc = doc.not(word);
//     });

//     const tokenizer = new natural.WordTokenizer();
//     let tokens = tokenizer.tokenize(doc.text());
    
//     tokens = tokens.filter(token => token.length > 1 && !stopWords.includes(token.toLowerCase()));

//     return tokens.join(' ');
// }

// module.exports = { preprocessText, nlpCleanText };


//const nlp = require('compromise');


const { removeStopwords } = require('stopword');

// Expanded list of stopwords (including domain-specific and irrelevant terms)
const customStopWords = new Set([
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'doing',
    'the', 'and', 'or', 'but', 'if', 'to', 'for', 'in',
    'on', 'at', 'with', 'by', 'of', 'this', 'that',
    'it', 'they', 'we', 'you', 'he', 'she',
    'there', 'here', 'where', 'how', 'when',
    'which', 'who', 'whom', 'whose',
    'can', 'should', 'would', 'will', 'must',
    // Domain-specific terms
    'travel', 'tips', 'frequently', 
    // Irrelevant categories
    'about', 
    // Additional words to remove
    "tasty", "best", "great", "good", "awful", "overpriced",
    "food", "service", "experience", "blog", "careers", "press",
    "reservation", "software", "insights", "resources", "how to",
    "reviews", "review", "choice", "smart", "delicious", "amazing",
    "fantastic", "lovely", "charming", "delightful", "superb", "nice",
    "cheap", "expensive", "quality", "dining", "cuisine", "menu", "dish", "meal"
]);

// Preprocess the text by removing URLs, emails, domain names, dates, and unwanted words
function preprocessText(text) {
    return text.replace(/https?:\/\/[^\s]+/g, '')  // Remove URLs
               .replace(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g, '')  // Remove emails
               .replace(/\b(?:[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})\b/g, '')  // Remove domain names
               .replace(/\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/g, '')  // Remove dates (MM/DD/YYYY or similar)
               .replace(/\b\d{1,4}[\/.-]\d{1,2}[\/.-]\d{1,2}\b/g, '')  // Remove dates (YYYY/MM/DD or similar)
               .replace(/[^\x00-\x7F]+/g, '') // Remove non-ASCII characters (if not needed)
               .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters (retain letters and numbers)
               .trim();
}

// Clean the text using custom logic
function cleanAndExtractRestaurantNames(text) {
    const cleanedText = preprocessText(text);
    
    // Split the cleaned text into words
    const words = cleanedText.split(/\s+/);

    // Remove stop words using the stopword library
    const filteredWords = removeStopwords(words);

    // Filter out custom stop words
    const finalWords = filteredWords.filter(word => !customStopWords.has(word.toLowerCase()));

    // Extract potential restaurant names (assuming they are proper nouns)
    const restaurantNames = finalWords.filter(word => /^[A-Z]/.test(word));

    // Join the names into a single string or return as an array
    return restaurantNames.join(' ');
}

module.exports = { cleanAndExtractRestaurantNames };
