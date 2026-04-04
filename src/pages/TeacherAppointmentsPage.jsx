import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";


export default function TeacherAppointmentsPage() {
    
    const { user, loading } = useAuth();

    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user || user.role !== "teacher") return;

        console.log("Teacher appointments page mounted");
    }, [user]);

    if (loading) return <p>Betöltés...</p>;
    if (!user) return <p>Kérlek jelentkezz be.</p>;
    if (user.role !== "teacher") {
        return <p>Ez az oldal csak tanároknak érhető el.</p>;
    }

    return (
        <div>
            <h2>Tanár - saját időpontjaim</h2>
            <p>Itt fognak megjelenni a hozzád tartozó időpontok.</p>
        </div>
    );
}