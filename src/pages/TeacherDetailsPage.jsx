import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchTeacherById } from "../services/teachers";


export default function TeacherDetailsPage() {

    /*
        A useparams segitsegevel olvassuk ki az url-ben levo azont
        useauth a globalis aut allapotot adja
        lokalis usestate-ek a betoltott tanar adatait +hibakat ha van.
    */
    const { id } = useParams();
    const { user, loading } = useAuth();

    const [teacher, setTeacher] = useState(null);
    const [error, setError] = useState("");

    
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
            
            {error && <p>{error}</p>}
            {teacher && (
                <div>
                    <p>Tanár azonosító kód: {id}</p>
                    <p>Név: {teacher.name}</p>
                    <p>Email: {teacher.email}</p>
                </div>
            )}
        </div>
    );
}