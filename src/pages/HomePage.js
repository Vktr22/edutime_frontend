import React, { useEffect, useState } from "react";
import "../css/HomePage.css";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchStudentAppointments,
  fetchTeacherAppointments,
} from "../services/appointments";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, Clock } from "lucide-react";
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

  // Egyszerű jelző: tanár vagy diák nézetet kell-e kirakni.
  const isTeacher = user.role === "teacher";

  // Bal oldali gyorsnavigációs kártya tartalma szerepkör szerint.
  const leftCard = isTeacher
    ? {
        title: "Foglalások",
        sub: "Diákok időpontjai",
        icon: Calendar,
        to: "/teacher/appointments",
      }
    : {
        title: "Tanárok böngészése",
        sub: "Találd meg a megfelelő tanárt",
        icon: Users,
        to: "/teachers",
      };

  // Jobb oldali gyorsnavigációs kártya tartalma szerepkör szerint.
  const rightCard = isTeacher
    ? {
        title: "Elérhetőségek",
        sub: "Órák beállítása",
        icon: Clock,
        to: "/teacher/availability",
      }
    : {
        title: "Időpontjaim",
        sub: "Foglalásaid megtekintése",
        icon: Calendar,
        to: "/my-appointments",
      };

  // A kiválasztott kártyák ikonjai külön komponensként renderelhetők.
  const LeftIcon = leftCard.icon;
  const RightIcon = rightCard.icon;

  return (
    <div>
      {/* Egyszerű értesítési blokk, ha van új törléshez kapcsolódó figyelmeztetés. */}
      {notification && (
        <div className="card" style={{ padding: 18, marginBottom: 18 }}>
          {notification}
        </div>
      )}

      {/* Két kattintható kártya: gyors elérés a legfontosabb oldalakra. */}
      <div className="home-grid">
        <div className="home-card" onClick={() => navigate(leftCard.to)}>
          <div className="home-card__icon">
            <LeftIcon size={22} />
          </div>
          <div>
            <h3 className="home-card__title">{leftCard.title}</h3>
            <div className="home-card__sub">{leftCard.sub}</div>
          </div>
        </div>

        <div className="home-card" onClick={() => navigate(rightCard.to)}>
          <div className="home-card__icon">
            <RightIcon size={22} />
          </div>
          <div>
            <h3 className="home-card__title">{rightCard.title}</h3>
            <div className="home-card__sub">{rightCard.sub}</div>
          </div>
        </div>
      </div>

      {/* Profilkártya az alap felhasználói adatokkal. */}
      <div className="card home-profile">
        <h2>Saját profil</h2>
        <div className="row">
          <strong>Név:</strong> {user.name}
        </div>
        <div className="row">
          <strong>Jogosultság:</strong> {user.role}
        </div>
      </div>
    </div>
  );
}
