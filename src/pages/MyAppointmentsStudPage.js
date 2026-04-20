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

export default function MyAppointmentsStudPage() {
  // Az előző oldal state-je, hogy tudjuk, foglalásból érkeztünk-e.
  const location = useLocation();
  const fromBooking = location.state?.fromBooking;

  // Belépett felhasználó és az auth betöltési állapota.
  const { user, loading } = useAuth();

  // Az összes diák időpontja a backendről.
  const [appointments, setAppointments] = useState([]);

  // Hiba üzenet, ha az adatbetöltés nem sikerül.
  const [error, setError] = useState("");

  const [showBookingSuccess, setShowBookingSuccess] = useState(!!fromBooking);

  // Jövőbeli időpontok csoportosítva nap szerint.
  const [futureGrouped, setFutureGrouped] = useState({});

  // Múltbeli időpontok csoportosítva nap szerint.
  const [pastGrouped, setPastGrouped] = useState({});

  // A tanár által törölt, de még nem "láttam" állapotban lévő időpontok.
  const [cancelledByTeacher, setCancelledByTeacher] = useState([]);

  // Diák időpontjának törlése a backendon, majd a lokális lista frissítése.
  const handleCancel = async (appointmentId) => {
    // Token az API híváshoz.
    const token = localStorage.getItem("token");

    // Megerősítés a felhasználótól, hogy biztosan törölni szeretné-e.
    if (!window.confirm("Biztosan törölni szeretnéd ezt az időpontot?")) return;

    try {
      // Backend API hívás a törléshez.
      await cancelStudentAppointment(token, appointmentId);
      alert("Időpont törölve.");

      // Frontend lista frissítése: eltávolítjuk a törölt időpontot.
      setAppointments((prev) => {
        const updated = prev.filter((appt) => appt.id !== appointmentId);

        // Az idő alapján újra kiszámítjuk a jövő és múltbeli időpontokat.
        const now = new Date();

        // Jövőbeli aktív időpontok.
        const future = updated.filter(
          (a) => new Date(a.lesson_time) > now && a.status === "active",
        );

        // Múltbeli aktív időpontok.
        const past = updated.filter(
          (a) => new Date(a.lesson_time) <= now && a.status === "active",
        );

        // Segédfüggvény: időpontok csoportosítása YYYY-MM-DD nap szerint.
        function groupByDate(appts) {
          return appts.reduce((acc, appt) => {
            const date = appt.lesson_time.split(" ")[0];
            if (!acc[date]) acc[date] = [];
            acc[date].push(appt);
            return acc;
          }, {});
        }

        // State frissítés az új csoportosított adatokkal.
        setFutureGrouped(groupByDate(future));
        setPastGrouped(groupByDate(past));

        return updated;
      });
    } catch (err) {
      // Hiba megjeleníetése, ha a törlés nem sikerült.
      alert(
        err.response?.data?.message || "Nem sikerült törölni az időpontot.",
      );
    }
  };

  // Bejelentkezés után betöltjük a diák időpontjait és feldolgozzuk őket.
  useEffect(() => {
    // Csak diákok számára végrehajtható.
    if (!user || user.role !== "student") return;

    // Token az API híváshoz.
    const token = localStorage.getItem("token");

    // Backend API hívás: a diák összes időpontja.
    fetchStudentAppointments(token)
      .then((data) => {
        // Az összes időpont elmentése.
        setAppointments(data);

        // Az aktuális idő alapján soroljuk az időpontokat.
        const now = new Date();

        // Már "látott" törlések azonosítói, hogy csak az újakat jelezzük.
        const seen = new Set(getSeenCancelledIds("student"));
        const cancelled = data.filter(
          (a) => a.status === "cancelled_by_teacher" && !seen.has(Number(a.id)),
        );
        setCancelledByTeacher(cancelled);

        // Jövőbeli aktív időpontok.
        const future = data.filter(
          (a) => new Date(a.lesson_time) > now && a.status === "active",
        );

        // Múltbeli aktív időpontok.
        const past = data.filter(
          (a) => new Date(a.lesson_time) <= now && a.status === "active",
        );

        // Segédfüggvény: időpontok nap szerinti csoportosítása.
        function groupByDate(appts) {
          return appts.reduce((acc, appt) => {
            const date = appt.lesson_time.split(" ")[0]; // YYYY-MM-DD
            if (!acc[date]) acc[date] = [];
            acc[date].push(appt);
            return acc;
          }, {});
        }

        // State frissítés a csoportosított adatokkal.
        setFutureGrouped(groupByDate(future));
        setPastGrouped(groupByDate(past));
      })
      .catch((err) => {
        // Hiba kezelése és felhasználónak való jelzése.
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

  // Az auth állapot betöltése közben ne mutassunk félkész oldalt.
  if (loading) return <p>Betöltés...</p>;

  // Be nem jelentkezett felhasználó fallback.
  if (!user) return <p>Kérlek jelentkezz be.</p>;

  // Csak diákok léphetnek be erre az oldalra.
  if (user.role !== "student")
    return <p>Ez az oldal csak tanulóknak érhető el.</p>;

  return (
    <div className="my-appointments-container">
      <h2>Saját időpontjaim</h2>
      {/* Újonnan foglalt időpont sikeres üzenetéhez mutassuk az értesítést. */}
      {showBookingSuccess && (
        <div className="appointment-success">
          <p>
            <strong>Sikeres foglalás!</strong>
          </p>
          <p>Az új időpont(ok) megjelentek a listában.</p>
        </div>
      )}

      {/* Tanár által törölt időpontok szekciója. */}
      {cancelledByTeacher.length > 0 && (
        <div className="cancelled-block">
          <h3 className="section-title cancelled-title">Törölt időpontok</h3>

          {cancelledByTeacher.map((appt) => (
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
                <strong>Tanár:</strong> {appt.teacher.name}
              </p>

              {/* "Tudomásul vettem" gomb: ez megjelöli az időpontot, így nem jelenik majd értesítésként. */}
              <button
                onClick={() => {
                  addSeenCancelledId("student", appt.id);
                  setCancelledByTeacher((prev) =>
                    prev.filter((a) => a.id !== appt.id),
                  );
                }}
              >
                Tudomásul vettem
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Jövőbeli (még nem lejárt) időpontok szekciója. */}
      <h3 className="section-title">Következő időpontok</h3>

      {Object.keys(futureGrouped).length === 0 && <p>Nincs foglalt időpont.</p>}

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
                <strong>Tanár:</strong> {appt.teacher.name}
              </p>

              {/* Törlés gomb csak jövőbeli és aktív időpontoknál. */}
              {appt.status === "active" && (
                <button onClick={() => handleCancel(appt.id)}>Törlés</button>
              )}
            </div>
          ))}
        </div>
      ))}
      {/* Múltbeli (már lejárt) időpontok szekciója - csak olvasásra. */}
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
                <strong>Tanár:</strong> {appt.teacher.name}
              </p>
              {/* Múltbeli időpoints nem törölhető, így nincs törlés gomb. */}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
