import { useState, useEffect } from "react";
import "./App.css";
import { NAMES } from "./mocks/mockFetch";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [bucketSizeInput, setBucketSizeInput] = useState("5");
  const [bucketNo, setBucketNo] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const debounceInterval = 300;

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  useEffect(() => {
    if (!trimmedQuery) return;

    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/names?q=${encodeURIComponent(trimmedQuery)}`);
        const data = await res.json();
        setResults(data.names || []);
      } catch (err) {
        console.error("Failed to fetch names:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceInterval);

    return () => clearTimeout(handler);
  }, [trimmedQuery]);

  const parsedBucketSize = parseInt(bucketSizeInput, 10);
  const effectiveBucketSize =
    Number.isNaN(parsedBucketSize) || parsedBucketSize < 1 ? 1 : parsedBucketSize;

  const createBuckets = (bucketSize: number, names: string[]) => {
    if (bucketSize <= 0) return [names];
    const buckets: string[][] = [];
    for (let i = 0; i < names.length; i += bucketSize) {
      buckets.push(names.slice(i, i + bucketSize));
    }
    return buckets;
  };

  const bucketedNames = createBuckets(effectiveBucketSize, results);
  const totalPages = bucketedNames.length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setBucketNo(0);
    if (!val.trim()) {
      setResults([]);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  };

  const handleBucketSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBucketSizeInput(e.target.value);
    setBucketNo(0);
  };

  const handlePrevPage = () => {
    setBucketNo((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setBucketNo((prev) => Math.min(prev + 1, Math.max(totalPages - 1, 0)));
  };

  return (
    <div className="app-container">
      <h1>Name Search & Pagination</h1>
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search names..."
          value={query}
          onChange={handleSearchChange}
        />
      </div>

      {!isSearching && (
        <div className="names-container">
          <h2>All Names ({NAMES.length})</h2>
          <ul className="names-list">
            {NAMES.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </div>
      )}

      {isSearching && (
        <>
          <div className="bucket-size-container">
            {/* I have added support for changing the bucket size so we can adjust the number of names displayed per page using the input below. */}
            <label htmlFor="bucket-size">Bucket size: </label>
            <input
              id="bucket-size"
              type="number"
              min="1"
              value={bucketSizeInput}
              onChange={handleBucketSizeChange}
              className="bucket-size-input"
            />
          </div>

          {isLoading ? (
            <p className="status-text">Searching...</p>
          ) : results.length === 0 ? (
            <p className="status-text">No results found for "{trimmedQuery}".</p>
          ) : (
            <>
              <div className="names-container">
                <h2>Search Results ({results.length})</h2>
                <ul className="names-list">
                  {bucketedNames[bucketNo]?.map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </div>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="page-button"
                  onClick={handlePrevPage}
                  disabled={bucketNo <= 0}
                >
                  Previous page
                </button>
                <span className="page-indicator">
                  Page {bucketNo + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  className="page-button"
                  onClick={handleNextPage}
                  disabled={bucketNo >= totalPages - 1}
                >
                  Next page
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
