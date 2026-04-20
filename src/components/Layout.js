import { Outlet, useLocation } from "react-router-dom";
import Navigation from "./Navigation";
import "./Layout.css";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/home";

  // Home: hero + topnav
  if (isHome) {
    return (
      <div className="home-shell">
        <header className="home-hero">
          <div className="home-hero-inner">
            {/* A HomePage oldalon lesz a "Üdvözöllek, ..." szöveg,
                itt most csak a háttér + topnav keret kell */}
            <Navigation variant="top" />
          </div>
        </header>

        <main className="home-main">
          <div className="home-main-inner">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  // Everything else: sidebar + content
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
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