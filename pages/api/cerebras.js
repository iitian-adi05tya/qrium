export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { query } = req.body;
  
    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }
  
    try {
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3.1-8b',
          messages: [
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cerebras API error:', response.status, errorText);
        throw new Error(`Cerebras API error: ${response.status}`);
      }
  
      const data = await response.json();
      const answer = data.choices[0].message.content;
  
      res.status(200).json({ response: answer });
    } catch (error) {
      console.error('Cerebras API error:', error);
      res.status(500).json({ error: 'Failed to fetch Cerebras response' });
    }
  }
