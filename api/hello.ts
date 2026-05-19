export default async function handler(req, res) {
  // 1. Grabs the symbol and key from your Google Script
  const { symbol } = req.query;
  const apiKey = req.headers['x-mbx-apikey'];

  // 2. Directs the request to the Binance Futures Ticker
  const target = `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol || 'ADAUSDT'}`;

  try {
    const response = await fetch(target, {
      method: 'GET',
      headers: { 
        'X-MBX-APIKEY': apiKey || '', // Passes your key to Binance
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "Bridge Connection Error" });
  }
}
