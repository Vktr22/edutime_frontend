import React, { useEffect, useState } from "react";
import "../css/TeacherAvailabilityPage.css";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchAvailability,
  createAvailability,
  deleteAvailability,
} from "../services/availability";

export default function TeacherAvailabilityPage() {
  //allapotok elokeszitese, h legyen hova tolteni az adatot --vagyis statek
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [availability, setAvailability] = useState([]);
  const [addingDay, setAddingDay] = useState(null); //melyik napra nyitott a szerkesztő (pl. 0 = hétfő)
  const [newSlot, setNewSlot] = useState({
    //ideiglenesen kiválasztott időpontok
    start: "",
    end: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetchAvailability(token)
      .then((data) => {
        setAvailability(data);
      })
      .catch((err) => {
        console.error("Availability fetch error:", err);
      });
  }, []);

  //helper fuggvenyek
  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function changeWeek(offset) {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + offset * 7);
    setWeekStart(newDate);
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

  // Ellenőrzi az időpontokat, majd a kiválasztott naphoz tartozó elérhetőséget elmenti.
  function saveSlot(dayIndex) {
    if (!newSlot.start || !newSlot.end) {
      alert("Kérlek válaszd ki a kezdő és záró időpontot!");
      return;
    }

    if (newSlot.start >= newSlot.end) {
      alert("A kezdés nem lehet későbbi vagy egyenlő a végénél!");
      return;
    }

    const token = localStorage.getItem("token");

    const payload = {
      weekday: dayIndex,
      start_time: newSlot.start,
      end_time: newSlot.end,
    };

    createAvailability(token, payload)
      .then((created) => {
        setAvailability((prev) => [...prev, created]);
        setAddingDay(null);
        setNewSlot({ start: "", end: "" });
      })
      .catch(() => {
        alert("Nem sikerült menteni az idősávot.");
      });
  }

  function generateTimeOptions(day) {
    const times = [];
    const now = new Date();

    for (let h = 0; h < 24; h++) {
      // mai nap esetén múlt órák tiltása
      if (day.toDateString() === now.toDateString() && h <= now.getHours()) {
        continue;
      }

      const hour = String(h).padStart(2, "0");
      times.push(`${hour}:00`);
    }

    return times;
  }

  const days = getDaysOfWeek();

  function isPastDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return d < today;
  }

  /*
    if (loading) return <p>Betöltés...</p>;
    if (!user) return <p>Kérlek jelentkezz be.</p>;
    if (user.role !== "teacher")
        return <p>Ez az oldal csak tanároknak érhető el.</p>;
    */

  return (
    <div className="availability-container">
      <div className="availability-header">
        <div className="availability-title">Elérhetőségeim</div>

        <div className="week-nav">
          <button onClick={() => changeWeek(-1)}>←</button> {/*lepteto*/}
          <span className="week-label">
            {weekStart.toLocaleDateString("hu-HU", {
              //datom tol- (het kezdete)
              month: "long",
              day: "numeric",
            })}
            {" – "}
            {days[6].toLocaleDateString("hu-HU", {
              //datom -ig (het vege)
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <button onClick={() => changeWeek(1)}>→</button> {/*masik lepteto */}
        </div>
      </div>

      <div className="week-grid">
        {days.map(
          (
            day,
            index, //het oszlopok map-el vegig iteral
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

              {availability
                .filter((slot) => slot.weekday === index)
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

              {addingDay === index ? ( //*1*Az első blokk egy feltételes megjelenítés. Azt nézi, hogy az adott napnál éppen nyitva van-e az új idősáv felvitele, vagyis az addingDay === index teljesül-e. Ha igen, akkor a szerkesztő felület jelenik meg, ha nem, akkor csak a + Hozzáadás gomb.
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

                  <button onClick={() => saveSlot(index)}>Mentés</button>
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
