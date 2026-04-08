import React, { useEffect, useState } from "react"; 
import { useAuth } from "../contexts/AuthContext"; 
import {fetchAvailableSlots,createAvailability, deleteAvailability} from "../services/availability"; 

export default function TeacherAvailabilityPage() {

    //statek
    const { user, loading } = useAuth();
    //allapotok elokeszitese, h legyen hova tolteni az adatot----items, error
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");
    //a form-hoz szukseges statek,-- start_time + end_time + weekday
    const [weekday, setWeekday] = useState("1");
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("10:00");
    const [formMsg, setFormMsg] = useState("");

    //token
    const token = localStorage.getItem("token");

    // ---- WEEKDAY MAPPING ----
    const days = {
        1: "Hétfő",
        2: "Kedd",
        3: "Szerda",
        4: "Csütörtök",
        5: "Péntek",
        6: "Szombat",
        7: "Vasárnap",
    };

    // ---- GROUPING DATA BY DAY ----
    const grouped = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
    };

    items.forEach((a) => {
        grouped[a.weekday].push(a);
    });

    //funkc: betolts
    const loadData = () => {
        fetchAvailableSlots(token)
            .then((data) => setItems(data))
            .catch((err) => {
            console.error("fetchAvailability error:", err);
            setError("Nem sikerült betölteni az elérhetőségeket.");
            });
    };

    //useeffect
    //a componens betoltesekor lekeri a bejelentkezett tanar sajat idopont kezelo feluletet
    useEffect(() => {
        if (!user || user.role !== "teacher") return;

        const token = localStorage.getItem("token");

        fetchAvailableSlots(token)
            .then((data) => setItems(data))
            .catch((err) => {
            console.error("fetchAvailability error:", err);
            setError("Nem sikerült betölteni az időpont kezelőt.");
            });
    }, [user]);

    //inne jon lefele a render, form submit, delete handler, stb.
    //aztan az oldal strukt

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormMsg("");

        try {
            await createAvailability(token, {
            weekday,
            start_time: startTime,
            end_time: endTime,
            });
            setFormMsg("Mentve ✅");
            loadData(); // újratöltjük a listát
        } catch (err) {
            console.error("createAvailability error:", err);
            setFormMsg("Hiba történt a mentés során.");
        }

    };

    const handleDelete = async (id) => {
        try {
            await deleteAvailability(token, id);
            loadData();
        } catch (err) {
            console.error("deleteAvailability error:", err);
            alert("Nem sikerült törölni.");
        }
    };

    if (loading) return <p>Betöltés...</p>;
    if (!user) return <p>Kérlek jelentkezz be.</p>;
    if (user.role !== "teacher")
        return <p>Ez az oldal csak tanároknak érhető el.</p>;

    return (
        <div className="availability-page">

            <h2 className="availability-title">Tanári elérhetőségeim (munkaidősávok)</h2>

            {/* Új időszak hozzáadása */}
            <div className="availability-form-section">
            <h3 className="availability-subtitle">Új időszak hozzáadása</h3>

            <form className="availability-form" onSubmit={handleSubmit}>
                <div className="form-row">
                <label htmlFor="weekday">Hét napja (1–7):</label>
                <input
                    id="weekday"
                    type="number"
                    min="1"
                    max="7"
                    value={weekday}
                    onChange={(e) => setWeekday(e.target.value)}
                    className="form-input"
                />
                </div>

                <div className="form-row">
                <label htmlFor="start_time">Munkaidő kezdete:</label>
                <input
                    id="start_time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="form-input"
                />
                </div>

                <div className="form-row">
                <label htmlFor="end_time">Munkaidő vége:</label>
                <input
                    id="end_time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="form-input"
                />
                </div>

                <button type="submit" className="btn-submit">Hozzáadás</button>
            </form>

            {formMsg && <p className="form-message">{formMsg}</p>}
            </div>

            {/* Meglévő idősávok */}
            <div className="availability-table-section">
            <h3 className="availability-subtitle">Meglévő időszakok (heti bontás)</h3>

            <table className="availability-table">
                <thead>
                <tr>
                    <th>Nap</th>
                    <th>Időszakok</th>
                </tr>
                </thead>

                <tbody>
                {Object.keys(days).map((day) => (
                    <tr key={day}>
                    <td className="weekday-cell">{days[day]}</td>

                    <td className="slots-cell">
                        {grouped[day].length === 0 ? (
                        <span className="empty-day">— nincs megadva —</span>
                        ) : (
                        grouped[day].map((slot) => (
                            <div key={slot.id} className="slot-row">
                            <span className="slot-time">
                                {slot.start_time} – {slot.end_time}
                            </span>

                            <button
                                className="btn-delete"
                                onClick={() => handleDelete(slot.id)}
                            >
                                Törlés
                            </button>
                            </div>
                        ))
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>

        </div>
    );
}