import { useState, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header";
import Row from "./components/Row";
import MovieCard from "./components/MovieCard";
import DetailDrawer from "./components/DetailDrawer";
import "./App.css";

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const CATEGORIES = [
  { label: "Trending Now", query: "2024" },
  { label: "Action", query: "action" },
  { label: "Marvel", query: "marvel" },
  { label: "Animation", query: "animation" },
  { label: "Horror", query: "horror" },
  { label: "Sci-Fi", query: "star wars" },
  { label: "Romance", query: "romance" },
];

export default function App() {
  const [view, setView] = useState("home");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [rows, setRows] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [rowsLoading, setRowsLoading] = useState(true);
  const [searchError, setSearchError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem("reel:watchlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const debounceRef = useRef(null);

  // Persist watchlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("reel:watchlist", JSON.stringify(watchlist));
    } catch {
      // localStorage can fail in private browsing / storage-full cases;
      // the watchlist still works in-memory for the session either way.
    }
  }, [watchlist]);

  const watchlistIds = new Set(watchlist.map((m) => m.imdbID));

  const toggleWatchlist = useCallback((movie) => {
    setWatchlist((prev) => {
      const exists = prev.some((m) => m.imdbID === movie.imdbID);
      if (exists) return prev.filter((m) => m.imdbID !== movie.imdbID);
      return [...prev, movie];
    });
  }, []);

  // Load category rows on mount
  useEffect(() => {
    if (!API_KEY) return;
    let cancelled = false;
    setRowsLoading(true);

    Promise.all(
      CATEGORIES.map((cat) =>
        fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(cat.query)}&type=movie&apikey=${API_KEY}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.Response === "False") {
              return { label: cat.label, movies: [], error: data.Error || "Couldn't load this row." };
            }
            return { label: cat.label, movies: data.Search || [], error: null };
          })
          .catch(() => ({ label: cat.label, movies: [], error: "Network error — check your connection." }))
      )
    ).then((results) => {
      if (cancelled) return;
      const nextRows = {};
      const nextErrors = {};
      results.forEach((r) => {
        nextRows[r.label] = r.movies;
        nextErrors[r.label] = r.error;
      });
      setRows(nextRows);
      setRowErrors(nextErrors);
      setRowsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced search
  useEffect(() => {
    if (!API_KEY) return;
    if (!searchInput.trim()) {
      setSearchTerm("");
      setSearchResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const term = searchInput.trim();
      setSearchTerm(term);
      setSearchLoading(true);
      setSearchError(null);
      fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(term)}&type=movie&apikey=${API_KEY}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.Response === "False") {
            // "Movie not found!" just means zero results — not a real error.
            if (data.Error !== "Movie not found!") setSearchError(data.Error);
            setSearchResults([]);
          } else {
            setSearchResults(data.Search || []);
          }
          setSearchLoading(false);
        })
        .catch(() => {
          setSearchError("Network error — check your connection.");
          setSearchLoading(false);
        });
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  if (!API_KEY) {
    return (
      <div className="key-error">
        <h1>Missing API key</h1>
        <p>
          Add <code>VITE_OMDB_API_KEY=your_key_here</code> to your <code>.env</code> file
          and restart the dev server.
        </p>
      </div>
    );
  }

  const isSearching = searchTerm.length > 0;

  return (
    <div className="app">
      <Header
        view={view}
        setView={setView}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        watchlistCount={watchlist.length}
      />

      <main className="main">
        {view === "home" && isSearching && (
          <Row
            title={`Results for "${searchTerm}"`}
            movies={searchResults}
            loading={searchLoading}
            error={searchError}
            onOpen={setOpenId}
            watchlistIds={watchlistIds}
            onToggleWatchlist={toggleWatchlist}
          />
        )}

        {view === "home" && isSearching && !searchLoading && !searchError && searchResults.length === 0 && (
          <p className="empty-msg">No titles found for "{searchTerm}". Try another search.</p>
        )}

        {view === "home" &&
          !isSearching &&
          CATEGORIES.map((cat) => (
            <Row
              key={cat.label}
              title={cat.label}
              movies={rows[cat.label] || []}
              loading={rowsLoading}
              error={rowErrors[cat.label]}
              onOpen={setOpenId}
              watchlistIds={watchlistIds}
              onToggleWatchlist={toggleWatchlist}
            />
          ))}

        {view === "watchlist" && (
          <>
            <h2 className="section-title">Your Watchlist</h2>
            {watchlist.length === 0 ? (
              <p className="empty-msg">Nothing saved yet. Tap the + on any title to add it here.</p>
            ) : (
              <div className="grid">
                {watchlist.map((m) => (
                  <MovieCard
                    key={m.imdbID}
                    movie={m}
                    onOpen={setOpenId}
                    inWatchlist={true}
                    onToggleWatchlist={toggleWatchlist}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {openId && (
        <DetailDrawer
          imdbID={openId}
          onClose={() => setOpenId(null)}
          inWatchlist={watchlistIds.has(openId)}
          onToggleWatchlist={toggleWatchlist}
        />
      )}
    </div>
  );
}