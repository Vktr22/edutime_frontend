import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function TeacherAvailabilityPage() {
  const { user, loading } = useAuth();

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