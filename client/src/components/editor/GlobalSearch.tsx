
import React, { useState, useRef } from 'react';

interface SearchResult {
  file: string;
  line: number;
  preview: string;
}

const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);

    // Close previous connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Use ws:// for dev, wss:// for prod if needed
    const ws = new window.WebSocket(`ws://${window.location.host}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'search', query }));
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'results' && Array.isArray(data.results)) {
          setResults(data.results);
          setLoading(false);
        }
      } catch {
        // ignore
      }
    };
    ws.onerror = () => {
      setLoading(false);
    };
    ws.onclose = () => {
      setLoading(false);
    };
  };

  return (
    <div className="p-4 w-full max-w-xl mx-auto">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-2 py-1"
          type="text"
          placeholder="Search files..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      <div>
        {results.length === 0 && !loading && <div className="text-gray-500">No results</div>}
        {results.map((r, i) => (
          <div key={i} className="border-b py-2">
            <div className="font-mono text-sm text-blue-700">{r.file}:{r.line}</div>
            <div className="text-gray-800">{r.preview}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalSearch;
