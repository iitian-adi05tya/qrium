export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { query } = req.body;
  
    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }
  
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${process.env.YOUTUBE_API_KEY}`;
  
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
  
      const data = await response.json();
  
      const items = data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        videoId: item.id.videoId
      }));
  
      res.status(200).json({ items });
    } catch (error) {
      console.error('YouTube API error:', error);
      res.status(500).json({ error: 'Failed to fetch YouTube results' });
    }
  }