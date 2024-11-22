// ovhgpt.js
const axios = require('axios');
const config = require('./config.json'); // Import the config file

const tokens = config.tokens; // Access the tokens from the config
let currentTokenIndex = 0;

const url = "https://llama-3-1-70b-instruct.endpoints.kepler.ai.cloud.ovh.net/api/openai_compat/v1/chat/completions";

const headers = {
    "Content-Type": "application/json",
};

async function OVH(prompt) {
    // Rotate the token
    const token = tokens[currentTokenIndex];
    headers.Authorization = `Bearer ${token}`;

    const payload = {
        max_tokens: 1000,
        messages: [
            {
                content: prompt,
                name: "User",
                role: "user"
            }
        ],
        model: "Meta-Llama-3_1-70B-Instruct",
        temperature: 0,
    };

    try {
        const response = await axios.post(url, payload, { headers });
        if (response.status === 200) {
            const choices = response.data.choices;
            // Update the token index for the next request
            currentTokenIndex = (currentTokenIndex + 1) % tokens.length;
            return choices.map(choice => choice.message.content.trim());
        }
    } catch (error) {
        console.error('Error in OVH API:', error.response ? error.response.data : error.message);
        return null; // Return null in case of error
    }
}

module.exports = OVH; // Export as a regular function
