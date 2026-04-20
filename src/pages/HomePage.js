import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchStudentAppointments,
  fetchTeacherAppointments,
} from "../services/appointments";
import { useNavigate } from "react-router-dom";
import {
  getSeenTimestamp,
  setSeenTimestamp,
} from "../services/notificationSeen";
import { getSeenCancelledIds } from "../services/cancellationSeen";

export default function HomePage() {
  // Az AuthContextből jön a belépett felhasználó és a betöltési állapot.
  const { user, loading } = useAuth();

  // Programozott navigáció értesítés kattintás után.
  const navigate = useNavigate();

  // Melyik értesítési dobozt mutassuk (diákos / tanáros / nincs).
  const [notification, setNotification] = useState(null);

  // Home oldali értesítés: csak akkor jelez, ha a felhasználó szerepköréhez tartozó törlés még nincs "láttam" állapotban.
  useEffect(() => {
    // Az API hívásokhoz szükséges token.
    const token = localStorage.getItem("token");

    // Token és user nélkül nem tudunk lekérdezni.
    if (!token || !user) return;

    // A már "látott" törlések ID-i, hogy csak az újakat jelezzük értesítésként.
    const seen = new Set(getSeenCancelledIds(user.role));

    // DIÁK ág: a tanár által törölt időpontokat vizsgáljuk.
    if (user.role === "student") {
      fetchStudentAppointments(token)
        .then((data) => {
          // Van-e legalább egy olyan törölt időpont, amit még nem jelöltünk látottnak.
          const unseenExists = data.some(
            (a) =>
              a.status === "cancelled_by_teacher" && !seen.has(Number(a.id)),
          );
          setNotification(unseenExists ? "student_cancelled" : null);
        })
        .catch(() => setNotification(null));
    }

    // TANÁR ág: a diák által törölt időpontokat vizsgáljuk.
    if (user.role === "teacher") {
      fetchTeacherAppointments(token)
        .then((data) => {
          // Van-e legalább egy olyan törölt időpont, amit még nem jelöltünk látottnak.
          const unseenExists = data.some(
            (a) =>
              a.status === "cancelled_by_student" && !seen.has(Number(a.id)),
          );
          setNotification(unseenExists ? "teacher_cancelled" : null);
        })
        .catch(() => setNotification(null));
    }
  }, [user]);

  // Amíg az auth állapot tölt, addig ne rendereljünk félkész profilt.
  if (loading) return <p>Loading user...</p>;

  // Be nem jelentkezett felhasználó esetén egyszerű fallback üzenet.
  if (!user) {
    return <p>Not logged in</p>;
  }

  return (
    <div>
      <h2>Saját profil</h2>
      <p>Jó napot, {user.name}</p>
      <p>Jogosultság: {user.role}</p>

      {/* DIÁK értesítés */}
      {notification === "student_cancelled" && (
        <div className="notification-box">
          {/* Kattintás után az időpontok oldalára lépünk, ahol a részletek látszanak. */}
          <button onClick={() => navigate("/my-appointments")}>
            Egy általad foglalt időpontot töröltek
          </button>
        </div>
      )}

      {/* TANÁR értesítés */}
      {notification === "teacher_cancelled" && (
        <div className="notification-box">
          {/* Kattintás után a tanári időpontok oldalára lépünk. */}
          <button onClick={() => navigate("/teacher/appointments")}>
            Egy foglalt időpontot töröltek
          </button>
        </div>
      )}
    </div>
  );
}
