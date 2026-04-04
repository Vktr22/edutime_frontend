import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function MyAppointmentsStudPage() {

    const { user, loading } = useAuth();

    
    if (loading) return <p>Betöltés...</p>;
    if (!user) return <p>Kérlek jelentkezz be.</p>;
    if (user.role !== "student") return <p>Ez az oldal csak tanulóknak érhető el.</p>;


    return (
        <div>
            <h2>Saját időpontjaim</h2>
            <p>Itt fognak megjelenni a lefoglalt időpontjaid.</p>
        </div>
    );
}