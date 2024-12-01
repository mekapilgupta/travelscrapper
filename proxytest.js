const fs = require('fs');
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
const net = require('net');  // For checking raw SOCKS5 proxy connectivity

// Function to get public IP through the proxy
async function getProxyIp(proxy) {
  const agent = new SocksProxyAgent(`socks5h://${proxy}`);

  try {
    // Use a service like ipify to get the public IP
    const response = await axios.get('https://api.ipify.org?format=json', {
      httpAgent: agent,
      httpsAgent: agent,
      timeout: 5000
    });
    return response.data.ip;
  } catch (error) {
    console.log(`[NOT WORKING] Could not fetch IP through proxy ${proxy}. Error: ${error.message}`);
    return null;
  }
}

// Function to test HTTP(S) proxy with Axios
async function testHttpProxy(proxy) {
  const agent = new SocksProxyAgent(`socks5h://${proxy}`);
  try {
    const response = await axios.get('https://www.google.com', {
      httpAgent: agent,
      httpsAgent: agent,
      timeout: 5000
    });
    if (response.status === 200) {
      console.log(`[WORKING] HTTP(S) Proxy ${proxy} is working.`);
      const proxyIp = await getProxyIp(proxy);
      if (proxyIp) {
        console.log(`[INFO] HTTP(S) Proxy ${proxy} is routing traffic through IP: ${proxyIp}`);
      }
    } else {
      console.log(`[NOT WORKING] HTTP(S) Proxy ${proxy} failed with status: ${response.status}`);
    }
  } catch (error) {
    console.log(`[NOT WORKING] HTTP(S) Proxy ${proxy} failed. Error: ${error.message}`);
  }
}

// Function to test raw SOCKS5 proxy connectivity
function testRawSocksProxy(proxy) {
  const [host, port] = proxy.split(':');
  const socket = new net.Socket();

  socket.setTimeout(5000); // Set a 5-second timeout
  socket.on('connect', async () => {
    console.log(`[WORKING] SOCKS5 Proxy ${proxy} is responsive.`);
    const proxyIp = await getProxyIp(proxy);
    if (proxyIp) {
      console.log(`[INFO] SOCKS5 Proxy ${proxy} is routing traffic through IP: ${proxyIp}`);
    }
    socket.end();  // Close the connection after testing
  });

  socket.on('timeout', () => {
    console.log(`[NOT WORKING] SOCKS5 Proxy ${proxy} timed out.`);
    socket.destroy();
  });

  socket.on('error', (err) => {
    console.log(`[NOT WORKING] SOCKS5 Proxy ${proxy} failed. Error: ${err.message}`);
    socket.destroy();
  });

  socket.connect(parseInt(port), host);
}

// Function to test a proxy
async function testProxy(proxy) {
  // First, try HTTP(S) proxy test
  await testHttpProxy(proxy);

  // Then, try raw SOCKS5 connection test if the HTTP(S) test fails or if needed
  testRawSocksProxy(proxy);
}

// Read proxy list from file
fs.readFile('proxy.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading proxy.txt:', err);
    return;
  }

  // Split the file content into an array of proxies
  const proxies = data.split('\n').map(proxy => proxy.trim()).filter(proxy => proxy);

  // Test each proxy
  proxies.forEach(testProxy);
});
