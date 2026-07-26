import { Search, Film, Bookmark } from "lucide-react";

export default function Header({ view, setView, searchInput, setSearchInput, watchlistCount }) {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__logo" onClick={() => setView("home")}>
          <Film size={20} color="#E3A857" />
          <span>REEL</span>
        </div>

        <div className="header__search">
          <Search size={15} className="header__search-icon" />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setView("home");
            }}
            placeholder="Search titles..."
          />
        </div>

        <nav className="header__nav">
          <button
            className={view === "home" ? "nav-btn nav-btn--active" : "nav-btn"}
            onClick={() => setView("home")}
          >
            Browse
          </button>
          <button
            className={view === "watchlist" ? "nav-btn nav-btn--active" : "nav-btn"}
            onClick={() => setView("watchlist")}
          >
            <Bookmark size={13} /> Watchlist {watchlistCount > 0 && `(${watchlistCount})`}
          </button>
        </nav>
      </div>
    </header>
  );
}