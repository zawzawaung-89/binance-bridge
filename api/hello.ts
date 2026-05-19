export default async function handler(req, res) {
  const { symbol } = req.query;
  // This directs the request to the Binance Futures API
  const target = `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${symbol || 'ADAUSDT'}`;

  try {
    const response = await fetch(target);
    const data = await response.json();
    
    // Sends the data back to your Google Sheet
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "Bridge Error" });
  }
}
