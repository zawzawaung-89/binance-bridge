export default async function handler(req, res) {
  // This allows the bridge to handle BOTH browser tests and Google Sheet requests
  const symbol = req.query.symbol || (req.body && req.body.symbol) || 'ADAUSDT';
  
  const target = `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol}`;

  try {
    const response = await fetch(target, {
      method: 'GET', // We always use GET to talk to Binance ticker
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "Bridge Error", details: e.message });
  }
}
