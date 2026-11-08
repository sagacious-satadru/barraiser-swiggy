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

  // Search & Fetch Effect with Debounce + AbortController:
  // - Debounces keystrokes by 300ms so we do not flood the API on every character.
  // - I am using AbortController to cancel any in-flight request when the user continues typing
  //   or clears the input. This prevents race conditions where an older, slower request
  //   could resolve out-of-order and overwrite newer search results.
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
        // If the request was aborted due to a newer query or unmount, ignore the error
        // so we don't log false alarms or clear valid results from a superseding request.
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch names:", err);
        setResults([]);
      } finally {
        // Only mark loading false if this request wasn't superseded by an abort.
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, debounceInterval);

    // Cleanup: cancel both the pending timer and any active HTTP request.
    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [trimmedQuery]);

  // Bucket Size Sanitization:
  // - Parses the user-entered string to an integer.
  // - Defensively falls back to 1 if input is empty, NaN, or non-positive (< 1).
  //   This prevents division by zero, NaN totalPages, or infinite step loops.
  const parsedBucketSize = parseInt(bucketSizeInput, 10);
  const effectiveBucketSize =
    Number.isNaN(parsedBucketSize) || parsedBucketSize < 1 ? 1 : parsedBucketSize;

  // Direct Pagination Slicing (O(1) calculation & O(bucketSize) render slice):
  // - Calculates totalPages dynamically based on current results and bucket size.
  // - safeBucketNo clamps the active page to [0, totalPages - 1] so that if results shrink
  //   or bucket size increases while on page 3, we don't get an out-of-bounds blank page.
  // - Slices only the visible window from `results` instead of allocating a 2D array on every render.
  const totalPages = Math.max(1, Math.ceil(results.length / effectiveBucketSize));
  const safeBucketNo = Math.min(bucketNo, Math.max(totalPages - 1, 0));
  const startIndex = safeBucketNo * effectiveBucketSize;
  const currentItems = results.slice(startIndex, startIndex + effectiveBucketSize);

  // Input Handlers:
  // - Reset bucketNo to 0 whenever search query or bucket size changes to start from Page 1.
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
        {/* aria-label ensures accessible naming for assistive devices */}
        <input
          type="text"
          className="search-input"
          placeholder="Search names..."
          aria-label="Search names"
          value={query}
          onChange={handleSearchChange}
        />
      </div>

      {/* Initial Unpaginated State: displays the full dataset when no query is typed */}
      {!isSearching && (
        <div className="names-container">
          <h2>All Names ({NAMES.length})</h2>
          <ul className="names-list">
            {/* Composite key (name + index) ensures unique identities even if the dataset has duplicate names */}
            {NAMES.map((name, index) => (
              <li key={`${name}-${index}`}>{name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Search & Pagination State: displayed whenever a search query is active */}
      {isSearching && (
        <>
          <div className="bucket-size-container">
            {/* Custom bucket size allows user to control how many items are displayed per page */}
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

          {/* aria-live="polite" notifies screen readers when search status changes */}
          {isLoading ? (
            <p className="status-text" aria-live="polite">Searching...</p>
          ) : results.length === 0 ? (
            <p className="status-text" aria-live="polite">No results found for "{trimmedQuery}".</p>
          ) : (
            <>
              <div className="names-container">
                <h2>Search Results ({results.length})</h2>
                <ul className="names-list">
                  {/* Global composite key (name + global dataset index) ensures uniqueness across pages while handling potential duplicate names */}
                  {currentItems.map((name, index) => (
                    <li key={`${name}-${startIndex + index}`}>{name}</li>
                  ))}
                </ul>
              </div>

              {/* Pagination Controls with boundary disabling and page status */}
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
