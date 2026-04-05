import React, { useEffect, useState } from "react"; 
import { useAuth } from "../contexts/AuthContext"; 
import {fetchAvailability,createAvailability, deleteAvailability} from "../services/availability"; 

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
        fetchAvailability(token)
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

        fetchAvailability(token)
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

    //<p>Oldal betöltve. A funkciók következnek…</p>
    return (
        <div>
            <h2>Tanári elérhetőségek (munkaidősávok)</h2>

            <h3>Új időszak hozzáadása</h3>
            <form onSubmit={handleSubmit}>
                <label>Hét napja (1–7): </label>
                <input
                    type="number"
                    min="1"
                    max="7"
                    value={weekday}
                    onChange={(e) => setWeekday(e.target.value)}
                />
                <label>Munkaidő kezdete:</label>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
                <label>Munkaidő vége:</label>
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
                <button type="submit">Hozzáadás</button>
            </form>
            {formMsg && <p>{formMsg}</p>}


            <h3>Meglévő időszakok</h3>
            {items.length === 0 ? (
            <p>Még nincsenek megadott munkaórák.</p>
                ) : (
                <table>
                    <thead>
                    <tr>
                        <th>Nap</th>
                        <th>Időszak</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((a) => (
                        <tr key={a.id}>
                        <td>{a.weekday}</td>
                        <td>{a.start_time} – {a.end_time}</td>
                        <td><button onClick={() => handleDelete(a.id)}>Törlés</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}