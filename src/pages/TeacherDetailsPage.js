import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchTeacherById } from "../services/teachers";
import { bookAppointment } from "../services/appointments";
import { fetchAvailableSlots } from "../services/availability";
import "../css/TeacherDetailsPage.css";

export default function TeacherDetailsPage() {
  /*
        A useParams segítségével olvassuk ki az URL-ben lévő tanár azonosítót.
        A useAuth a globális auth állapotot adja (felhasználó + betöltés).
        A lokális state-ek a tanár adatokat, időpontokat és UI állapotokat kezelik.
    */
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading } = useAuth();

  // Tanár adatai és általános hibák.
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState("");

  // Foglalható idősávok betöltési állapota és hibakezelése.
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");

  // Kiválasztott idősávok és heti nézet állapota.
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));

  // Sikeres foglalás utáni visszajelző állapot.
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // A kiválasztott idősávok foglalása (több időpont egyszerre).
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

  // Foglalható idősávok betöltése az aktuális tanárhoz.
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

  // Tanár részletes adatainak betöltése.
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

  // Segédfüggvény: visszaadja az adott hét hétfői napját.
  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Segédfüggvény: előállítja a kijelzett hét 7 napját.
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

  // Előző hét utolsó pillanata, hogy a múltba léptetést korlátozhassuk.
  const prevWeekEnd = new Date(weekStart);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 1); // előző hét vasárnapja
  prevWeekEnd.setHours(23, 59, 59, 999);

  // Mai nap 00:00-ra állítva az összehasonlításokhoz.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Korai kilépési feltételek (guard clause-ok).
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

  // Innentől csak a sikeres betöltési ág renderelődik.
  return (
    <div className="teacher-details">
      {/* (opcionális) vissza link - ha kell, tehetünk rá ghost gomb stílust később */}
      <Link to="/teachers" style={{ color: "rgba(180,165,168,0.95)" }}>
        ← Vissza a tanárokhoz
      </Link>

      {/* Teacher info card */}
      <div className="card teacher-info">
        <h2 className="teacher-info__name">{teacher.name}</h2>

        <div className="teacher-info__rows">
          <div className="teacher-info__row">
            <span className="accent">✉</span>
            <span>{teacher.email}</span>
          </div>
          <div className="teacher-info__row">
            <span className="accent">#</span>
            <span>Azonosító: {id}</span>
          </div>
        </div>
      </div>

      {/* Week bar */}
      <div className="weekbar">
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
          ‹
        </button>

        <div>
          {days[0].toLocaleDateString("hu-HU", {
            month: "short",
            day: "numeric",
          })}
          {" — "}
          {days[6].toLocaleDateString("hu-HU", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>

        <button
          onClick={() =>
            setWeekStart(
              (prev) => new Date(new Date(prev).setDate(prev.getDate() + 7)),
            )
          }
        >
          ›
        </button>
      </div>

      {/* Week grid */}
      {loadingSlots && <p>Időpontok betöltése...</p>}
      {slotError && <p>{slotError}</p>}

      <div className="week-grid">
        {days.map((day, index) => (
          <div key={index} className="day-col">
            <div className="day-head">
              <div className="dow">
                {day.toLocaleDateString("hu-HU", { weekday: "short" })}
              </div>
              <div className="date">{day.toLocaleDateString("hu-HU")}</div>
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
                  <button
                    type="button"
                    key={slot.start}
                    className={"slot-btn" + (isSelected ? " is-selected" : "")}
                    onClick={() => {
                      // Ugyanarra az idősávra kattintva ki/be kapcsoljuk a kijelölést.
                      setSelectedSlots((prev) => {
                        if (isSelected)
                          return prev.filter((s) => s.raw !== slot.start);
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
                  </button>
                );
              })}

            {/* empty state per-day */}
            {availableSlots.filter(
              (slot) =>
                new Date(slot.start).toDateString() === day.toDateString(),
            ).length === 0 &&
              !loadingSlots && (
                <div className="no-slot">Nincs elérhető időpont</div>
              )}
          </div>
        ))}
      </div>

      {/* Selected panel (always show like Figma) */}
      <div className="card selected-panel">
        <h3 className="selected-title">
          <span style={{ color: "#c50337" }}>📅</span> Kiválasztott időpontok
        </h3>

        {selectedSlots.length === 0 ? (
          <div className="selected-empty">
            Még nem választottál ki egyetlen időpontot sem.
          </div>
        ) : (
          <>
            <div className="selected-list">
              {selectedSlots.map((slot) => (
                <div className="selected-item" key={slot.raw}>
                  <div>
                    {slot.date.toLocaleDateString("hu-HU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {" · "}
                    {slot.start}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSlots((prev) =>
                        prev.filter((s) => s.raw !== slot.raw),
                      )
                    }
                    aria-label="Időpont eltávolítása"
                    title="Eltávolítás"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="selected-total">
              Összesen: <strong>{selectedSlots.length} óra</strong>
            </div>

            <button className="selected-cta" onClick={handleBooking}>
              ✓ Foglalás megerősítése
            </button>
          </>
        )}
      </div>

      {/* bookingSuccess maradhat egyelőre natív alert/box - később toast */}
      {bookingSuccess && (
        <div className="card" style={{ padding: 18 }}>
          <strong>Sikeres foglalás!</strong>
          <div style={{ marginTop: 6, color: "rgba(180,165,168,0.95)" }}>
            Az időpont(ok) lefoglalásra kerültek.
          </div>
        </div>
      )}
    </div>
  );
}
