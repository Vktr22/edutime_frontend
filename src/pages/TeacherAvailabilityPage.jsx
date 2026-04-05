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

    return (
        <div>
        <h2>Tanári elérhetőségek (munkaidősávok)</h2>
        <p>Oldal betöltve. A funkciók következnek…</p>
        </div>
    );
}