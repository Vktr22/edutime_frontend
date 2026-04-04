import React from "react";
import { useParams, Link } from "react-router-dom";

export default function TeacherDetailsPage() {

    const { id } = useParams();

  return (
    <div>
        <h2>Kiválasztott tanár adatai</h2>
        <Link to="/teachers">← Vissza a tanárok oldalra</Link>
        <p>Tanárt azonosító kód: {id}</p>
    </div>
  );
}