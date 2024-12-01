const OpenAI = require('openai');
require('dotenv').config(); // Ensure you have dotenv to manage environment variables

class ChatGPT {
    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY, // Use your OpenAI API key from environment variables
        });
    }

    // async chat(prompt) {
    //     try {
    //         const response = await this.client.chat.completions.create({
    //             model: 'gpt-4', // Specify the model you want to use
    //             messages: [{ role: 'user', content: prompt }],
    //         });

    //         // Assuming the response structure contains choices
    //         const message = response.choices[0].message.content;
    //         return message; // Parse the response as JSON if it's expected to be an array
    //     } catch (error) {
    //         console.error('Error fetching response from ChatGPT:', error.message);
    //         throw error; // Rethrow the error for handling in the calling function
    //     }
    // }




    async chat(prompt) {
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o-mini-2024-07-18', // Specify the model you want to use
                messages: [
                    { role: "system", content: "You extract restaurant names into a JSON array." },
                    { role: "user", content: prompt }
                ],
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "restaurant_schema",
                        schema: {
                            type: "object",
                            properties: {
                                restaurantNames: {
                                    description: "An array of restaurant names found in the input",
                                    type: "array",
                                    items: {
                                        type: "string"
                                    }
                                }
                            },
                            additionalProperties: false
                        }
                    }
                }
            });
    
            // Assuming the response structure contains choices
            const message = response.choices[0].message.content;
            const parsedResponse = JSON.parse(message);
    
            // Check if restaurantNames is empty or not
            if (!parsedResponse.restaurantNames || parsedResponse.restaurantNames.length === 0) {
                return ["No Restaurant Found"];
            }
    
            return parsedResponse.restaurantNames; // Return the array of restaurant names
        } catch (error) {
            console.error('Error fetching response from ChatGPT:', error.message);
            throw error; // Rethrow the error for handling in the calling function
        }
    }
}

module.exports = ChatGPT;
