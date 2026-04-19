import React, { useEffect, useState } from "react";
import "../css/TeacherAvailabilityPage.css";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchAvailability,
  createAvailability,
  deleteAvailability,
} from "../services/availability";

export default function TeacherAvailabilityPage() {
  // A jelenleg megjelenített hét kezdőnapja.
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));

  // A backendből betöltött elérhetőségi idősávok listája.
  const [availability, setAvailability] = useState([]);

  // Megmondja, melyik naphoz van éppen nyitva az új idősáv felvitelekor a szerkesztő.
  const [addingDay, setAddingDay] = useState(null);

  // Az ideiglenesen kiválasztott kezdő és záró időpont.
  const [newSlot, setNewSlot] = useState({
    start: "",
    end: "",
  });

  useEffect(() => {
    // Belépés után betöltjük a tanár korábban mentett elérhetőségeit.
    const token = localStorage.getItem("token");

    fetchAvailability(token)
      .then((data) => {
        setAvailability(data);
      })
      .catch((err) => {
        console.error("Availability fetch error:", err);
      });
  }, []);

  // Segédfüggvény: megkeresi az adott hét hétfői napját.
  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Ezzel lépünk vissza vagy előre egy teljes hetet.
  function changeWeek(offset) {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + offset * 7);
    setWeekStart(newDate);
  }

  // A kijelzett hét 7 napját gyűjtjük össze egy tömbbe.
  function getDaysOfWeek() {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
    return days;
  }

  // Egy idősáv törlése a backendből, majd a lokális listából is.
  function handleDelete(id) {
    const token = localStorage.getItem("token");

    deleteAvailability(token, id)
      .then(() => {
        setAvailability((prev) => prev.filter((a) => a.id !== id));
      })
      .catch(() => {
        alert("Nem sikerült törölni az idősávot.");
      });
  }

  // Eldönti, hogy egy nap már múltbeli-e, így ne lehessen rajta módosítani.
  function isPastDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return d < today;
  }

  //ez a böngésző helyi időzónája szerint állítja elő a dátumot.
  function toLocalYYYYMMDD(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Megnézi, hogy az új idősáv átfed-e valamelyik meglévővel ugyanazon a napon.
  function hasOverlap(dateStr, newStart, newEnd) {
    return availability
      .filter((slot) => slot.date === dateStr)
      .some((slot) => {
        const existingStart = slot.start_time.slice(0, 5);
        const existingEnd = slot.end_time.slice(0, 5);

        return newStart < existingEnd && newEnd > existingStart;
      });
  }

  // Mentés előtt ellenőrzi a beírt időpontokat, majd elküldi az új idősávot.
  function saveSlot(day) {
    if (!newSlot.start || !newSlot.end) {
      alert("Kérlek válaszd ki a kezdő és záró időpontot!");
      return;
    }

    if (newSlot.start >= newSlot.end) {
      alert("A kezdés nem lehet későbbi vagy egyenlő a végénél!");
      return;
    }

    // A napot egységes YYYY-MM-DD formára alakítjuk.
    const selectedDate = toLocalYYYYMMDD(day); // YYYY-MM-DD

    // Ha ütközés van, nem engedjük a mentést.
    if (hasOverlap(selectedDate, newSlot.start, newSlot.end)) {
      alert("Az új idősáv átfed egy meglévő elérhetőséggel.");
      return;
    }

    const token = localStorage.getItem("token");

    const payload = {
      date: selectedDate,
      start_time: newSlot.start,
      end_time: newSlot.end,
    };

    createAvailability(token, payload)
      .then((created) => {
        setAvailability((prev) => [...prev, created]);
        setAddingDay(null);
        setNewSlot({ start: "", end: "" });
      })
      .catch((err) => {
        alert(
          err.response?.data?.message || "Nem sikerült menteni az idősávot.",
        );
      });
  }

  // Az adott naphoz legenerálja az óránként választható időpontokat.
  function generateTimeOptions(day) {
    const times = [];
    const now = new Date();

    for (let h = 0; h < 24; h++) {
      // Mai napra nem engedjük a már elmúlt órákat.
      if (day.toDateString() === now.toDateString() && h <= now.getHours()) {
        continue;
      }

      const hour = String(h).padStart(2, "0");
      times.push(`${hour}:00`);
    }

    return times;
  }

  // A kijelzett hét napjai.
  const days = getDaysOfWeek();

  /*
    Ha később szerepkör-alapú védelem vagy külön betöltési állapot kell,
    ezek a visszatérési ágak könnyen visszahelyezhetők.
  */

  return (
    <div className="availability-container">
      <div className="availability-header">
        <div className="availability-title">Elérhetőségeim</div>

        {/* Hetet léptető navigáció */}
        <div className="week-nav">
          <button onClick={() => changeWeek(-1)}>←</button> {/* Előző hét */}
          <span className="week-label">
            {weekStart.toLocaleDateString("hu-HU", {
              // A hét kezdőnapja.
              month: "long",
              day: "numeric",
            })}
            {" – "}
            {days[6].toLocaleDateString("hu-HU", {
              // A hét záró napja.
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <button onClick={() => changeWeek(1)}>→</button> {/* Következő hét */}
        </div>
      </div>

      {/* A hét napjai oszlopokban jelennek meg. */}
      <div className="week-grid">
        {days.map(
          (
            day,
            index, // A hét napjain iterálunk végig.
          ) => (
            <div key={index} className="day-column">
              <div className="day-header">
                <div className="day-name">
                  {day.toLocaleDateString("hu-HU", { weekday: "long" })}
                </div>
                <div className="day-date">
                  {day.toLocaleDateString("hu-HU")}
                </div>
              </div>

              {/* Az adott naphoz tartozó elérhetőségek listája. */}
              {availability
                .filter((slot) => slot.date === toLocalYYYYMMDD(day))
                .map((slot) => (
                  <div key={slot.id} className="time-slot">
                    <span>
                      {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                    </span>
                    {!isPastDay(day) && (
                      <button onClick={() => handleDelete(slot.id)}>×</button>
                    )}
                  </div>
                ))}

              {/* Ha erre a napra nyitottuk meg a szerkesztőt, itt jelenik meg a form. */}
              {addingDay === index ? (
                <div>
                  <select
                    value={newSlot.start}
                    onChange={(e) =>
                      setNewSlot((prev) => ({ ...prev, start: e.target.value }))
                    }
                  >
                    <option value="">Mettől</option>
                    {generateTimeOptions(day).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newSlot.end}
                    onChange={(e) =>
                      setNewSlot((prev) => ({ ...prev, end: e.target.value }))
                    }
                  >
                    <option value="">Meddig</option>
                    {generateTimeOptions(day).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <button onClick={() => saveSlot(day)}>Mentés</button>
                  <button
                    onClick={() => {
                      setAddingDay(null);
                      setNewSlot({ start: "", end: "" });
                    }}
                  >
                    Mégse
                  </button>
                </div>
              ) : (
                !isPastDay(day) && (
                  <button
                    className="add-slot-btn"
                    onClick={() => {
                      setAddingDay(index);
                      setNewSlot({ start: "", end: "" });
                    }}
                  >
                    + Hozzáadás
                  </button>
                )
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
