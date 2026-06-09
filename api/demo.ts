export default async function handler(req, res) {
  // 1. Set the target to the Binance Demo URL
  const targetUrl = `https://demo-fapi.binance.com${req.url.replace('/api/demo', '')}`;

  // 2. Extract the keys sent DIRECTLY from Google Apps Script headers (ignoring Vercel settings)
  const apiKey = req.headers['x-mbx-apikey'] || req.headers['X-MBX-APIKEY'];

  if (!apiKey) {
      return res.status(400).json({ error: "No API key received from Google Apps Script." });
  }

  // 3. Forward the exact request to Binance Demo
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-MBX-APIKEY': apiKey // Passing your testnet key from Apps Script
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Vercel Proxy failed to connect to Binance' });
  }
}
