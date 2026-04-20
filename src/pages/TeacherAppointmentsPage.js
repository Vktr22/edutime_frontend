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

function groupByDate(appts) {
  return appts.reduce((acc, appt) => {
    const date = appt.lesson_time.split(" ")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(appt);
    return acc;
  }, {});
}

export default function TeacherAppointmentsPage() {
  // Belépett felhasználó és auth betöltési állapot.
  const { user, loading } = useAuth();

  // Összes időpont (nyers lista), valamint általános hibaállapot.
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  // Feldolgozott nézetek: törölt, jövőbeli és múltbeli időpontok.
  const [cancelledByStudent, setCancelledByStudent] = useState([]);
  const [futureGrouped, setFutureGrouped] = useState({});
  const [pastGrouped, setPastGrouped] = useState({});

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

  // Az időpontlista feldolgozása és bontása UI szekciókhoz.
  const processAppointments = useCallback((data) => {
    const now = new Date();

    // Már "látott" törölt elemek, hogy ne jelenjenek meg újra értesítésként.
    const seen = new Set(getSeenCancelledIds("teacher"));

    // Jövőbeli aktív időpontok.
    const future = data.filter(
      (a) => a.status === "active" && new Date(a.lesson_time) > now,
    );

    // Múltbeli aktív időpontok.
    const past = data.filter(
      (a) => a.status === "active" && new Date(a.lesson_time) <= now,
    );

    // csak EZ jelenhet meg töröltként tanárnál, és csak ami még nincs láttamozva
    const cancelled = data.filter(
      (a) => a.status === "cancelled_by_student" && !seen.has(Number(a.id)),
    );

    setCancelledByStudent(cancelled);
    setFutureGrouped(groupByDate(future));
    setPastGrouped(groupByDate(past));
  }, []);

  // Tanári időpontok betöltése belépés után.
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

  // Guard clause-ok: auth és jogosultság ellenőrzés.
  if (loading) return <p>Betöltés...</p>;
  if (!user) return <p>Kérlek jelentkezz be.</p>;
  if (user.role !== "teacher")
    return <p>Ez az oldal csak tanároknak érhető el.</p>;

  // Sikeres ág: a tanári időpontok teljes oldala renderelődik.
  return (
    <div className="appointments-wrap">
      <h1 className="appts-title">
        <Calendar color="#c50337" /> Időpontjaim
      </h1>

      {/* Diák által törölt, még nem tudomásul vett időpontok listája. */}
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
                    <div style={{ fontWeight: 800 }}>{appt.student.name}</div>
                    <div style={{ color: "rgba(180,165,168,0.95)" }}>
                      {new Date(appt.lesson_time).toLocaleDateString("hu-HU", {
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
                      // Látottnak jelöljük, majd helyben eltávolítjuk a listából.
                      addSeenCancelledId("teacher", appt.id);
                      setCancelledByStudent((prev) =>
                        prev.filter((a) => a.id !== appt.id),
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

      {/* Jövőbeli időpontok táblázatos listája (törlés opcióval). */}
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
                      {new Date(date).toLocaleDateString("hu-HU")}
                    </td>
                    <td className="muted">{appt.lesson_time.slice(11, 16)}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn-danger-mini"
                        onClick={() => handleCancel(appt.id)}
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

      {/* Múltbeli időpontok csak olvasható listában. */}
      <h2 className="appts-section-title">Korábbi időpontok</h2>
      {Object.keys(pastGrouped).length === 0 && <p>Nincs korábbi időpont.</p>}

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
                      {new Date(date).toLocaleDateString("hu-HU")}
                    </td>
                    <td className="muted">{appt.lesson_time.slice(11, 16)}</td>
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
