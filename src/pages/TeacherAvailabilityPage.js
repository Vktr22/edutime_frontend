import React, { useEffect, useState } from "react";
import "../css/TeacherAvailabilityPage.css";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchAvailability,
  createAvailability,
  deleteAvailability,
} from "../services/availability";

export default function TeacherAvailabilityPage() {
  //allapotok elokeszitese, h legyen hova tolteni az adatot
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  // ideiglenes, mock időpontok UI-hoz
  const [availability, setAvailability] = useState({
    0: ["09:00–11:00"],
    2: ["14:00–16:00"],
  });

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

  function removeSlot(dayIndex, slotIndex) {
    setAvailability((prev) => {
      const updated = { ...prev };
      updated[dayIndex] = updated[dayIndex].filter((_, i) => i !== slotIndex);
      return updated;
    });
  }
  function addSlot(dayIndex) {
    const newSlot = "10:00–11:00"; // ideiglenes
    setAvailability((prev) => {
      const updated = { ...prev };
      const existing = updated[dayIndex] || [];
      updated[dayIndex] = [...existing, newSlot];
      return updated;
    });
  }

  const days = getDaysOfWeek();

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

              {availability[index]?.map((slot, slotIndex) => (
                <div key={slotIndex} className="time-slot">
                  <span>{slot}</span>
                  <button onClick={() => removeSlot(index, slotIndex)}>
                    ×
                  </button>
                </div>
              ))}

              <button className="add-slot-btn" onClick={() => addSlot(index)}>
                + Hozzáadás
              </button>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
