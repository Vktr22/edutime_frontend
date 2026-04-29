import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navigation from "./Navigation";
import "./Layout.css";
import { useAuth } from "../contexts/AuthContext";

export default function Layout() {
  // Az aktuális útvonal alapján döntjük el, melyik layout variáns jelenjen meg.
  const location = useLocation();

  // A Home oldal külön hero + top nav elrendezést kap.
  const isHome = location.pathname === "/home";
  const [isNavOpen, setIsNavOpen] = useState(false);

  // route váltáskor csukjuk be (kényelmes mobilon)
  useEffect(() => {
    setIsNavOpen(false);
  }, [location.pathname]);

  // A felhasználói adatokat a fejléc szövegéhez használjuk.
  const { user } = useAuth();
  const displayName = user?.name || "felhasználó";

  // Home layout: hero szekció + felső navigáció + tartalom.
  if (isHome) {
    return (
      <div className="home-shell">
        {/* Felső hero blokk üdvözlő szöveggel és top navigációval. */}
        <header className="home-hero">
          <div className="home-hero-inner">
            <div className="home-hero-top">
              <div className="home-hero-titleBlock">
                <h1 className="home-hero-title">
                  Üdvözöllek, {displayName}!
                </h1>
                <div className="home-hero-sub">
                  Jogosultság: {user?.role || "-"}
                </div>
              </div>

              <div className="home-hero-nav">
                <Navigation variant="top" />
              </div>
            </div>
          </div>
        </header>

        {/* Home oldal fő tartalma (nested route). */}
        <main className="home-main">
          <div className="home-main-inner">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  // Minden más oldalon: bal oldali navigáció + jobb oldali tartalom.
  return (
    <div className="app-shell">
      {/* Mobile top bar (hamburger) */}
      <div className="app-mobilebar">
        <button
          type="button"
          className="app-hamburger"
          onClick={() => setIsNavOpen((v) => !v)}
          aria-label="Menü"
        >
          ☰
        </button>
        <div className="app-mobilebrand">EduTime</div>
      </div>

      {/* overlay */}
      <div
        className={"app-overlay" + (isNavOpen ? " is-open" : "")}
        onClick={() => setIsNavOpen(false)}
      />

      <aside className={"app-sidebar" + (isNavOpen ? " is-open" : "")}>
        <Navigation variant="side" />
      </aside>

      <main className="app-content">
        <div className="app-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
