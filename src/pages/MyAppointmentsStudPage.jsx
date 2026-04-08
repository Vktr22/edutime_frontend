import { useAuth } from "../contexts/AuthContext";
import React, { useEffect, useState } from "react";
import { fetchStudentAppointments } from "../services/appointments";
import { cancelStudentAppointment } from "../services/appointments";

export default function MyAppointmentsStudPage() {

    const { user, loading } = useAuth();
    //adatfogadas elokeszitese
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState("");

    
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