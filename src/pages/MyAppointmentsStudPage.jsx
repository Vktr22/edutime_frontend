import { useAuth } from "../contexts/AuthContext";
import React, { useEffect, useState } from "react";
import { fetchStudentAppointments } from "../services/appointments";
import { cancelStudentAppointment } from "../services/appointments";

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
        <div>
        <h2>Saját időpontjaim</h2>

        {appointments.length === 0 ? (
            <p>Még nincs foglalt időpontod.</p>
        ) : (
            <table>
            <thead>
                <tr>
                <th>Tanár</th>
                <th>Időpont</th>
                </tr>
            </thead>
            <tbody>
                {/* Csak jövőbeli, aktív időpont törölhető */}
                {appointments.map((appt) => (
                <tr key={appt.id}>
                    <td>{appt.teacher.name}</td>
                    <td>{appt.lesson_time}</td>
                    <td>
                    {new Date(appt.lesson_time) > new Date() && appt.status === "active" && (
                        <button onClick={() => handleCancel(appt.id)}>
                        Törlés
                        </button>
                    )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
        </div>
    );

}