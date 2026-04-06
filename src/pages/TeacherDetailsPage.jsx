import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchTeacherById } from "../services/teachers";
import { bookAppointment } from "../services/appointments";
import { fetchAvailableSlots } from "../services/availability";


export default function TeacherDetailsPage() {

    /*
        A useparams segitsegevel olvassuk ki az url-ben levo azont
        useauth a globalis aut allapotot adja
        lokalis usestate-ek a betoltott tanar adatait +hibakat ha van.
    */
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, loading } = useAuth();
    const [teacher, setTeacher] = useState(null);
    const [error, setError] = useState("");
    //lessontime tarolja amit a user ir a mezobe
    const [lessonTime, setLessonTime] = useState("");
    //formmessage majd success/error uzi lesz
    const [formMessage, setFormMessage] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotError, setSlotError] = useState("");

    const handleBooking = async (slotStart) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
            alert("Nincs bejelentkezés.");
            return;
            }

            await bookAppointment(token, id, slotStart);

            alert("Időpont sikeresen lefoglalva!");

            // újratöltjük a foglalható időpontokat
            const refreshed = await fetchAvailableSlots(token, id);
            setAvailableSlots(refreshed);

        } catch (err) {
            console.error(err);
            alert("Nem sikerült lefoglalni az időpontot.");
        }
    };

    //foglalhato idopontok betoltese
    useEffect(() => {
        if (!user || user.role !== "student") return;

        const token = localStorage.getItem("token");

        setLoadingSlots(true);
        fetchTeacherById(token, id)
            .then((data) => setAvailableSlots(data))
            .catch((err) => {
                console.error(err);
                setSlotError("Nem sikerült betölteni a foglalható időpontokat.");
            }).finally(() => setLoadingSlots(false));
    }, [user, id]);

    //korai kilepesi feltetelek = guard clause-ok
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

    //innentol(a return-ban) mar csak jo eset!!
    return (
        <div>
            
            <Link to="/teachers">← Vissza a tanárok oldalra</Link>
            <h2>Kiválasztott tanár adatai</h2>
            <div>
                <p>Tanár azonosító kód: {id}</p>
                <p>Név: {teacher.name}</p>
               <p>Email: {teacher.email}</p>
            </div>

            <h3>Foglalható időpontok</h3>

            {loadingSlots && <p>Időpontok betöltése...</p>}
            {slotError && <p>{slotError}</p>}

            {availableSlots.length === 0 && !loadingSlots && (
                <p>Nincs elérhető időpont.</p>
            )}

            <div className="slots-container">
                {availableSlots.map((slot) => (
                    <button
                    key={slot.start}
                    className="slot-button"
                    onClick={() => handleBooking(slot.start)}
                    >
                    {slot.start}
                    </button>
                ))}
            </div>

        </div>
    );
}