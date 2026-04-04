import { useAuth } from "../contexts/AuthContext";
import React, { useEffect, useState } from "react";
import { fetchStudentAppointments } from "../services/appointments";

export default function MyAppointmentsStudPage() {

    const { user, loading } = useAuth();
    //adatfogadas elokeszitese
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState("");

    //belepes utan megjelenik consolelogban
    useEffect(() => {
        if (!user || user.role !== "student") return;

        const token = localStorage.getItem("token");

        fetchStudentAppointments(token)
            .then((data) => setAppointments(data))
            .catch((err) => {
            console.error("Error fetching appointments:", err);
            setError("Nem sikerült betölteni az időpontokat.");
        });

    }, [user]);

    
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