import MovieCard from "./MovieCard";

export default function Row({ title, movies, loading, error, onOpen, watchlistIds, onToggleWatchlist }) {
  if (!loading && !error && movies.length === 0) return null;

  return (
    <section className="row">
      <h3 className="row__title">{title}</h3>
      {error && !loading && <p className="row__error">{error}</p>}
      <div className="row__track">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="row__skeleton" />)}
        {!loading &&
          !error &&
          movies.map((m) => (
            <MovieCard
              key={m.imdbID}
              movie={m}
              onOpen={onOpen}
              inWatchlist={watchlistIds.has(m.imdbID)}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
      </div>
    </section>
  );
}