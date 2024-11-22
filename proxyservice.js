const fs = require('fs');
const https = require('https');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { URL } = require('url');

class ProxyService {
    constructor() {
        this.proxyFile = 'proxies.txt'; // Hardcoded path to the proxies file
        this.proxies = [];
        this.currentProxyIndex = 0; // Index to track the current proxy
    }

    // Load proxies from the specified file
    async loadProxies() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.proxyFile, 'utf8', (err, data) => {
                if (err) {
                    return reject(err);
                }
                // Split lines and filter out empty lines
                this.proxies = data.split('\n').map(line => line.trim()).filter(line => line);
                resolve(this.proxies);
            });
        });
    }

    // Send POST request using a rotating SOCKS5 proxy
    async sendPostRequest(url, data) {
        if (this.proxies.length === 0) {
            await this.loadProxies(); // Load proxies if not already loaded
        }

        const proxy = this.proxies[this.currentProxyIndex]; // Get the current proxy
        const [address, port, username, password] = proxy.split(':');

        const options = {
            hostname: new URL(url).hostname,
            port: new URL(url).port || 443,
            path: new URL(url).pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            agent: new SocksProxyAgent(`socks5://${username}:${password}@${address}:${port}`),
            timeout: 5000 // Set a timeout for the request
        };

        console.log(`Using SOCKS5 proxy: ${proxy}`);

        try {
            const response = await this.makeRequest(options, data);
            console.log(`Success from SOCKS5 proxy ${proxy}:`, response);
            this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length; // Rotate to the next proxy
            return response; // Return successful response
        } catch (error) {
            console.error(`Error with SOCKS5 proxy ${proxy}:`, error.message);
            this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length; // Rotate to the next proxy
            return this.sendPostRequest(url, data); // Retry with the next proxy
        }
    }

    // Helper function to make the actual HTTPS request
    makeRequest(options, data) {
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    resolve(responseData); // Resolve with response data
                });
            });

            req.on('error', (err) => {
                reject(err); // Reject on error
            });

            req.write(JSON.stringify(data)); // Send request body
            req.end(); // End the request
        });
    }
}

module.exports = ProxyService;
