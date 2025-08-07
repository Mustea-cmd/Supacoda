import React, { useState } from 'react';

interface SearchResult {
  file: string;
  line: number;
  preview: string;
}

const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Replace with backend API call or workspace search logic
    // Example: fetch(`/api/search?q=${encodeURIComponent(query)}`)
    setTimeout(() => {
      setResults([
        { file: 'src/App.tsx', line: 10, preview: 'const App = () => {' },
        { file: 'src/components/Editor.tsx', line: 42, preview: 'function handleSave() {' },
      ]);
      setLoading(false);
    }, 1000);
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
