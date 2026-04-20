import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchTeachers } from "../services/teachers";
import "../css/TeachersPage.css";
import { Mail, Hash, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TeachersPage() {
  // Auth state: ebből tudjuk, ki van belépve és tölt-e még az auth.
  const { user, loading } = useAuth();

  // Programozott navigáció a tanár részletes oldalára.
  const navigate = useNavigate();

  // A backendről betöltött tanárlista.
  const [teachers, setTeachers] = useState([]);

  // Hibaüzenet, ha a tanárlista lekérése sikertelen.
  const [error, setError] = useState("");

  useEffect(() => {
    // Csak student szerepkörnél kérjük le a tanárokat.
    // Ez összhangban van a backend jogosultsági védelemmel is.
    if (!user || user.role !== "student") return;

    // Token az API híváshoz.
    const token = localStorage.getItem("token");

    // Tanárlista lekérése backendről.
    fetchTeachers(token)
      .then((data) => setTeachers(data))
      .catch((err) => {
        // Hiba logolása fejlesztői célra, majd felhasználóbarát üzenet kiírása.
        console.error("Error calling /api/teachers:", err);
        setError("Nem sikerült betölteni a tanárok listáját.");
      });
  }, [user]);

  // Guard clause-ok: betöltés, auth és jogosultság ellenőrzés.
  if (loading) return <p>Tanárok betöltése...</p>;
  if (!user) return <p>Kérlek jelentkezz be.</p>;
  if (user.role !== "student")
    return <p>Nincs jogosultságod megtekinteni a tanárokat.</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {/* Oldalcím és rövid instrukció a felhasználónak. */}
      <h1 className="page-title">
        <Users color="#c50337" /> Tanárok
      </h1>
      <div className="page-subtitle">
        Válassz egy tanárt az időpontfoglaláshoz
      </div>

      {/* Üres lista esetén visszajelzés. */}
      {teachers.length === 0 && <p>Nincs elérhető tanár.</p>}

      {/* Tanárkártyák listája, kattintással részletező oldalra lépünk. */}
      <div className="teacher-grid">
        {teachers.map((t) => (
          <div
            key={t.id}
            className="teacher-card"
            onClick={() => navigate(`/teachers/${t.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              // Billentyűzettel is elérhető navigáció (Enter).
              if (e.key === "Enter") navigate(`/teachers/${t.id}`);
            }}
          >
            <h3 className="teacher-name">{t.name}</h3>

            {/* Tanár meta adatai: email és azonosító. */}
            <div className="teacher-meta">
              <div className="teacher-meta-row">
                <Mail size={18} className="accent" />
                <span>{t.email}</span>
              </div>

              <div className="teacher-meta-row">
                <Hash size={18} className="accent" />
                <span>
                  Azonosító: <strong>{t.id}</strong>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
