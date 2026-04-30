import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchTeacherById } from "../services/teachers";
import { bookAppointment } from "../services/appointments";
import { fetchAvailableSlots } from "../services/availability";
import "../css/TeacherDetailsPage.css";
import { parseSqlDateTimeLocal } from "../utils/datetimeLocal";

export default function TeacherDetailsPage() {
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

    const [isBooking, setIsBooking] = useState(false);

    const handleBooking = async () => {
        if (selectedSlots.length === 0) {
            alert("Kérlek válassz ki legalább egy időpontot!");
            return;
        }

        if (isBooking) return;

        setIsBooking(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Nincs bejelentkezés. Kérlek jelentkezz be újra.");
                return;
            }

            for (const slot of selectedSlots) {
                await bookAppointment(token, id, slot.raw);
            }

            setBookingSuccess(true);

            const refreshedSlots = await fetchAvailableSlots(token, id);
            setAvailableSlots(refreshedSlots);

            setSelectedSlots([]);
        } catch (err) {
            console.error("Booking error:", err);
            const msg =
                err.response?.data?.message ||
                "Hiba történt a foglalás során. Próbáld újra.";
            alert(msg);
        } finally {
            setIsBooking(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== "student") return;

        const token = localStorage.getItem("token");
        setLoadingSlots(true);

        fetchAvailableSlots(token, id)
            .then((data) => setAvailableSlots(data))
            .catch((err) => {
                console.error(err);
                setSlotError(
                    "Nem sikerült betölteni a foglalható időpontokat.",
                );
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

    return (
        <div className="teacher-details">
            <Link to="/teachers" style={{ color: "rgba(180,165,168,0.95)" }}>
                ← Vissza a tanárokhoz
            </Link>

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
                            (prev) =>
                                new Date(
                                    new Date(prev).setDate(prev.getDate() + 7),
                                ),
                        )
                    }
                >
                    ›
                </button>
            </div>

            {loadingSlots && <p>Időpontok betöltése...</p>}
            {slotError && <p>{slotError}</p>}

            <div className="week-grid">
                {days.map((day, index) => (
                    <div key={index} className="day-col">
                        <div className="day-head">
                            <div className="dow">
                                {day.toLocaleDateString("hu-HU", {
                                    weekday: "short",
                                })}
                            </div>
                            <div className="date">
                                {day.toLocaleDateString("hu-HU")}
                            </div>
                        </div>

                        {availableSlots
                            .filter(
                                (slot) =>
                                    parseSqlDateTimeLocal(
                                        slot.start,
                                    ).toDateString() === day.toDateString(),
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
                                        className={
                                            "slot-btn" +
                                            (isSelected ? " is-selected" : "")
                                        }
                                        onClick={() => {
                                            setSelectedSlots((prev) => {
                                                if (isSelected)
                                                    return prev.filter(
                                                        (s) =>
                                                            s.raw !==
                                                            slot.start,
                                                    );
                                                return [
                                                    ...prev,
                                                    {
                                                        date: parseSqlDateTimeLocal(
                                                            slot.start,
                                                        ),
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

                        {availableSlots.filter(
                            (slot) =>
                                parseSqlDateTimeLocal(
                                    slot.start,
                                ).toDateString() === day.toDateString(),
                        ).length === 0 &&
                            !loadingSlots && (
                                <div className="no-slot">
                                    Nincs elérhető időpont
                                </div>
                            )}
                    </div>
                ))}
            </div>

            <div className="card selected-panel">
                <h3 className="selected-title">
                    <span style={{ color: "#c50337" }}>📅</span> Kiválasztott
                    időpontok
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
                                                prev.filter(
                                                    (s) => s.raw !== slot.raw,
                                                ),
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
                            Összesen:{" "}
                            <strong>{selectedSlots.length} óra</strong>
                        </div>

                        <button
                            className="selected-cta"
                            onClick={handleBooking}
                            disabled={isBooking}
                        >
                            {isBooking
                                ? "Foglalás..."
                                : "✓ Foglalás megerősítése"}
                        </button>
                    </>
                )}
            </div>

            {bookingSuccess && (
                <div className="card" style={{ padding: 18 }}>
                    <strong>Sikeres foglalás!</strong>
                    <div
                        style={{
                            marginTop: 6,
                            color: "rgba(180,165,168,0.95)",
                        }}
                    >
                        Az időpont(ok) lefoglalásra kerültek.
                    </div>
                </div>
            )}
        </div>
    );
}
