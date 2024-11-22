const ProxyService = require('./ProxyService');

(async () => {
    const proxyService = new ProxyService(); // No need to pass proxy file

    const url = 'https://webhook.site/9ea5caeb-b25f-4933-bb29-86ec685dbc8a'; // Target API endpoint
    const data = { message: 'Hello World' }; // Data to send

    for (let i = 0; i < 5; i++) {
        try {
            const response = await proxyService.sendPostRequest(url, data); // Send request through proxy
            console.log(`API Response ${i + 1}:`, response);
        } catch (error) {
            console.error(`Error on attempt ${i + 1}:`, error.message);
        }
    }
})();
