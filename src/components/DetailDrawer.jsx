import { useState, useEffect } from "react";
import { Star, Plus, Check, X, Loader2 } from "lucide-react";
import Poster from "./Poster";

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

export default function DetailDrawer({ imdbID, onClose, inWatchlist, onToggleWatchlist }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`https://www.omdbapi.com/?i=${encodeURIComponent(imdbID)}&plot=full&apikey=${API_KEY}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.Response === "False") {
          setError(data.Error || "Could not load this title.");
        } else {
          setDetail(data);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Network error while loading details.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [imdbID]);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <button className="drawer__close" onClick={onClose}>
          <X size={16} />
        </button>

        {loading && (
          <div className="drawer__loading">
            <Loader2 className="spin" size={26} />
          </div>
        )}

        {error && (
          <div className="drawer__error">
            <p>{error}</p>
          </div>
        )}

        {detail && !loading && !error && (
          <>
            <Poster url={detail.Poster} title={detail.Title} />
            <div className="drawer__body">
              <h2 className="drawer__title">{detail.Title}</h2>
              <div className="drawer__subline">
                <span>{detail.Year}</span>
                <span>·</span>
                <span>{detail.Runtime}</span>
                <span>·</span>
                <span>{detail.Rated}</span>
                {detail.imdbRating && detail.imdbRating !== "N/A" && (
                  <>
                    <span>·</span>
                    <span className="drawer__rating">
                      <Star size={13} fill="#E3A857" /> {detail.imdbRating}
                    </span>
                  </>
                )}
              </div>

              <button
                className={`watchlist-toggle ${inWatchlist ? "watchlist-toggle--active" : ""}`}
                onClick={() => onToggleWatchlist(detail)}
              >
                {inWatchlist ? <Check size={15} /> : <Plus size={15} />}
                {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </button>

              <p className="drawer__plot">{detail.Plot}</p>

              <div className="drawer__facts">
                <span>Genre</span>
                <span>{detail.Genre}</span>
                <span>Director</span>
                <span>{detail.Director}</span>
                <span>Cast</span>
                <span>{detail.Actors}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}