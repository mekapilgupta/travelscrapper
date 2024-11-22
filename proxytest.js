const fs = require('fs');
const https = require('https');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { URL } = require('url');

const webhookUrl = 'https://webhook.site/9ea5caeb-b25f-4933-bb29-86ec685dbc8a';

// Function to read proxies from a file
function readProxiesFromFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            // Split lines and filter out empty lines
            const proxies = data.split('\n').map(line => line.trim()).filter(line => line);
            resolve(proxies);
        });
    });
}

// Function to send POST request using SOCKS5 proxy
async function sendPostRequestSocks(proxy) {
    const [address, port, username, password] = proxy.split(':');
    const url = new URL(webhookUrl);

    const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        agent: new SocksProxyAgent(`socks5://${username}:${password}@${address}:${port}`), // Use the SOCKS proxy agent
        timeout: 5000 // Set a timeout for the request
    };

    console.log(`Testing SOCKS5 proxy: ${proxy}`);

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`Success from SOCKS5 proxy ${proxy}:`, data);
                resolve();
            });
        });

        req.on('error', (err) => {
            console.error(`Error with SOCKS5 proxy ${proxy}:`, err.message);
            reject(err);
        });

        req.end(); // End the request
    });
}

// Main function to run the process
(async () => {
    try {
        const proxies = await readProxiesFromFile('proxies.txt'); // Read proxies from the file

        for (const proxy of proxies) {
            let success = false;

            // Try SOCKS5 with retries
            for (let attempt = 0; attempt < 3 && !success; attempt++) { // Retry up to 3 times
                try {
                    await sendPostRequestSocks(proxy);
                    success = true; // Mark as successful if no error occurs
                } catch (socksError) {
                    console.error(`SOCKS5 failed for ${proxy}, attempt ${attempt + 1}:`, socksError.message);
                }
            }

            if (!success) { 
                console.error(`SOCKS5 failed for ${proxy} after multiple attempts.`);
            }
        }
    } catch (error) {
        console.error('Error reading proxies:', error.message);
    }
})();