// src/pages/TeachersPage.jsx
import React, { useEffect, useState } from "react";
import { myAxios } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function TeachersPage() {
  const { user, loading } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {  
    // ha NEM student a user -> ne engedjük be (osszhangban van a backend oute-al: Route::middleware(['auth:sanctum', 'student']))
    //de a return ALUL
    if (!user || user.role !== "student") return;

    
    const loadTeachers = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await myAxios.get("/api/teachers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeachers(data);
      } catch (err) {
        console.error("Error calling /api/teachers:", err);
        setError("Nem sikerült betölteni a tanárok listáját.");
      }
    };  
    loadTeachers();
  }, [user]);

  
  if (loading) return <p>Tanárok betöltése...</p>;
  if (!user) return <p>Kérlek jelentkezz be.</p>;
  if (user.role !== "student") {
    return <p>Nincs jogosultságod megtekinteni a tanárokat.</p>;
  }
  if (error) return <p>{error}</p>;


  return (
    <div>
      <h2>Elérhető tanárok</h2>

      {teachers.length === 0 && <p>Nincs elérhető tanár.</p>}

      {teachers.map((t) => (
        <div key={t.id}>
          <h4>{t.name}</h4>
          <p>Email: {t.email}</p>

          {/* TeacherDetailsPage felé visz, ez kesobb a foglalast inditja majd el (teach profil+idopont) */}
          <Link to={`/teachers/${t.id}`}>Részletek és időpont foglalás →</Link>
        </div>
      ))}
    </div>
  );
}