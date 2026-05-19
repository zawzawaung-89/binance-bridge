export default async function handler(req, res) {
  // 1. Get parameters from your Google Script request
  const { symbol, signature, timestamp, recvWindow } = req.query;
  const apiKey = req.headers['x-mbx-apikey'];

  // 2. Build the Binance Futures URL with all security parameters
  let url = `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol || 'ADAUSDT'}`;
  
  // If your script is sending a signature (for trading), add it to the URL
  if (signature) {
    url = `https://fapi.binance.com/fapi/v1/account?timestamp=${timestamp}&signature=${signature}&recvWindow=${recvWindow || 5000}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-MBX-APIKEY': apiKey || '' }
    });
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "Bridge Auth Error", details: e.message });
  }
}
