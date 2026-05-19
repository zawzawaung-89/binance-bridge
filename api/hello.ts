// Replace your existing code in api/hello.ts with this:
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const { path, ...queryParams } = req.query;
        if (!path) return res.status(400).json({ error: "Missing path" });

        // Build the URL dynamically
        const queryString = new URLSearchParams(queryParams as any).toString();
        const targetUrl = `https://fapi.binance.com${path}?${queryString}`;

        const response = await fetch(targetUrl);
        const data = await response.json();

        return res.status(200).json(data);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
