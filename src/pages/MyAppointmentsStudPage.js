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

  // A foglalás után megjelenő sikeres üzenet láthatósága.
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

  // A foglalási sikerüzenetet 30 másodperc után automatikusan elrejtjük.
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

  // Sikeres ág: a teljes időpontlista oldalt rendereljük.
  return (
    <div className="appointments-wrap">
      <h1 className="appts-title">
        <Calendar color="#c50337" /> Időpontjaim
      </h1>

      {/* Foglalás utáni visszajelző doboz. */}
      {showBookingSuccess && (
        <div className="card appt-success">
          <strong>Sikeres foglalás!</strong>
          <div style={{ marginTop: 6, color: "rgba(180,165,168,0.95)" }}>
            Az új időpont(ok) megjelentek a listában.
          </div>
        </div>
      )}

      {/* Tanár által törölt, még nem tudomásul vett időpontok listája. */}
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
                    <div style={{ fontWeight: 800 }}>{appt.teacher.name}</div>
                    <div
                      className="muted"
                      style={{ color: "rgba(180,165,168,0.95)" }}
                    >
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
                      // Látottnak jelöljük, majd kivesszük a helyi listából.
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
          </div>
        </div>
      )}

      {/* Jövőbeli időpontok táblázatos bontásban, dátumonként csoportosítva. */}
      <h2 className="appts-section-title">Következő időpontok</h2>
      {Object.keys(futureGrouped).length === 0 && <p>Nincs foglalt időpont.</p>}

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
                      {/* Aktív időpont esetén engedélyezett a törlés. */}

              <tbody>
                {futureGrouped[date].map((appt) => (
                  <tr key={appt.id}>
                    <td>{appt.teacher.name}</td>
                    <td className="muted">
                      {new Date(date).toLocaleDateString("hu-HU")}
                    </td>
                    <td className="muted">{appt.lesson_time.slice(11, 16)}</td>
                    <td className="actions">
                      {appt.status === "active" && (
                        <button
                          type="button"
                          className="btn-danger-mini"
                          onClick={() => handleCancel(appt.id)}
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

      {/* Múltbeli időpontok csak olvasható listában jelennek meg. */}
      <h2 className="appts-section-title">Korábbi időpontok</h2>
      {Object.keys(pastGrouped).length === 0 && <p>Nincs korábbi időpont.</p>}

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
