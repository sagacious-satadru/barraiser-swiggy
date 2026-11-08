import { useState, useEffect } from "react";
import "./App.css";
import { NAMES } from "./mocks/mockFetch";

function App() {
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [bucketNo, setBucketNo] = useState(0);
  const [activeBucket, setActiveBucket] = useState<string[]>([]);
  const debounceInterval = 300;

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      return;
    }
    // setIsTyping(true);
    const handler = setTimeout(async () => {
      const res = await fetch(`/api/names?q=${trimmedQuery}`);
      const data = await res.json();

      setResults(data.names);
    }, debounceInterval);
    // setIsTyping(false);
    return () => clearTimeout(handler);
  }, [query]);

  const createBuckets = (bucketSize: number, names: string[]) => {
    const buckets: string[][] = [];
    for (let i = 0; i < names.length; i += bucketSize) {
      buckets.push(names.slice(i, i + bucketSize));
    }
    return buckets;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsTyping(true);
    setBucketNo(0);
    if (query.length === 0) {
      setResults([]);
      setIsTyping(false);
    }
  };

  const bucketedNames = createBuckets(5, results);
  console.log("bucketedNames: ", bucketedNames);

  const handlePaginate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (bucketNo === 0 && e.currentTarget.innerText === "Previous page") return;
    if (
      bucketNo === bucketedNames.length - 1 &&
      e.currentTarget.innerText === "Next page"
    )
      return;
    setBucketNo(
      (prevBucketNo) =>
        prevBucketNo + (e.currentTarget.innerText === "Next page" ? 1 : -1),
    );
    console.log(
      `Updated bucketNo: ${bucketNo + (e.currentTarget.innerText === "Next page" ? 1 : -1)}`,
    );
    setActiveBucket(
      bucketedNames[
        bucketNo + (e.currentTarget.innerText === "Next page" ? 1 : -1)
      ],
    );
  };

  

  return (
    <>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleChange}
      />
      {results.length === 0 && NAMES.map((name, index) => <li key={index}>{name}</li>)}
      {/* {isTyping } */}
      {isTyping && (
        <div className="names-container">
        <ul className="names-list">
          {bucketedNames[bucketNo]?.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
      </div>
      )}
      
      <button
        style={{ width: "100px", margin: "0 10px" }}
        onClick={handlePaginate}
        type="button"
      >
        Previous page
      </button>
      <button
        style={{ width: "100px", margin: "0 10px" }}
        onClick={handlePaginate}
        type="button"
      >
        Next page
      </button>
    </>
  );
}

export default App;
