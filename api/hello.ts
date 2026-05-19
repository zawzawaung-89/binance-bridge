export default async function handler(req, res) {
  // 1. Extract info from the Google Apps Script request
  const { endpoint, ...params } = req.query;
  const apiKey = req.headers['x-mbx-apikey'];

  // 2. Build the correct Binance URL (Default to ticker if no endpoint provided)
  const path = endpoint || '/fapi/v1/ticker/24hr';
  const queryString = new URLSearchParams(params as any).toString();
  const targetUrl = `https://fapi.binance.com${path}?${queryString}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'X-MBX-APIKEY': apiKey as string || '',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: "Bridge Error", details: e.message });
  }
}
