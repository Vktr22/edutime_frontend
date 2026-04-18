import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchTeacherAppointments,
  cancelTeacherAppointment,
} from "../services/appointments";
import "../css/AppointmentsPage.css";

export default function TeacherAppointmentsPage() {
  const { user, loading } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  const [cancelledByStudent, setCancelledByStudent] = useState([]);
  const [futureGrouped, setFutureGrouped] = useState({});
  const [pastGrouped, setPastGrouped] = useState({});

  // segédfüggvény
  function groupByDate(appts) {
    return appts.reduce((acc, appt) => {
      const date = appt.lesson_time.split(" ")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(appt);
      return acc;
    }, {});
  }

  // tanár törli az időpontot (active -> cancelled_by_teacher)
  const handleCancel = async (appointmentId) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("Biztosan törölni szeretnéd ezt az időpontot?")) return;

    try {
      await cancelTeacherAppointment(token, appointmentId);

      // frontend frissítés
      setAppointments((prev) => {
        const updated = prev.map((a) =>
          a.id === appointmentId ? { ...a, status: "cancelled_by_teacher" } : a,
        );

        processAppointments(updated);
        return updated;
      });
    } catch (err) {
      alert(
        err.response?.data?.message || "Nem sikerült törölni az időpontot.",
      );
    }
  };

  function processAppointments(data) {
    const now = new Date();

    const cancelled = data.filter((a) => a.status === "cancelled_by_student");

    const future = data.filter(
      (a) => a.status === "active" && new Date(a.lesson_time) > now,
    );

    const past = data.filter(
      (a) => a.status === "active" && new Date(a.lesson_time) <= now,
    );

    setCancelledByStudent(cancelled);
    setFutureGrouped(groupByDate(future));
    setPastGrouped(groupByDate(past));
  }

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
  }, [user]);

  if (loading) return <p>Betöltés...</p>;
  if (!user) return <p>Kérlek jelentkezz be.</p>;
  if (user.role !== "teacher")
    return <p>Ez az oldal csak tanároknak érhető el.</p>;

  return (
    <div className="teacher-appointments-container">
      <h2>Időpontjaim</h2>

      {/* 🟥 TÖRÖLT */}
      {cancelledByStudent.length > 0 && (
        <div className="cancelled-block">
          <h3 className="section-title cancelled-title">Törölt időpontok</h3>

          {cancelledByStudent.map((appt) => (
            <div key={appt.id} className="appointment-card cancelled">
              <p>
                <strong>Időpont:</strong>{" "}
                {new Date(appt.lesson_time).toLocaleDateString("hu-HU", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                – {appt.lesson_time.slice(11, 16)}
              </p>
              <p>
                <strong>Diák:</strong> {appt.student.name}
              </p>

              <button
                onClick={() =>
                  setCancelledByStudent((prev) =>
                    prev.filter((a) => a.id !== appt.id),
                  )
                }
              >
                Tudomásul vettem
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🟦 KÖVETKEZŐ */}
      <h3 className="section-title">Következő időpontok</h3>
      {Object.keys(futureGrouped).length === 0 && (
        <p>Nincs következő időpont.</p>
      )}

      {Object.keys(futureGrouped).map((date) => (
        <div key={date} className="date-block">
          <h4>
            {new Date(date).toLocaleDateString("hu-HU", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h4>

          {futureGrouped[date].map((appt) => (
            <div key={appt.id} className="appointment-card">
              <p>
                <strong>Időpont:</strong> {appt.lesson_time.slice(11, 16)}
              </p>
              <p>
                <strong>Diák:</strong> {appt.student.name}
              </p>

              <button onClick={() => handleCancel(appt.id)}>Törlés</button>
            </div>
          ))}
        </div>
      ))}

      {/* 🟩 KORÁBBI */}
      <h3 className="section-title">Korábbi időpontok</h3>
      {Object.keys(pastGrouped).length === 0 && <p>Nincs korábbi időpont.</p>}

      {Object.keys(pastGrouped).map((date) => (
        <div key={date} className="date-block past">
          <h4>
            {new Date(date).toLocaleDateString("hu-HU", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h4>

          {pastGrouped[date].map((appt) => (
            <div key={appt.id} className="appointment-card disabled">
              <p>
                <strong>Időpont:</strong> {appt.lesson_time.slice(11, 16)}
              </p>
              <p>
                <strong>Diák:</strong> {appt.student.name}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
