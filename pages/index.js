import { useState } from 'react';
import { Loader2, Search, Youtube, MessageSquare, Globe } from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    cerebras: null,
    youtube: null,
    google: null
  });
  const [errors, setErrors] = useState({
    cerebras: null,
    youtube: null,
    google: null
  });

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setResults({ cerebras: null, youtube: null, google: null });
    setErrors({ cerebras: null, youtube: null, google: null });

    try {
      const [cerebrasRes, youtubeRes, googleRes] = await Promise.allSettled([
        fetchCerebras(query),
        fetchYouTube(query),
        fetchGoogle(query)
      ]);

      setResults({
        cerebras: cerebrasRes.status === 'fulfilled' ? cerebrasRes.value : null,
        youtube: youtubeRes.status === 'fulfilled' ? youtubeRes.value : null,
        google: googleRes.status === 'fulfilled' ? googleRes.value : null
      });

      setErrors({
        cerebras: cerebrasRes.status === 'rejected' ? cerebrasRes.reason : null,
        youtube: youtubeRes.status === 'rejected' ? youtubeRes.reason : null,
        google: googleRes.status === 'rejected' ? googleRes.reason : null
      });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCerebras = async (q) => {
    const response = await fetch('/api/cerebras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q })
    });
    if (!response.ok) throw new Error('Cerebras API failed');
    return await response.json();
  };

  const fetchYouTube = async (q) => {
    const response = await fetch('/api/youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q })
    });
    if (!response.ok) throw new Error('YouTube API failed');
    return await response.json();
  };

  const fetchGoogle = async (q) => {
    const response = await fetch('/api/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q })
    });
    if (!response.ok) throw new Error('Google API failed');
    return await response.json();
  };

  const renderCerebras = () => {
    if (errors.cerebras) {
      return <div className="text-red-400 text-sm">Error loading Cerebras response</div>;
    }
    if (!results.cerebras) return null;
    
    const text = results.cerebras.response;
    const lines = text.split('\n');
    
    return (
      <div className="space-y-3">
        {lines.map((line, i) => {
          if (line.startsWith('# ')) {
            return <h2 key={i} className="text-xl font-bold text-white mt-4">{line.slice(2)}</h2>;
          } else if (line.startsWith('## ')) {
            return <h3 key={i} className="text-lg font-semibold text-purple-300 mt-3">{line.slice(3)}</h3>;
          } else if (line.startsWith('### ')) {
            return <h4 key={i} className="text-base font-semibold text-purple-200 mt-2">{line.slice(4)}</h4>;
          } else if (line.startsWith('- ') || line.startsWith('* ')) {
            return <div key={i} className="ml-4 text-gray-300">{line}</div>;
          } else if (line.trim()) {
            return <p key={i} className="text-gray-300 leading-relaxed">{line}</p>;
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-4">Qrium AI</h1>
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter your search query..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 flex items-center gap-2">
              <MessageSquare size={20} className="text-white" />
              <h2 className="text-lg font-semibold text-white">LLM</h2>
            </div>
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {loading && !results.cerebras ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-purple-500" size={32} />
                </div>
              ) : results.cerebras ? (
                renderCerebras()
              ) : (
                <div className="text-gray-500 text-center py-12">Enter a query to see AI response</div>
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 flex items-center gap-2">
              <Youtube size={20} className="text-white" />
              <h2 className="text-lg font-semibold text-white">YouTube</h2>
            </div>
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto space-y-4">
              {loading && !results.youtube ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-red-500" size={32} />
                </div>
              ) : (results.youtube && results.youtube.items && results.youtube.items.length > 0) ? (
                results.youtube.items.map((video) => {
                  const videoUrl = 'https://youtube.com/watch?v=' + video.videoId;
                  return (
                    <a key={video.id} href={videoUrl} target="_blank" rel="noopener noreferrer" className="block bg-gray-900/50 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition-all">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-cover" />
                      <div className="p-3">
                        <h3 className="text-white font-medium mb-1">{video.title}</h3>
                        <p className="text-gray-400 text-sm">{video.channel}</p>
                      </div>
                    </a>
                  );
                })
              ) : results.youtube ? (
                <div className="text-gray-500 text-center py-12">No videos found</div>
              ) : (
                <div className="text-gray-500 text-center py-12">Enter a query to see videos</div>
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center gap-2">
              <Globe size={20} className="text-white" />
              <h2 className="text-lg font-semibold text-white">Google Search</h2>
            </div>
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto space-y-4">
              {loading && !results.google ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
              ) : (results.google && results.google.items && results.google.items.length > 0) ? (
                results.google.items.map((item, i) => {
                  return (
                    <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="block bg-gray-900/50 rounded-lg p-4 hover:ring-2 hover:ring-blue-500 transition-all">
                      <h3 className="text-blue-400 font-medium mb-2 hover:underline">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.snippet}</p>
                      <p className="text-green-500 text-xs mt-2 truncate">{item.link}</p>
                    </a>
                  );
                })
              ) : results.google ? (
                <div className="text-gray-500 text-center py-12">No results found</div>
              ) : (
                <div className="text-gray-500 text-center py-12">Enter a query to see results</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}