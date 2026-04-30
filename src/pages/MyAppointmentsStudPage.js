import { Calendar, XCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import React, { useEffect, useState } from "react";
import { fetchStudentAppointments } from "../services/appointments";
import { cancelStudentAppointment } from "../services/appointments";
import "../css/AppointmentsPage.css";
import { useLocation } from "react-router-dom";
import {
    addSeenCancelledId,
    getSeenCancelledIds,
} from "../services/cancellationSeen";
import { parseSqlDateTimeLocal, parseYMDLocal } from "../utils/datetimeLocal";

export default function MyAppointmentsStudPage() {
    const location = useLocation();
    const fromBooking = location.state?.fromBooking;

    const { user, loading } = useAuth();

    const [appointments, setAppointments] = useState([]);

    const [error, setError] = useState("");

    const [showBookingSuccess, setShowBookingSuccess] = useState(!!fromBooking);

    const [futureGrouped, setFutureGrouped] = useState({});

    const [pastGrouped, setPastGrouped] = useState({});

    const [cancelledByTeacher, setCancelledByTeacher] = useState([]);

    const handleCancel = async (appointmentId) => {
        const token = localStorage.getItem("token");

        if (!window.confirm("Biztosan törölni szeretnéd ezt az időpontot?"))
            return;

        try {
            await cancelStudentAppointment(token, appointmentId);
            alert("Időpont törölve.");

            setAppointments((prev) => {
                const updated = prev.filter(
                    (appt) => appt.id !== appointmentId,
                );

                const now = new Date();

                const future = updated.filter(
                    (a) =>
                        parseSqlDateTimeLocal(a.lesson_time) > now &&
                        a.status === "active",
                );

                const past = updated.filter(
                    (a) =>
                        parseSqlDateTimeLocal(a.lesson_time) <= now &&
                        a.status === "active",
                );

                function groupByDate(appts) {
                    return appts.reduce((acc, appt) => {
                        const date = appt.lesson_time.slice(0, 10);
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(appt);
                        return acc;
                    }, {});
                }

                setFutureGrouped(groupByDate(future));
                setPastGrouped(groupByDate(past));

                return updated;
            });
        } catch (err) {
            alert(
                err.response?.data?.message ||
                    "Nem sikerült törölni az időpontot.",
            );
        }
    };

    useEffect(() => {
        if (!user || user.role !== "student") return;

        const token = localStorage.getItem("token");

        fetchStudentAppointments(token)
            .then((data) => {
                setAppointments(data);

                const now = new Date();

                const seen = new Set(getSeenCancelledIds("student"));
                const cancelled = data.filter(
                    (a) =>
                        a.status === "cancelled_by_teacher" &&
                        !seen.has(Number(a.id)),
                );
                setCancelledByTeacher(cancelled);

                const future = data.filter(
                    (a) =>
                        new Date(a.lesson_time) > now && a.status === "active",
                );

                const past = data.filter(
                    (a) =>
                        new Date(a.lesson_time) <= now && a.status === "active",
                );

                function groupByDate(appts) {
                    return appts.reduce((acc, appt) => {
                        const date = appt.lesson_time.slice(0, 10);
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(appt);
                        return acc;
                    }, {});
                }

                setFutureGrouped(groupByDate(future));
                setPastGrouped(groupByDate(past));
            })
            .catch((err) => {
                console.error("Error fetching appointments:", err);
                setError("Nem sikerült betölteni az időpontokat.");
            });
    }, [user]);

    useEffect(() => {
        if (!fromBooking) return;

        const id = setTimeout(() => {
            setShowBookingSuccess(false);
        }, 30000); // 30 mp

        return () => clearTimeout(id);
    }, [fromBooking]);

    if (loading) return <p>Betöltés...</p>;

    if (!user) return <p>Kérlek jelentkezz be.</p>;

    if (user.role !== "student")
        return <p>Ez az oldal csak tanulóknak érhető el.</p>;

    return (
        <div className="appointments-wrap">
            <h1 className="appts-title">
                <Calendar color="#c50337" /> Időpontjaim
            </h1>

            {showBookingSuccess && (
                <div className="card appt-success">
                    <strong>Sikeres foglalás!</strong>
                    <div
                        style={{
                            marginTop: 6,
                            color: "rgba(180,165,168,0.95)",
                        }}
                    >
                        Az új időpont(ok) megjelentek a listában.
                    </div>
                </div>
            )}

            {cancelledByTeacher.length > 0 && (
                <div className="cancelled-alert">
                    <div className="cancelled-alert__content">
                        <div style={{ fontWeight: 900, fontSize: 18 }}>
                            Törölt időpontok
                        </div>
                        <div className="cancelled-alert__items">
                            {cancelledByTeacher.map((appt) => (
                                <div key={appt.id} className="cancelled-item">
                                    <div>
                                        <div style={{ fontWeight: 800 }}>
                                            {appt.teacher.name}
                                        </div>
                                        <div
                                            className="muted"
                                            style={{
                                                color: "rgba(180,165,168,0.95)",
                                            }}
                                        >
                                            {parseSqlDateTimeLocal(
                                                appt.lesson_time,
                                            ).toLocaleDateString("hu-HU", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}{" "}
                                            · {appt.lesson_time.slice(11, 16)}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            addSeenCancelledId(
                                                "student",
                                                appt.id,
                                            );
                                            setCancelledByTeacher((prev) =>
                                                prev.filter(
                                                    (a) => a.id !== appt.id,
                                                ),
                                            );
                                        }}
                                    >
                                        Tudomásul vettem
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <h2 className="appts-section-title">Következő időpontok</h2>
            {Object.keys(futureGrouped).length === 0 && (
                <p>Nincs foglalt időpont.</p>
            )}

            {Object.keys(futureGrouped).map((date) => (
                <div key={date} className="block">
                    <div className="card table-card">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Tanár neve</th>
                                    <th>Dátum</th>
                                    <th>Időpont</th>
                                    <th className="actions">Műveletek</th>
                                </tr>
                            </thead>

                            <tbody>
                                {futureGrouped[date].map((appt) => (
                                    <tr key={appt.id}>
                                        <td>{appt.teacher.name}</td>
                                        <td className="muted">
                                            {parseYMDLocal(
                                                date,
                                            ).toLocaleDateString("hu-HU")}
                                        </td>
                                        <td className="muted">
                                            {appt.lesson_time.slice(11, 16)}
                                        </td>
                                        <td className="actions">
                                            {appt.status === "active" && (
                                                <button
                                                    type="button"
                                                    className="btn-danger-mini"
                                                    onClick={() =>
                                                        handleCancel(appt.id)
                                                    }
                                                >
                                                    <XCircle size={18} />
                                                    Törlés
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            <h2 className="appts-section-title">Korábbi időpontok</h2>
            {Object.keys(pastGrouped).length === 0 && (
                <p>Nincs korábbi időpont.</p>
            )}

            {Object.keys(pastGrouped).map((date) => (
                <div key={date} className="block">
                    <div className="card table-card">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Tanár neve</th>
                                    <th>Dátum</th>
                                    <th>Időpont</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pastGrouped[date].map((appt) => (
                                    <tr key={appt.id}>
                                        <td>{appt.teacher.name}</td>
                                        <td className="muted">
                                            {parseYMDLocal(
                                                date,
                                            ).toLocaleDateString("hu-HU")}
                                        </td>
                                        <td className="muted">
                                            {appt.lesson_time.slice(11, 16)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}
