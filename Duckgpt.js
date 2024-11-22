const axios = require('axios');

const STATUS_URL = 'https://duckduckgo.com/duckchat/v1/status';
const CHAT_API = 'https://duckduckgo.com/duckchat/v1/chat';

class DuckGPT {
    // Now, the constructor accepts a model name, so you can specify any of the available models
    constructor(model = 'gpt-4o-mini') {
        this.model = model;
        this.headers = {
            'User-Agent': 'Mozilla/5.0',
            'Accept': '*/*',
            'Accept-Language': 'en-US',
            'x-vqd-accept': '1',
            'Connection': 'keep-alive',
            'Cookie': 'dcm=3',
        };
    }

    // Fetch VQD value from the status endpoint
    async getVQD() {
        const response = await axios.get(STATUS_URL, { headers: this.headers });
        const vqd = response.headers['x-vqd-4'];
        if (!vqd) throw new Error("No 'x-vqd-4' header found.");
        return vqd;
    }

    // Main method to send the chat request
    async chat(prompt, retries = 3) {
        const vqd = await this.getVQD();
        this.headers['x-vqd-4'] = vqd;
        this.headers['Content-Type'] = 'application/json';

        const data = {
            model: this.model, // Use the dynamic model
            messages: [{ role: 'user', content: prompt }]
        };

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const response = await axios.post(CHAT_API, data, { headers: this.headers });

                if (response.status === 200) {
                    const chatMessages = response.data.split('\n')
                        .filter(line => line.includes('message'))
                        .map(line => JSON.parse(line.split('data: ')[1]).message || '')
                        .join('');

                    const cleanedResponse = chatMessages.replace(/```json|```/g, "").trim();
                    return cleanedResponse;
                }
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    console.log("Rate limit exceeded. Retrying...");
                } else {
                    throw error;
                }
            }

            // Exponential backoff: 2s, 4s, 8s, etc.
            await this.delay(2000 * Math.pow(2, attempt));
        }

        throw new Error("Max retries reached for chat request.");
    }

    // Simple delay function for exponential backoff
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = DuckGPT;



// const axios = require('axios');
// const fs = require('fs');
// const https = require('https');
// const { SocksProxyAgent } = require('socks-proxy-agent');
// const { URL } = require('url');

// const CHAT_API = 'https://duckduckgo.com/duckchat/v1/chat';

// class ProxyService {
//     constructor() {
//         this.proxyFile = 'proxies.txt'; // Hardcoded path to the proxies file
//         this.proxies = [];
//         this.currentProxyIndex = 0; // Index to track the current proxy
//     }

//     // Load proxies from the specified file
//     async loadProxies() {
//         return new Promise((resolve, reject) => {
//             fs.readFile(this.proxyFile, 'utf8', (err, data) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 // Split lines and filter out empty lines
//                 this.proxies = data.split('\n').map(line => line.trim()).filter(line => line);
//                 resolve(this.proxies);
//             });
//         });
//     }

//     // Send POST request using a rotating SOCKS5 proxy
//     async sendPostRequest(url, data, retryCount = 0) {
//         const MAX_RETRIES = 3; // Maximum number of retries
//         if (this.proxies.length === 0) {
//             await this.loadProxies(); // Load proxies if not already loaded
//         }
    
//         const proxy = this.proxies[this.currentProxyIndex]; // Get the current proxy
//         const [address, port, username, password] = proxy.split(':');
    
//         const options = {
//             hostname: new URL(url).hostname,
//             port: new URL(url).port || 443,
//             path: new URL(url).pathname,
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'User-Agent': 'Mozilla/5.0',
//                 'Accept': '*/*',
//                 'Accept-Language': 'en-US',
//                 'Connection': 'keep-alive',
//                 'Cookie': 'dcm=3',
//             },
//             agent: new SocksProxyAgent(`socks5://${username}:${password}@${address}:${port}`),
//             timeout: 5000
//         };
    
//         console.log(`Using SOCKS5 proxy: ${proxy}`);
//         console.log('Request Options:', options);
//         console.log('Request Data:', JSON.stringify(data));
    
//         try {
//             const response = await this.makeRequest(options, data);
//             console.log(`Success from SOCKS5 proxy ${proxy}:`, response);
//             this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
//             return response;
//         } catch (error) {
//             console.error(`Error with SOCKS5 proxy ${proxy}:`, error.message);
            
//             if (retryCount < MAX_RETRIES) {
//                 this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
//                 console.log(`Retrying with next proxy... (Attempt ${retryCount + 1})`);
//                 return this.sendPostRequest(url, data, retryCount + 1);
//             } else {
//                 console.error(`Max retries reached for proxy ${proxy}.`);
//                 throw new Error(`Failed to send POST request after ${MAX_RETRIES} attempts.`);
//             }
//         }
//     }
    
    

//     // Helper function to make the actual HTTPS request
//     makeRequest(options, data) {
//         return new Promise((resolve, reject) => {
//             const req = https.request(options, (res) => {
//                 let responseData = '';

//                 res.on('data', (chunk) => {
//                     responseData += chunk;
//                 });

//                 res.on('end', () => {
//                     resolve(responseData); // Resolve with response data
//                 });
//             });

//             req.on('error', (err) => {
//                 reject(err); // Reject on error
//             });

//             req.write(JSON.stringify(data)); // Send request body
//             req.end(); // End the request
//         });
//     }
// }

// class DuckGPT {
//     constructor(model = 'gpt-4o-mini') {
//         this.model = model;
//         this.proxyService = new ProxyService(); // Initialize ProxyService instance
//     }

//     async chat(prompt, retries = 3) {
//         const data = {
//             model: this.model,
//             messages: [{ role: 'user', content: prompt }]
//         };

//         for (let attempt = 0; attempt < retries; attempt++) {
//             try {
//                 const responseData = await this.proxyService.sendPostRequest(CHAT_API, data); // Use ProxyService to send request

//                 const chatMessages = responseData.split('\n')
//                     .filter(line => line.includes('message'))
//                     .map(line => JSON.parse(line.split('data: ')[1]).message || '')
//                     .join('');

//                 const cleanedResponse = chatMessages.replace(/```json|```/g, "").trim();
//                 return cleanedResponse;

//             } catch (error) {
//                 if (error.response && error.response.status === 429) {
//                     console.log("Rate limit exceeded. Retrying...");
//                 } else {
//                     throw error;
//                 }
//             }

//             await this.delay(2000 * Math.pow(2, attempt));
//         }

//         throw new Error("Max retries reached for chat request.");
//     }

//     async delay(ms) {
//         return new Promise(resolve => setTimeout(resolve, ms));
//     }
// }

// module.exports = DuckGPT;