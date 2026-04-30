import React from "react";
import "../css/Navigation.css";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Users, Calendar, Clock, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navigation({ variant = "side" }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;
    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };
    const studentLinks = [
        { to: "/home", label: "Kezdőlap", icon: Home },
        { to: "/teachers", label: "Tanárok", icon: Users },
        { to: "/my-appointments", label: "Időpontjaim", icon: Calendar },
    ];
    const teacherLinks = [
        { to: "/home", label: "Kezdőlap", icon: Home },
        { to: "/teacher/appointments", label: "Foglalások", icon: Calendar },
        { to: "/teacher/availability", label: "Munkaórák", icon: Clock },
    ];

    const links = user.role === "teacher" ? teacherLinks : studentLinks;

    if (variant === "top") {
        return (
            <nav className="nav nav--top">
                <div className="nav__row">
                    <div className="nav__brand">EduTime</div>

                    <div className="nav__links">
                        {links.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    "nav__link" + (isActive ? " is-active" : "")
                                }
                            >
                                <Icon size={18} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </div>

                    <button className="nav__logout" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Kijelentkezés</span>
                    </button>
                </div>
            </nav>
        );
    }

    return (
        <nav className="nav nav--side">
            <div className="nav__brand nav__brand--side">EduTime</div>

            <div className="nav__links nav__links--side">
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            "nav__link nav__link--side" +
                            (isActive ? " is-active" : "")
                        }
                    >
                        <Icon size={18} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </div>

            <div className="nav__spacer" />

            <div className="nav__user">
                <div className="nav__userRole">{user.role}</div>
                <div className="nav__userName">{user.name}</div>
            </div>

            <button
                className="nav__logout nav__logout--side"
                onClick={handleLogout}
            >
                <LogOut size={18} />
                <span>Kijelentkezés</span>
            </button>
        </nav>
    );
}
