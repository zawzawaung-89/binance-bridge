export default async function handler(req, res) {
  try {
    // 1. Extract the custom 'path' parameter sent from your Google Apps Script
    const { path, ...otherParams } = req.query;

    if (!path) {
      return res.status(400).json({ error: "Missing 'path' parameter from Google Apps Script." });
    }

    // 2. Grab the API Key forwarded from your Google Sheet headers
    const apiKey = req.headers['x-mbx-apikey'] || req.headers['X-MBX-APIKEY'];
    if (!apiKey) {
      return res.status(400).json({ error: "API key missing from request headers." });
    }

    // 3. Reconstruct the exact URL that Binance Demo expects
    let binanceUrl = `https://demo-fapi.binance.com${path}`;

    // Append the remaining signed parameters (symbol, timestamp, signature, etc.)
    const queryString = Object.keys(otherParams)
      .map(key => `${key}=${encodeURIComponent(otherParams[key])}`)
      .join('&');

    if (queryString) {
      binanceUrl += (binanceUrl.includes('?') ? '&' : '?') + queryString;
    }

    // 4. Hand request off to Binance Demo
    const response = await fetch(binanceUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-MBX-APIKEY': apiKey
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });

    // 5. Handle responses safely even if Binance throws an unparsed error text
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { rawResponse: responseText };
    }

    res.status(response.status).json(responseData);

  } catch (error) {
    res.status(500).json({ 
      error: "Vercel Proxy failed to connect to Binance", 
      details: error.message 
    });
  }
}
