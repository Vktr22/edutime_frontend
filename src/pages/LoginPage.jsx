// src/pages/LoginPage.jsx
import React, { useState } from "react";

export default function LoginPage() {
  // lokális state a form mezőkhöz
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // EGYELŐRE csak logolunk, NINCS backend hívás
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submit:", { email, password });
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