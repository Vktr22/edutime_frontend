// src/pages/TeachersPage.jsx
import React, { useEffect, useState } from "react";
import { myAxios } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ha NEM student a user -> ne engedjük be (osszhangban van a backend oute-al: Route::middleware(['auth:sanctum', 'student']))
  if (user && user.role !== "student") {
    return <p>Nincs jogosultságod megtekinteni a tanárokat.</p>;
  }

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const { data } = await myAxios.get("/api/teachers");  //api hivas backendhez - valojaban: GET http://localhost:8000/api/teachers
      setTeachers(data);
    } catch (err) {
      console.error("Hiba /api/teachers híváskor:", err);
      setError("Nem sikerült betölteni a tanárok listáját.");   //ez lentebb az if(error)-kor lesz
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  if (loading) return <p>Tanárok betöltése...</p>;  //h felhasznalo baratabb legyen es kiirja, h toltodik az oldal, ne csak random villanjon egyet
  if (error) return <p>{error}</p>; //ez fentebb a catch agban a setError sor

  return (
    <div>
      <h2>Elérhető tanárok</h2>

      {teachers.length === 0 && <p>Nincs elérhető tanár.</p>}

      {teachers.map((t) => (
        <div key={t.id} style={{ marginBottom: "15px" }}>
          <h4>{t.name}</h4>
          <p>Email: {t.email}</p>

          {/* TeacherDetailsPage felé visz, ez kesobb a foglalast inditja majd el (teach profil+idopont) */}
          <Link to={`/teachers/${t.id}`}>Részletek és időpont foglalás →</Link>
        </div>
      ))}
    </div>
  );
}