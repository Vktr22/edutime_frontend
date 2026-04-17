import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchStudentAppointments,
  fetchTeacherAppointments,
} from "../services/appointments";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [notification, setNotification] = useState(null);

  //ertesites home oldalon a masik felnek akit erint az idopont torles
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    // DIÁK
    if (user.role === "student") {
      fetchStudentAppointments(token).then((data) => {
        const hasCancelledByTeacher = data.some(
          (appt) => appt.status === "cancelled_by_teacher",
        );

        if (hasCancelledByTeacher) {
          setNotification("student_cancelled");
        }
      });
    }

    // TANÁR
    if (user.role === "teacher") {
      fetchTeacherAppointments(token).then((data) => {
        const hasCancelledByStudent = data.some(
          (appt) => appt.status === "cancelled_by_student",
        );

        if (hasCancelledByStudent) {
          setNotification("teacher_cancelled");
        }
      });
    }
  }, [user]);

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
          <Link to="/my-appointments">
            Egy általad foglalt időpontot töröltek
          </Link>
        </div>
      )}

      {/* TANÁR értesítés */}
      {notification === "teacher_cancelled" && (
        <div className="notification-box">
          <Link to="/teacher/appointments">Egy foglalt időpontot töröltek</Link>
        </div>
      )}
    </div>
  );
}
