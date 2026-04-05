import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function TeacherAvailabilityPage() {
    const { user, loading } = useAuth();
    //allapotok elokeszitese, h legyen hova tolteni az adatot----items, error
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");

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