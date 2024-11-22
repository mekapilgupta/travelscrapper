const DuckGPT = require('./DuckGPT'); // Import DuckGPT class

(async () => {
    // Create an instance of DuckGPT, specifying the model you'd like to use
    const model = 'claude-3-haiku-20240307';  // You can choose any model like 'gpt-4o-mini' or 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
    const duckGPT = new DuckGPT(model);

    const prompt = "What is the meaning of life?"; // The prompt you want to send to the model

    // Loop to retry sending the request 5 times if necessary
    for (let i = 0; i < 5; i++) {
        try {
            const response = await duckGPT.chat(prompt); // Send request through ProxyService
            console.log(`API Response ${i + 1}:`, response);
        } catch (error) {
            console.error(`Error on attempt ${i + 1}:`, error.message);
        }
    }
})();
