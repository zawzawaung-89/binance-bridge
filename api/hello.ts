export default async function handler(req, res) {
  // 1. Extract the target path from the query (e.g., /fapi/v1/ticker/24hr)
  const { path, ...params } = req.query;
  
  // 2. Build the Binance URL
  const queryString = new URLSearchParams(params as any).toString();
  const targetUrl = `https://fapi.binance.com${path || '/fapi/v1/ticker/24hr'}?${queryString}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'X-MBX-APIKEY': req.headers['x-mbx-apikey'] as string || '',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    // If it fails, send a JSON error, NOT an HTML page
    res.status(500).json({ error: "Bridge Crash", message: e.message });
  }
}
