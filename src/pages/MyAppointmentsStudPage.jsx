import React from "react";
import { useAuth } from "../contexts/AuthContext";
import React, { useEffect, useState } from "react";

export default function MyAppointmentsStudPage() {

    const { user, loading } = useAuth();
    //adatfogadas elokeszitese
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState("");

    
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