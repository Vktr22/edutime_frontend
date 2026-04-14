// src/components/Navigation.jsx
import React from "react";
import "../css/Navigation.css";
import { NavLink, useNavigate } from "react-router-dom";
//useauth => innen kapjik a user bejelentkezett felhaszn objektumot,
        // + a logout()-ot  amiket elobb megirtam
import { Home, Users, Calendar, Clock, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";  

export default function Navigation() {
    //user ->a bejelentkezett user lekerese(mindig a baclend altal validalt felh)
    //logout - backend /logout vegpontjat
  const { user, logout } = useAuth();
  //logout utan atiranyit
  const navigate = useNavigate();
  
  if(!user) returnnull;
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  //************************************************************
  //menuelemek role-ok zerint:
  const studentLinks = [
    { to: "/home", label: "Kezdőlap", icon: Home },
    { to: "/teachers", label: "Tanárok", icon: Users },
    { to: "/my-appointments", label: "Időpontjaim", icon: Calendar },
  ];
  const teacherLinks = [
    { to: "/home", label: "Kezdőlap", icon: Home },
    { to: "/teacher/appointments", label: "Foglalások", icon: Calendar },
    { to: "/teacher/availability", label: "Elérhetőségek", icon: Clock },
  ];

  const links = user.role === "teacher" ? teacherLinks : studentLinks;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">EduTime</div>

        <div className="navbar-menu">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                "navbar-link" + (isActive ? " active" : "")
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          <button className="navbar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Kilépés
          </button>
        </div>
      </div>
    </nav>
  );

}