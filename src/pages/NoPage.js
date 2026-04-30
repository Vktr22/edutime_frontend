import React from "react";
import { Link } from "react-router-dom";
import "../css/NoPage.css";

export default function NoPage() {
    return (
        <div className="nopage-shell">
            <div className="card nopage-card">
                <h1 className="nopage-code">404</h1>
                <div className="nopage-title">Oldal nem található</div>
                <div className="nopage-desc">
                    A keresett oldal nem létezik, vagy el lett távolítva.
                    Ellenőrizd a címet, vagy térj vissza a kezdőlapra.
                </div>

                <div className="nopage-actions">
                    <Link className="nopage-btn" to="/login">
                        Vissza a kezdőlapra
                    </Link>
                </div>
            </div>
        </div>
    );
}
