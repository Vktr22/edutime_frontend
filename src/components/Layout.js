import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navigation from "./Navigation";
import "./Layout.css";
import { useAuth } from "../contexts/AuthContext";

export default function Layout() {
    const location = useLocation();

    const isHome = location.pathname === "/home";
    const [isNavOpen, setIsNavOpen] = useState(false);

    useEffect(() => {
        setIsNavOpen(false);
    }, [location.pathname]);

    const { user } = useAuth();
    const displayName = user?.name || "felhasználó";

    if (isHome) {
        return (
            <div className="home-shell">
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

                <main className="home-main">
                    <div className="home-main-inner">
                        <Outlet />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app-shell">
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
