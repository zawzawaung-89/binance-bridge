import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const reqUrl = req.url || '';
    const urlParts = reqUrl.split('?');
    const queryString = urlParts[1] || '';

    if (!queryString) {
      return res.status(400).json({ error: "Missing query parameters from Google Apps Script." });
    }

    // Split parameters by '&' to isolate the proxy decorations
    const queryParts = queryString.split('&');
    
    // Based on your Google Apps Script URL construction:
    // queryParts[0] is always 'path=...'
    // queryParts[1] is always the duplicate 'symbol=...'
    const pathParam = queryParts[0]; 
    if (!pathParam || !pathParam.startsWith('path=')) {
      return res.status(400).json({ error: "Invalid proxy URL format. Missing path parameter." });
    }

    // Extract the exact endpoint path destination (e.g., /fapi/v1/order)
    const targetPath = decodeURIComponent(pathParam.split('=')[1] || '');

    // Reconstruct the EXACT raw query string signed by Google Apps Script.
    // Slicing from index 2 drops 'path' and the duplicate 'symbol', leaving the clean signature intact.
    const cleanBinanceQuery = queryParts.slice(2).join('&');

    // Extract your authorization key directly from the incoming header
    const apiKey = (req.headers['x-mbx-apikey'] || req.headers['X-MBX-APIKEY']) as string;
    if (!apiKey) {
      return res.status(400).json({ error: "API key missing from request headers." });
    }

    // Build the clean production-grade destination URL for Binance Demo
    const binanceUrl = `https://demo-fapi.binance.com${targetPath}?${cleanBinanceQuery}`;

    // Forward the pristine package directly to Binance
    const response = await fetch(binanceUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-MBX-APIKEY': apiKey
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { rawResponse: responseText };
    }

    res.status(response.status).json(responseData);

  } catch (error: any) {
    res.status(500).json({ 
      error: "Vercel Proxy failed to connect to Binance", 
      details: error.message 
    });
  }
}
