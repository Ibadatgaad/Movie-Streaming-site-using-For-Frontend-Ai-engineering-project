import { Plus, Check } from "lucide-react";
import Poster from "./Poster";

export default function MovieCard({ movie, onOpen, inWatchlist, onToggleWatchlist }) {
  return (
    <div className="movie-card" onClick={() => onOpen(movie.imdbID)}>
      <Poster url={movie.Poster} title={movie.Title} />
      <button
        className={`watchlist-btn ${inWatchlist ? "watchlist-btn--active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleWatchlist(movie);
        }}
        title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        {inWatchlist ? <Check size={14} /> : <Plus size={14} />}
      </button>
      <div className="movie-card__meta">
        <div className="movie-card__title" title={movie.Title}>
          {movie.Title}
        </div>
        <div className="movie-card__year">{movie.Year}</div>
      </div>
    </div>
  );
}