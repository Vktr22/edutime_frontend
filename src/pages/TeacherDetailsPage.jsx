import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchTeacherById } from "../services/teachers";
import { bookAppointment } from "../services/appointments";


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

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setFormMessage("");

        // client oldali ell
        if (!lessonTime.trim()) {
            setFormMessage("Kérlek adj meg egy időpontot.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            /*
                miert nem a vegen van kezelve a tobbi guard clause-nel????
                --->A token megléte az adott művelethez (foglaláshoz) szükséges,
                nem a teljes oldal rendereléséhez.
                Ezért handler-szintű guard clause-ként kezeljük.
            */
            if (!token) {
                setFormMessage("Nincs bejelentkezés. Kérlek jelentkezz be újra.");
                return;
            }
            await bookAppointment(token, id, lessonTime);

            setFormMessage("Időpont sikeresen lefoglalva!");
            setLessonTime("");

            navigate("/my-appointments");

        } catch (err) {
            console.error("Booking error:", err);

            // backend can return 409 conflict or 422 validation errors
            //409-- mar foglalt idopont
            //422-- multbeli idopontot akart foglalni, vaagy rossz formatum
            const msg =
            err.response?.data?.message ||
            "Hiba történt a foglalás során. Próbáld újra.";
            setFormMessage(msg);
        }
    };

    
    useEffect(() => {
        // csak akk kerunk le adatot ha van user stud
        if (!user || user.role !== "student") return;

        const token = localStorage.getItem("token");

        fetchTeacherById(token, id)
        .then((data) => setTeacher(data))
        .catch((err) => {
            console.error("Error fetching teacher:", err);
            setError("Nem sikerült betölteni a tanár adatait.");
        });
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

            <h3>Időpont foglalása</h3>
            <form onSubmit={handleBookingSubmit}>
            <label htmlFor="lesson_time">Időpont (YYYY-MM-DD HH:MM:SS)</label>
            <input
                id="lesson_time"
                type="text"
                value={lessonTime}
                onChange={(e) => setLessonTime(e.target.value)}
                placeholder="2026-04-10 10:00:00"
            />
            <button type="submit">Foglalás</button>
            </form>

            {formMessage && <p>{formMessage}</p>}

        </div>
    );
}