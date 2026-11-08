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

    const controller = new AbortController();

    const handler = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/names?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setResults(data.names || []);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch names:", err);
        setResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, debounceInterval);

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [trimmedQuery]);

  const parsedBucketSize = parseInt(bucketSizeInput, 10);
  const effectiveBucketSize =
    Number.isNaN(parsedBucketSize) || parsedBucketSize < 1 ? 1 : parsedBucketSize;

  const totalPages = Math.max(1, Math.ceil(results.length / effectiveBucketSize));
  const safeBucketNo = Math.min(bucketNo, Math.max(totalPages - 1, 0));
  const startIndex = safeBucketNo * effectiveBucketSize;
  const currentItems = results.slice(startIndex, startIndex + effectiveBucketSize);

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
          aria-label="Search names"
          value={query}
          onChange={handleSearchChange}
        />
      </div>

      {!isSearching && (
        <div className="names-container">
          <h2>All Names ({NAMES.length})</h2>
          <ul className="names-list">
            {NAMES.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      )}

      {isSearching && (
        <>
          <div className="bucket-size-container">
            {/* Custom bucket size allows adjusting the number of names displayed per page */}
            <label htmlFor="bucket-size">Bucket size: </label>
            <input
              id="bucket-size"
              type="number"
              min="1"
              step="1"
              aria-label="Bucket size"
              value={bucketSizeInput}
              onChange={handleBucketSizeChange}
              className="bucket-size-input"
            />
          </div>

          {isLoading ? (
            <p className="status-text" aria-live="polite">Searching...</p>
          ) : results.length === 0 ? (
            <p className="status-text" aria-live="polite">No results found for "{trimmedQuery}".</p>
          ) : (
            <>
              <div className="names-container">
                <h2>Search Results ({results.length})</h2>
                <ul className="names-list">
                  {currentItems.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="page-button"
                  onClick={handlePrevPage}
                  disabled={safeBucketNo <= 0}
                  aria-label="Previous page"
                >
                  Previous page
                </button>
                <span className="page-indicator" aria-live="polite">
                  Page {safeBucketNo + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  className="page-button"
                  onClick={handleNextPage}
                  disabled={safeBucketNo >= totalPages - 1}
                  aria-label="Next page"
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
