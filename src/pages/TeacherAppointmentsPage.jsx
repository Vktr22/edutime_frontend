import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchTeacherAppointments } from "../services/appointments";
import { cancelTeacherAppointment } from "../services/appointments";


export default function TeacherAppointmentsPage() {
    
    const { user, loading } = useAuth();

    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState("");

    // Tanár által törölt jövőbeli időpont kezelése és lista frissítése
    const handleCancel = async (appointmentId) => {
        const token = localStorage.getItem("token");

        if (!window.confirm("Biztosan törölni szeretnéd ezt az időpontot?")) return;

        try {
            await cancelTeacherAppointment(token, appointmentId);
            alert("Időpont törölve.");

            // Lista frissítése törlés után
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

    useEffect(() => {
        if (!user || user.role !== "teacher") return;

        const token = localStorage.getItem("token");

        fetchTeacherAppointments(token)
            .then((data) => setAppointments(data))
            .catch((err) => {
            console.error("Error fetching teacher appointments:", err);
            setError("Nem sikerült betölteni az időpontokat.");
            });
    }, [user]);

    if (loading) return <p>Betöltés...</p>;
    if (!user) return <p>Kérlek jelentkezz be.</p>;
    if (user.role !== "teacher") {
        return <p>Ez az oldal csak tanároknak érhető el.</p>;
    }

    return (
        <div>
            <h2>Tanár – saját időpontjaim</h2>

            {appointments.length === 0 ? (
            <p>Még nincs hozzád tartozó időpont.</p>
            ) : (
            <table>
                <thead>
                <tr>
                    <th>Tanuló</th>
                    <th>Időpont</th>
                </tr>
                </thead>
                <tbody>
                    {/* Csak jövőbeli és aktív időpont törölhető */}
                    {appointments.map((appt) => (
                        <tr key={appt.id}>
                            <td>{appt.student.name}</td>
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