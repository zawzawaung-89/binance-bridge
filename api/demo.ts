import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const rawUrl = req.url || '';
        const queryIndex = rawUrl.indexOf('?');
        
        if (queryIndex === -1) {
            return res.status(400).json({ error: "No query parameters found from Google Sheets." });
        }

        // 1. Capture the exact raw query string straight from the incoming URL
        const rawQueryString = rawUrl.substring(queryIndex + 1);

        // 2. Safely locate and extract the target path without changing any encoding
        const urlParams = new URLSearchParams(rawQueryString);
        const targetPath = urlParams.get('path');
        
        if (!targetPath) {
            return res.status(400).json({ error: "Missing 'path' parameter from Google Apps Script request." });
        }

        // 3. SURGICAL CLEANUP: Remove ONLY the 'path=...' segment from the raw query string.
        // This ensures every other parameter (symbol, timestamp, signature) keeps its exact positioning, 
        // casing, and encoding identical to what your Google Sheet signed.
        const queryParts = rawQueryString.split('&');
        const cleanParts = queryParts.filter(part => !part.startsWith('path='));
        const cleanBinanceQuery = cleanParts.join('&');

        // 4. Combine with the Binance Demo endpoint
        const binanceUrl = `https://demo-fapi.binance.com${targetPath}?${cleanBinanceQuery}`;

        // 5. Forward the incoming authentication headers
        const apiKey = (req.headers['x-mbx-apikey'] || req.headers['X-MBX-APIKEY']) as string;

        // 6. Execute the request exactly as received (handles POST/GET/DELETE automatically)
        const response = await fetch(binanceUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { 'X-MBX-APIKEY': apiKey } : {})
            },
            body: req.method !== 'GET' && req.method !== 'HEAD' && req.body 
                ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) 
                : undefined
        });

        // 7. Deliver the clean response back to your Google Sheet
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
