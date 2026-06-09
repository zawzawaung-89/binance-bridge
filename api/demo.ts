import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        // 1. Get the raw URL directly to prevent any Vercel auto-formatting
        const rawUrl = req.url || '';
        const queryIndex = rawUrl.indexOf('?');
        
        let targetUrl = 'https://demo-fapi.binance.com';
        let finalQueryString = '';

        if (queryIndex !== -1) {
            // Extract the exact query string as a raw text block
            const rawQuery = rawUrl.substring(queryIndex + 1);
            
            // Extract the 'path' parameter to know the destination
            const urlParams = new URLSearchParams(rawQuery);
            const targetPath = urlParams.get('path');
            const symbol = urlParams.get('symbol'); // Fallback for public ticker requests
            
            if (targetPath) {
                targetUrl += targetPath;
            } else if (symbol) {
                targetUrl += `/fapi/v1/ticker/24hr?symbol=${symbol}`;
                const response = await fetch(targetUrl);
                return res.status(200).json(await response.json());
            } else {
                return res.status(400).json({ error: "Missing 'path' parameter" });
            }

            // 2. THE CRITICAL FIX: Surgically remove ONLY the 'path' parameter
            // We split the raw string and filter it to keep the exact original signature encoding intact
            const queryParts = rawQuery.split('&');
            const filteredParts = queryParts.filter(part => !part.startsWith('path='));
            finalQueryString = filteredParts.join('&');
        } else {
            return res.status(400).json({ error: "No query parameters found" });
        }

        // Attach the untouched signed query string to the Binance Demo URL
        if (finalQueryString) {
            targetUrl += '?' + finalQueryString;
        }

        // 3. Grab the API key safely from headers
        const apiKey = (req.headers['x-mbx-apikey'] || req.headers['X-MBX-APIKEY']) as string;

        // 4. Handle request body safely if it's a POST request
        let requestBody = undefined;
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            requestBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        // 5. Fire the exact payload to Binance Demo
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { 'X-MBX-APIKEY': apiKey } : {})
            },
            body: requestBody
        });

        // 6. Return response safely
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
