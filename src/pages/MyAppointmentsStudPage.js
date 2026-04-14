import { useAuth } from "../contexts/AuthContext";
import React, { useEffect, useState } from "react";
import { fetchStudentAppointments } from "../services/appointments";
import { cancelStudentAppointment } from "../services/appointments";
import "../css/MyAppointmentsStudPage.css";

export default function MyAppointmentsStudPage() {

    const { user, loading } = useAuth();
    //adatfogadas elokeszitese
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState("");
    // Jövőbeli és múltbeli időpontok csoportosítva nap szerint
    const [futureGrouped, setFutureGrouped] = useState({});
    const [pastGrouped, setPastGrouped] = useState({});

    
    // Diák időpontjának törlése és lista frissítése
    const handleCancel = async (appointmentId) => {
        const token = localStorage.getItem("token");

        if (!window.confirm("Biztosan törölni szeretnéd ezt az időpontot?")) return;

        try {
            await cancelStudentAppointment(token, appointmentId);
            alert("Időpont törölve.");

            // lista frissítése
            setAppointments((prev) =>
            prev.filter((appt) => appt.id !== appointmentId)
            );
        } catch (err) {
            alert(
            err.response?.data?.message ||
            "Nem sikerült törölni az időpontot."
            );
        }
    };

    //belepes utan megjelenik consolelogban
    useEffect(() => {
        if (!user || user.role !== "student") return;

        const token = localStorage.getItem("token");

        fetchStudentAppointments(token)
            .then((data) => {
                setAppointments(data);
                // Időpontok szétválasztása jövőbeli/múltbeli listára és napi bontásra
                // 1) Aktuális idő
                const now = new Date();

                // 2) Jövőbeli és múltbeli időpontok különválasztása
                const future = data.filter(a => new Date(a.lesson_time) > now);
                const past = data.filter(a => new Date(a.lesson_time) <= now);

                // 3) Csoportosítás dátum szerint
                function groupByDate(appts) {
                return appts.reduce((acc, appt) => {
                    const date = appt.lesson_time.split(" ")[0]; // YYYY-MM-DD
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(appt);
                    return acc;
                }, {});
                }

                // 4) Elmentjük a state-be
                setFutureGrouped(groupByDate(future));
                setPastGrouped(groupByDate(past));
            })
            .catch((err) => {
            console.error("Error fetching appointments:", err);
            setError("Nem sikerült betölteni az időpontokat.");
        });

    }, [user]);

    
    if (loading) return <p>Betöltés...</p>;
    if (!user) return <p>Kérlek jelentkezz be.</p>;
    if (user.role !== "student") return <p>Ez az oldal csak tanulóknak érhető el.</p>;


        
    return (
        <div className="my-appointments-container">
            <h2>Saját időpontjaim</h2>

            <h3 className="section-title">Következő időpontok</h3>

            {Object.keys(futureGrouped).length === 0 && (
            <p>Nincs foglalt időpont.</p>
            )}

            {Object.keys(futureGrouped).map(date => (
            <div key={date} className="date-block">
                
                <h4>
                {new Date(date).toLocaleDateString("hu-HU", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })}
                </h4>

                {futureGrouped[date].map(appt => (
                <div key={appt.id} className="appointment-card">
                    
                    <p><strong>Időpont:</strong> {appt.lesson_time.slice(11, 16)}</p>
                    <p><strong>Tanár:</strong> {appt.teacher.name}</p>

                    {/* Törlés gomb csak future + active */}
                    {appt.status === "active" && (
                    <button onClick={() => handleCancel(appt.id)}>
                        Törlés
                    </button>
                    )}

                </div>
                ))}
            </div>
            ))}
            <h3 className="section-title">Korábbi időpontok</h3>

            {Object.keys(pastGrouped).length === 0 && (
            <p>Nincs korábbi időpont.</p>
            )}

            {Object.keys(pastGrouped).map(date => (
            <div key={date} className="date-block past">
                
                <h4>
                {new Date(date).toLocaleDateString("hu-HU", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })}
                </h4>

                {pastGrouped[date].map(appt => (
                <div key={appt.id} className="appointment-card disabled">
                    <p><strong>Időpont:</strong> {appt.lesson_time.slice(11, 16)}</p>
                    <p><strong>Tanár:</strong> {appt.teacher.name}</p>
                    {/* NINCS törlés gomb */}
                </div>
                ))}
            </div>
            ))}
        </div>
    );

}