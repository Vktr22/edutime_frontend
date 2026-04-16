import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchTeacherById } from "../services/teachers";
import { bookAppointment } from "../services/appointments";
import { fetchAvailableSlots } from "../services/availability";
import "../css/TeacherDetailsPage.css";

export default function TeacherDetailsPage() {
  /*
        A useparams segitsegevel olvassuk ki az url-ben levo azont
        useauth a globalis aut allapotot adja
        lokalis usestate-ek a betoltott tanar adatait +hibakat ha van.
    */
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBooking = async () => {
    if (selectedSlots.length === 0) {
      alert("Kérlek válassz ki legalább egy időpontot!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Nincs bejelentkezés. Kérlek jelentkezz be újra.");
        return;
      }

      // ✅ MINDEN kiválasztott slot lefoglalása
      for (const slot of selectedSlots) {
        await bookAppointment(token, id, slot.raw);
      }

      setBookingSuccess(true);

      // ✅ Frissítjük a foglalható slotokat
      const refreshedSlots = await fetchAvailableSlots(token, id);
      setAvailableSlots(refreshedSlots);

      // ✅ Reset kijelölések
      setSelectedSlots([]);
    } catch (err) {
      console.error("Booking error:", err);
      const msg =
        err.response?.data?.message ||
        "Hiba történt a foglalás során. Próbáld újra.";
      alert(msg);
    }
  };

  //foglalhato idopontok betoltese
  useEffect(() => {
    if (!user || user.role !== "student") return;

    const token = localStorage.getItem("token");
    setLoadingSlots(true);

    fetchAvailableSlots(token, id)
      .then((data) => setAvailableSlots(data))
      .catch((err) => {
        console.error(err);
        setSlotError("Nem sikerült betölteni a foglalható időpontokat.");
      })
      .finally(() => setLoadingSlots(false));
  }, [user, id]);

  useEffect(() => {
    if (!user || user.role !== "student") return;

    const token = localStorage.getItem("token");

    fetchTeacherById(token, id)
      .then((data) => setTeacher(data))
      .catch((err) => {
        console.error(err);
        setError("Nem sikerült betölteni a tanár adatait.");
      });
  }, [user, id]);

  //helper fuggvenyek
  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function getDaysOfWeek() {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
    return days;
  }
  const days = getDaysOfWeek();

  const prevWeekEnd = new Date(weekStart);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 1); // előző hét vasárnapja
  prevWeekEnd.setHours(23, 59, 59, 999);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  //korai kilepesi feltetelek = guard clause-ok
  if (loading) {
    return <p>Felhasználó betöltése...</p>;
  }
  if (!user) {
    return <p>Kérem jelentkezzen be.</p>;
  }
  if (user.role !== "student") {
    return <p>Kizárólag tanuló jogosultsággal érhető el ez az oldal.</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }
  if (!teacher) {
    return <p>Tanár betöltése...</p>;
  }

  //innentol(a return-ban) mar csak jo eset!!
  return (
    <div>
      <Link to="/teachers">← Vissza a tanárok oldalra</Link>
      <h2>Kiválasztott tanár adatai</h2>
      <div>
        <p>Tanár azonosító kód: {id}</p>
        <p>Név: {teacher.name}</p>
        <p>Email: {teacher.email}</p>
      </div>

      <h3>Foglalható időpontok</h3>
      <div className="week-nav">
        <button
          disabled={prevWeekEnd < today}
          onClick={() =>
            setWeekStart((prev) => {
              const next = new Date(prev);
              next.setDate(next.getDate() - 7);
              return next;
            })
          }
        >
          ←
        </button>

        <span>
          {days[0].toLocaleDateString("hu-HU")} –{" "}
          {days[6].toLocaleDateString("hu-HU")}
        </span>

        <button
          onClick={() =>
            setWeekStart(
              (prev) => new Date(new Date(prev).setDate(prev.getDate() + 7)),
            )
          }
        >
          →
        </button>
      </div>

      {loadingSlots && <p>Időpontok betöltése...</p>}
      {slotError && <p>{slotError}</p>}

      {availableSlots.length === 0 && !loadingSlots && (
        <p>Nincs elérhető időpont.</p>
      )}

      <div className="slots-container">
        <div className="week-grid">
          {days.map((day, index) => (
            <div key={index} className="day-column">
              <div className="day-header">
                <strong>
                  {day.toLocaleDateString("hu-HU", { weekday: "long" })}
                </strong>
                <div>{day.toLocaleDateString("hu-HU")}</div>
              </div>

              {availableSlots
                .filter(
                  (slot) =>
                    new Date(slot.start).toDateString() === day.toDateString(),
                )
                .map((slot) => {
                  const start = slot.start.slice(11, 16);

                  const isSelected = selectedSlots.some(
                    (s) => s.raw === slot.start,
                  );

                  return (
                    <div
                      key={slot.start}
                      className={`slot-button ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedSlots((prev) => {
                          if (isSelected) {
                            // kijelölés törlése
                            return prev.filter((s) => s.raw !== slot.start);
                          }

                          // új kijelölés
                          return [
                            ...prev,
                            {
                              date: new Date(slot.start),
                              start,
                              raw: slot.start,
                            },
                          ];
                        });
                      }}
                    >
                      {start}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {selectedSlots.length > 0 && (
        <div className="selected-slot-summary">
          <p>
            <strong>Kiválasztott időpontok:</strong>
          </p>
          <ul>
            {selectedSlots.map((slot) => (
              <li key={slot.raw}>
                {slot.date.toLocaleDateString("hu-HU", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                – {slot.start}
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedSlots.length > 0 && (
        <div className="booking-action">
          <button onClick={handleBooking}>Időpont(ok) lefoglalása</button>
        </div>
      )}
      {bookingSuccess && (
        <div className="booking-success">
          <p>
            <strong>Sikeres foglalás!</strong>
          </p>
          <p>Az időpont(ok) sikeresen lefoglalásra kerültek.</p>

          <div style={{ marginTop: "12px" }}>
            <button onClick={() => navigate("/my-appointments")}>
              Időpontjaim megtekintése
            </button>

            <button
              style={{ marginLeft: "10px" }}
              onClick={() => navigate("/teachers")}
            >
              Vissza a tanárokhoz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
