import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function TeacherAvailabilityPage() {
    const { user, loading } = useAuth();
    //allapotok elokeszitese, h legyen hova tolteni az adatot----items, error
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");
    //a form-hoz szukseges statek,-- start_time + end_time + weekday
    const [weekday, setWeekday] = useState("1");
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("10:00");
    const [formMsg, setFormMsg] = useState("");

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

    if (loading) return <p>Betöltés...</p>;
    if (!user) return <p>Kérlek jelentkezz be.</p>;
    if (user.role !== "teacher")
        return <p>Ez az oldal csak tanároknak érhető el.</p>;

    //<p>Oldal betöltve. A funkciók következnek…</p>
    return (
        <div>
            <h2>Tanári elérhetőségek (munkaidősávok)</h2>


            {items.length === 0 ? (
            <p>Még nincs megadott elérhetőség.</p>
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
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}