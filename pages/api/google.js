export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { query } = req.body;
  
    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }
  
    try {
      const apiKey = process.env.GOOGLE_API_KEY;
      const cx = process.env.GOOGLE_CX;
  
      if (!apiKey || !cx) {
        console.error('Missing Google API credentials');
        return res.status(500).json({ error: 'Google API not configured' });
      }
  
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=5`;
  
      console.log('Google Search URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
  
      const response = await fetch(url);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google API error:', response.status, errorText);
        return res.status(response.status).json({ error: `Google API error: ${response.status}` });
      }
  
      const data = await response.json();
  
      if (!data.items || data.items.length === 0) {
        return res.status(200).json({ items: [] });
      }
  
      const items = data.items.map(item => ({
        title: item.title,
        snippet: item.snippet || 'No description available',
        link: item.link
      }));
  
      res.status(200).json({ items });
    } catch (error) {
      console.error('Google API error:', error);
      res.status(500).json({ error: 'Failed to fetch Google results: ' + error.message });
    }
  }