import React from "react";
import { Link } from "react-router-dom";

export default function NoPage() {
  return (
    <div>
      <h2>404 – Az oldal nem található</h2>
      <p>A keresett oldal nem létezik.</p>
      <Link to="/home">Vissza a kezdőlapra</Link>
    </div>
  );
}