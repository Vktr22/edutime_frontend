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
    const { user, loading } = useAuth();

    const navigate = useNavigate();

    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token || !user) return;

        const seen = new Set(getSeenCancelledIds(user.role));

        if (user.role === "student") {
            fetchStudentAppointments(token)
                .then((data) => {
                    const unseenExists = data.some(
                        (a) =>
                            a.status === "cancelled_by_teacher" &&
                            !seen.has(Number(a.id)),
                    );
                    setNotification(unseenExists ? "student_cancelled" : null);
                })
                .catch(() => setNotification(null));
        }

        if (user.role === "teacher") {
            fetchTeacherAppointments(token)
                .then((data) => {
                    const unseenExists = data.some(
                        (a) =>
                            a.status === "cancelled_by_student" &&
                            !seen.has(Number(a.id)),
                    );
                    setNotification(unseenExists ? "teacher_cancelled" : null);
                })
                .catch(() => setNotification(null));
        }
    }, [user]);

    if (loading) return <p>Loading user...</p>;

    if (!user) {
        return <p>Not logged in</p>;
    }

    const isTeacher = user.role === "teacher";

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

    const LeftIcon = leftCard.icon;
    const RightIcon = rightCard.icon;

    const notificationText = isTeacher
        ? "Egy diák lemondta az egyik foglalt időpontot."
        : "Egy tanár lemondta az egyik foglalt időpontot.";

    return (
        <div>
            {notification && (
                <div
                    className="card home-notice"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                        navigate(
                            isTeacher
                                ? "/teacher/appointments"
                                : "/my-appointments",
                        )
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            navigate(
                                isTeacher
                                    ? "/teacher/appointments"
                                    : "/my-appointments",
                            );
                        }
                    }}
                    style={{ cursor: "pointer" }}
                >
                    <strong>{notificationText}</strong>{" "}
                    <span className="home-notice__hint">
                        Kattints ide a részletek megtekintéséhez.
                    </span>
                </div>
            )}

            <div className="home-grid">
                <div
                    className="home-card"
                    onClick={() => navigate(leftCard.to)}
                >
                    <div className="home-card__icon">
                        <LeftIcon size={22} />
                    </div>
                    <div>
                        <h3 className="home-card__title">{leftCard.title}</h3>
                        <div className="home-card__sub">{leftCard.sub}</div>
                    </div>
                </div>

                <div
                    className="home-card"
                    onClick={() => navigate(rightCard.to)}
                >
                    <div className="home-card__icon">
                        <RightIcon size={22} />
                    </div>
                    <div>
                        <h3 className="home-card__title">{rightCard.title}</h3>
                        <div className="home-card__sub">{rightCard.sub}</div>
                    </div>
                </div>
            </div>

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
