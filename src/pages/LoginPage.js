// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/LoginPage.css";
import { User } from "lucide-react";

export default function LoginPage() {
  const { login, serverError } = useAuth();
  const [error, setError] = useState("");
  // lokális state a form mezőkhöz
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); //a komponens belsejeben minden renderkor lesz egy nav fgv amit barhol haszn(pl submit utan)

  const handleSubmit = async (e) => {
    e.preventDefault(); //SPA
    try {
      await login({ email, password });
      //tehat ha a login sikeres volt, mehetunk a /home-ra
      navigate("/home");
    } catch (err) {
      // Backendből érkező login hibaüzenet megjelenítése a felhasználónak
      setError(
        err.response?.data?.message || "Hiba történt a bejelentkezés során.",
      );
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-icon">
          <User size={28} />
        </div>

        <h1 className="login-title">Bejelentkezés</h1>
        <div className="login-subtitle">Jelentkezz be a EduTime fiókodba</div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email cím</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="pelda@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Jelszó</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-button" type="submit">
            Bejelentkezés
          </button>
        </form>

        <div className="login-footer">
          Elfelejtetted a jelszavad, vagy még nincs is fiókod? Vedd fel a
          kapcsolatot velünk az alábbi emailcímen:{" "}
          <a href="mailto:admin@example.hu">admin@example.hu</a>
        </div>
      </div>
    </div>
  );
}
