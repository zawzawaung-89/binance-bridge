import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const { path, symbol, ...otherParams } = req.query;
        
        // 1. Determine target URL: If 'path' is provided, use it; otherwise, default to ticker
        let targetUrl = 'https://fapi.binance.com';
        
        if (path) {
            targetUrl += path;
        } else if (symbol) {
            targetUrl += `/fapi/v1/ticker/24hr?symbol=${symbol}`;
        } else {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        // 2. Attach any additional query parameters (like limit)
        const queryString = new URLSearchParams(otherParams as any).toString();
        if (queryString) {
            targetUrl += (targetUrl.includes('?') ? '&' : '?') + queryString;
        }

        const response = await fetch(targetUrl);
        const data = await response.json();

        return res.status(200).json(data);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
