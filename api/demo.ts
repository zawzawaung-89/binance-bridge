import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const { path, symbol, ...otherParams } = req.query;
        
        // 1. Point to the Binance DEMO network instead of production
        let targetUrl = 'https://demo-fapi.binance.com';
        
        if (path) {
            targetUrl += path;
        } else if (symbol) {
            targetUrl += `/fapi/v1/ticker/24hr?symbol=${symbol}`;
        } else {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        // 2. Attach additional query parameters (retaining your original logic)
        const queryString = new URLSearchParams(otherParams as any).toString();
        if (queryString) {
            targetUrl += (targetUrl.includes('?') ? '&' : '?') + queryString;
        }

        // 3. Extract the API key forwarded from your Google Sheet headers
        const apiKey = (req.headers['x-mbx-apikey'] || req.headers['X-MBX-APIKEY']) as string;

        // 4. Forward the complete request (Method, Headers, and Body) to Binance Demo
        const response = await fetch(targetUrl, {
            method: req.method, // Automatically handles GET, POST, DELETE, etc.
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { 'X-MBX-APIKEY': apiKey } : {}) // Safely injects the key if present
            },
            // Forward the body data for POST requests (like placing an order)
            body: req.method !== 'GET' && req.method !== 'HEAD' && req.body 
                ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) 
                : undefined
        });

        // 5. Return the response safely to Google Apps Script
        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            data = { rawResponse: responseText };
        }

        return res.status(response.status).json(data);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
