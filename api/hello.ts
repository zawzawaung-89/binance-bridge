export default async function handler(req, res) {
  // 1. Get the symbol from the URL query
  const { symbol } = req.query;
  
  // 2. IMPORTANT: Catch the API Key from Google's headers
  const apiKey = req.headers['x-mbx-apikey'] || '';

  // 3. Set the Binance Futures URL
  const target = `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol || 'ADAUSDT'}`;

  try {
    const response = await fetch(target, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': apiKey, // Pass the key to Binance
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    // If Binance sends an error (like 401), we send it back to Google Sheets
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: "Bridge Connection Error", details: e.message });
  }
}
