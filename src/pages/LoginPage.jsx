// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const { login, serverError } = useAuth();
  // lokális state a form mezőkhöz
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); //a komponens belsejeben minden renderkor lesz egy nav fgv amit barhol haszn(pl submit utan)

  
  const handleSubmit = async(e) => {
    e.preventDefault(); //SPA
    try {
        await login({ email, password });
        //tehat ha a login sikeres volt, mehetunk a /home-ra
        navigate("/home");
    } catch (err) {
        console.error("LoginPage handleSubmit error:", err);
    }

  };

  return (
    <div className="login">
      <h2>Bejelentkezés</h2>

      <form onSubmit={handleSubmit}>
        <div className="login-field">
          <label htmlFor="email">Email cím</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)} //onchange--->mezobe iros esemeny kezelo
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

        <button type="submit">Belépés</button>
      </form>
    </div>
  );
}