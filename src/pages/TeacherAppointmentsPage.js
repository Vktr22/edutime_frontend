import { Calendar, XCircle } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
    fetchTeacherAppointments,
    cancelTeacherAppointment,
} from "../services/appointments";
import "../css/AppointmentsPage.css";
import {
    addSeenCancelledId,
    getSeenCancelledIds,
} from "../services/cancellationSeen";
import { parseYMDLocal, parseSqlDateTimeLocal } from "../utils/datetimeLocal";

function groupByDate(appts) {
    return appts.reduce((acc, appt) => {
        const date = appt.lesson_time.slice(0, 10); // "YYYY-MM-DD"
        if (!acc[date]) acc[date] = [];
        acc[date].push(appt);
        return acc;
    }, {});
}

export default function TeacherAppointmentsPage() {
    const { user, loading } = useAuth();

    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState("");

    const [cancelledByStudent, setCancelledByStudent] = useState([]);
    const [futureGrouped, setFutureGrouped] = useState({});
    const [pastGrouped, setPastGrouped] = useState({});

    const handleCancel = async (appointmentId) => {
        const token = localStorage.getItem("token");

        if (!window.confirm("Biztosan törölni szeretnéd ezt az időpontot?"))
            return;

        try {
            await cancelTeacherAppointment(token, appointmentId);

            setAppointments((prev) => {
                const updated = prev.map((a) =>
                    a.id === appointmentId
                        ? { ...a, status: "cancelled_by_teacher" }
                        : a,
                );

                processAppointments(updated);
                return updated;
            });
            alert("Időpont törölve.");
        } catch (err) {
            alert(
                err.response?.data?.message ||
                    "Nem sikerült törölni az időpontot.",
            );
        }
    };

    const processAppointments = useCallback((data) => {
        const now = new Date();

        const seen = new Set(getSeenCancelledIds("teacher"));

        const future = data.filter(
            (a) =>
                a.status === "active" &&
                parseSqlDateTimeLocal(a.lesson_time) > now,
        );

        const past = data.filter(
            (a) =>
                a.status === "active" &&
                parseSqlDateTimeLocal(a.lesson_time) <= now,
        );

        const cancelled = data.filter(
            (a) =>
                a.status === "cancelled_by_student" && !seen.has(Number(a.id)),
        );

        setCancelledByStudent(cancelled);
        setFutureGrouped(groupByDate(future));
        setPastGrouped(groupByDate(past));
    }, []);

    useEffect(() => {
        if (!user || user.role !== "teacher") return;

        const token = localStorage.getItem("token");

        fetchTeacherAppointments(token)
            .then((data) => {
                setAppointments(data);
                processAppointments(data);
            })
            .catch((err) => {
                console.error(err);
                setError("Nem sikerült betölteni az időpontokat.");
            });
    }, [user, processAppointments]);

    if (loading) return <p>Betöltés...</p>;
    if (!user) return <p>Kérlek jelentkezz be.</p>;
    if (user.role !== "teacher")
        return <p>Ez az oldal csak tanároknak érhető el.</p>;

    return (
        <div className="appointments-wrap">
            <h1 className="appts-title">
                <Calendar color="#c50337" /> Időpontjaim
            </h1>

            {cancelledByStudent.length > 0 && (
                <div className="cancelled-alert">
                    <div className="cancelled-alert__content">
                        <div style={{ fontWeight: 900, fontSize: 18 }}>
                            Törölt időpontok
                        </div>

                        <div className="cancelled-alert__items">
                            {cancelledByStudent.map((appt) => (
                                <div key={appt.id} className="cancelled-item">
                                    <div>
                                        <div style={{ fontWeight: 800 }}>
                                            {appt.student.name}
                                        </div>
                                        <div
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
                                                "teacher",
                                                appt.id,
                                            );
                                            setCancelledByStudent((prev) =>
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
                <p>Nincs következő időpont.</p>
            )}

            {Object.keys(futureGrouped).map((date) => (
                <div key={date} className="block">
                    <div className="card table-card">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Diák neve</th>
                                    <th>Dátum</th>
                                    <th>Időpont</th>
                                    <th className="actions">Műveletek</th>
                                </tr>
                            </thead>

                            <tbody>
                                {futureGrouped[date].map((appt) => (
                                    <tr key={appt.id}>
                                        <td>{appt.student.name}</td>
                                        <td className="muted">
                                            {parseYMDLocal(
                                                date,
                                            ).toLocaleDateString("hu-HU")}
                                        </td>
                                        <td className="muted">
                                            {appt.lesson_time.slice(11, 16)}
                                        </td>
                                        <td className="actions">
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
                                    <th>Diák neve</th>
                                    <th>Dátum</th>
                                    <th>Időpont</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pastGrouped[date].map((appt) => (
                                    <tr key={appt.id}>
                                        <td>{appt.student.name}</td>
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
