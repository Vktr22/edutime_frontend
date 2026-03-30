// src/components/Navigation.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
//useauth => innen kapjik a user bejelentkezett felhaszn objektumot,
        // + a logout()-ot  amiket elobb megirtam
import { useAuth } from "../contexts/AuthContext";  
import "../css/navigation.css";

export default function Navigation() {
    //user ->a bejelentkezett user lekerese(mindig a baclend altal validalt felh)
    //logout - backend /logout vegpontjat
  const { user, logout } = useAuth();
  //logout utan atiranyit
  const navigate = useNavigate();
    /*
    Mi történik?

    logout() → backend: POST /logout
    frontenden: setUser(null); → AuthContext törli a usert
    navigate("/login") → visszavisz a login oldalra

    Ez a SPA logout legegyszerűbb és legtisztább módja.
  */
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
//************************************************************
//menuelemek role-ok zerint:
  const studentNav = [
    { path: "/home", label: "Kezdőlap" },
    { path: "/teachers", label: "Tanárok" },
    { path: "/my-appointments", label: "Időpontjaim" },
  ];

  const teacherNav = [
    { path: "/home", label: "Kezdőlap" },
    { path: "/teacher/appointments", label: "Foglalások" },
  ];

  const guestNav = [{ path: "/home", label: "Kezdőlap" }];
//**************************************************************

//role alapjan kivalasztaas
// TERNARY OPERATOR lanc
/*ha a user role student->studentnav
  ha teacher->teachernav
  egyebkent meg->guestnav
  */
  const roleNav =
    user?.role === "student"
      ? studentNav
      : user?.role === "teacher"
      ? teacherNav
      : guestNav;
//******************************************

  /*
    roleNav = tomb  -itt most student/teacher/guest nav
    map ugye vegig iteral es minden elemhez general egy li-t minden nav elemnek
  */
  return (
    <header>
      <nav className="sidenav">
        <ul>
          <li><strong>EduTime</strong></li>
        </ul>

        <ul>
          {roleNav.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path}>{item.label}</NavLink>
            </li>
          ))}
        </ul>

        <ul>
          {user ? (
            <li>
              <span>{user.name}</span>
              <button className="account-btn" onClick={handleLogout}>
                Kijelentkezés
              </button>
            </li>
          ) : (
            <li>
              <NavLink to="/login">Bejelentkezés</NavLink>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}