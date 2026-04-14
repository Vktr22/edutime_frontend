import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading user...</p>;

  if (!user) {
    return <p>Not logged in</p>;
  }

  return (
    <div>
      <h2>Saját profil</h2>
      <p>Jó napot, {user.name}</p>
      <p>Jogosultság: {user.role}</p>
    </div>
  );
}