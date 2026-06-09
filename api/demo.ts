import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const rawUrl = req.url || '';
        const queryIndex = rawUrl.indexOf('?');
        
        if (queryIndex === -1) {
            return res.status(400).json({ error: "No query parameters found from Google Sheets." });
        }

        // 1. Get the untouched, raw query string directly from the URL
        const rawQueryString = rawUrl.substring(queryIndex + 1);
        const queryParts = rawQueryString.split('&');

        // 2. Parse out the destination path (always the first parameter: queryParts[0])
        const pathPart = queryParts[0];
        if (!pathPart || !pathPart.startsWith('path=')) {
            return res.status(400).json({ error: "Missing or invalid 'path' parameter." });
        }
        const targetPath = decodeURIComponent(pathPart.split('=')[1] || '');

        // 3. THE CRITICAL FIX: Slice away the proxy decorations
        // queryParts[0] is 'path=...'
        // queryParts[1] is the duplicate 'symbol=...' 
        // Slicing from index 2 leaves ONLY the pristine, original signed query + signature string
        const cleanBinanceQuery = queryParts.slice(2).join('&');

        // 4. Construct the exact production-grade URL for Binance Demo
        const binanceUrl = `https://demo-fapi.binance.com${targetPath}?${cleanBinanceQuery}`;

        // 5. Extract the API key directly from the incoming header
        const apiKey = (req.headers['x-mbx-apikey'] || req.headers['X-MBX-APIKEY']) as string;

        // 6. Forward the untouched payload straight to Binance Demo
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
