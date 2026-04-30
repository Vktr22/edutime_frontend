import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchTeachers } from "../services/teachers";
import "../css/TeachersPage.css";
import { Mail, Hash, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TeachersPage() {
    const { user, loading } = useAuth();

    const navigate = useNavigate();

    const [teachers, setTeachers] = useState([]);

    const [error, setError] = useState("");

    useEffect(() => {
        if (!user || user.role !== "student") return;

        const token = localStorage.getItem("token");

        fetchTeachers(token)
            .then((data) => setTeachers(data))
            .catch((err) => {
                console.error("Error calling /api/teachers:", err);
                setError("Nem sikerült betölteni a tanárok listáját.");
            });
    }, [user]);

    if (loading) return <p>Tanárok betöltése...</p>;
    if (!user) return <p>Kérlek jelentkezz be.</p>;
    if (user.role !== "student")
        return <p>Nincs jogosultságod megtekinteni a tanárokat.</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1 className="page-title">
                <Users color="#c50337" /> Tanárok
            </h1>
            <div className="page-subtitle">
                Válassz egy tanárt az időpontfoglaláshoz
            </div>

            {teachers.length === 0 && <p>Nincs elérhető tanár.</p>}

            <div className="teacher-grid">
                {teachers.map((t) => (
                    <div
                        key={t.id}
                        className="teacher-card"
                        onClick={() => navigate(`/teachers/${t.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter")
                                navigate(`/teachers/${t.id}`);
                        }}
                    >
                        <h3 className="teacher-name">{t.name}</h3>

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
