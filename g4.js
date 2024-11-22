// Import the G4F library
const { G4F } = require("g4f");

// Create an instance of G4F with debugging enabled
const g4f = new G4F({ debug: true });

// Define your messages
const messages = [
    { role: "user", content: "Hi, what's up?" }
];

// Define options for chat completion
const options = {
    provider: g4f.providers.GPT, // Specify the provider if necessary
    model: "gpt-3.5-turbo", // Specify the model
};

// Function to get chat completion
(async () => {
    try {
        // Call chatCompletion with messages and options
        const response = await g4f.chatCompletion(messages, options);
        console.log("Response from GPT:", response);
    } catch (error) {
        // Log any errors that occur during the request
        console.log(messages,options)
        console.error("Error during chat completion:", error);
    }
})();

// Example with system role for poetry expertise
const poetryMessages = [
    { role: "system", content: "You're an expert bot in poetry." },
    { role: "user", content: "Hi, write me something." }
];

// Function to get poetry completion
(async () => {
    try {
        const poetryResponse = await g4f.chatCompletion(poetryMessages, options);
        console.log("Poetry Response from GPT:", poetryResponse);
    } catch (error) {
        console.error("Error during poetry completion:", error);
    }
})();