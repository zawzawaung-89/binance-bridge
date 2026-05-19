export default async function handler(req, res) {
  // 1. Get symbol from query (e.g. ?symbol=ADAUSDT)
  const { symbol } = req.query;
  
  // 2. Capture the API Key from the headers sent by Google
  const apiKey = req.headers['x-mbx-apikey'] || '';

  // 3. Build the Binance Futures URL
  const target = `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol || 'ADAUSDT'}`;

  try {
    const response = await fetch(target, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': apiKey, // Important: This authenticates the request
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    // Return the data and the exact status code from Binance
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: "Bridge Error", details: e.message });
  }
}
