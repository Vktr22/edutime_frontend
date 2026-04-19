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
import {
  getSeenTimestamp,
  setSeenTimestamp,
} from "../services/notificationSeen";

export default function HomePage() {
  // Az AuthContextből jön a belépett felhasználó és a betöltési állapot.
  const { user, loading } = useAuth();

  // Programozott navigáció értesítés kattintás után.
  const navigate = useNavigate();

  // Melyik értesítési dobozt mutassuk (diákos / tanáros / nincs).
  const [notification, setNotification] = useState(null);

  // A legfrissebb törlés időbélyege (ISO), ezzel döntjük el, van-e új, még nem látott értesítés.
  const [latestCancelMarker, setLatestCancelMarker] = useState(null); // ISO string

  // Home oldali értesítés: csak akkor jelez, ha a felhasználó szerepköréhez tartozó törlés még nincs "láttam" állapotban.
  useEffect(() => {
    const token = localStorage.getItem("token");

    // Token és user nélkül nem tudunk lekérdezni.
    if (!token || !user) return;

    // Előzőleg eltárolt "láttam" időbélyeg.
    const seen = getSeenTimestamp(user.role); // ISO vagy null

    // DIÁK ág: a tanár által törölt időpontokat vizsgáljuk.
    if (user.role === "student") {
      fetchStudentAppointments(token)
        .then((data) => {
          const cancelled = data.filter(
            (appt) => appt.status === "cancelled_by_teacher",
          );

          if (cancelled.length === 0) {
            // Nincs törölt időpont, ezért értesítés sem kell.
            setNotification(null);
            setLatestCancelMarker(null);
            return;
          }

          // Marker: a legfrissebb törlés ideje (updated_at), fallbackként lesson_time.
          const latest = cancelled
            .map((a) => a.updated_at || a.lesson_time)
            .sort()
            .at(-1);

          setLatestCancelMarker(latest);

          // Csak akkor mutatunk értesítést, ha a legfrissebb törlés újabb a látottnál.
          if (!seen || (latest && latest > seen)) {
            setNotification("student_cancelled");
          } else {
            setNotification(null);
          }
        })
        .catch(() => {
          // Hiba esetén ne omoljon össze a Home oldal.
        });
    }

    // TANÁR ág: a diák által törölt időpontokat vizsgáljuk.
    if (user.role === "teacher") {
      fetchTeacherAppointments(token)
        .then((data) => {
          const cancelled = data.filter(
            (appt) => appt.status === "cancelled_by_student",
          );

          if (cancelled.length === 0) {
            // Nincs törölt időpont, ezért értesítés sem kell.
            setNotification(null);
            setLatestCancelMarker(null);
            return;
          }

          // Marker: a legfrissebb törlés ideje (updated_at), fallbackként lesson_time.
          const latest = cancelled
            .map((a) => a.updated_at || a.lesson_time)
            .sort()
            .at(-1);

          setLatestCancelMarker(latest);

          // Csak akkor mutatunk értesítést, ha a legfrissebb törlés újabb a látottnál.
          if (!seen || (latest && latest > seen)) {
            setNotification("teacher_cancelled");
          } else {
            setNotification(null);
          }
        })
        .catch(() => {
          // Hiba esetén ne omoljon össze a Home oldal.
        });
    }
  }, [user]);

  // Értesítésre kattintás: mentjük, hogy a felhasználó látta, majd a megfelelő listára irányítunk.
  function handleOpenNotification() {
    if (!user) return;

    // Kattintás = "láttam" állapot mentése.
    if (latestCancelMarker) {
      setSeenTimestamp(user.role, latestCancelMarker);
    }
    setNotification(null);

    // Szerepkör alapján másik oldalra navigálunk.
    if (user.role === "student") navigate("/my-appointments");
    else navigate("/teacher/appointments");
  }

  if (loading) return <p>Loading user...</p>;

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
          <button onClick={handleOpenNotification}>
            Egy általad foglalt időpontot töröltek
          </button>
        </div>
      )}

      {/* TANÁR értesítés */}
      {notification === "teacher_cancelled" && (
        <div className="notification-box">
          <button onClick={handleOpenNotification}>
            Egy foglalt időpontot töröltek
          </button>
        </div>
      )}
    </div>
  );
}
