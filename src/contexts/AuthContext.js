import { createContext, useContext, useEffect, useState } from "react";
import { myAxios } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [serverError, setServerError] = useState(null);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem("token");

    const setToken = (token) => {
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
    };

    const loadUser = async () => {
        const token = getToken();

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data } = await myAxios.get("/api/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(data);
        } catch (err) {
            console.error("loadUser error:", err);
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async ({ email, password }) => {
        setServerError(null);
        try {
            const { data } = await myAxios.post("/api/login", {
                email,
                password,
            });
            setToken(data.token);
            setUser(data.user);
            return data.user;
        } catch (error) {
            console.error("Login error:", error);
            if (error.response?.status === 422) {
                setServerError("Hibás email vagy jelszó.");
            } else {
                setServerError("Váratlan hiba történt bejelentkezéskor.");
            }
            throw error;
        }
    };

    const logout = async () => {
        const token = getToken();

        try {
            if (token) {
                await myAxios.post(
                    "/api/logout",
                    {},
                    { headers: { Authorization: `Bearer ${token}` } },
                );
            }
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setToken(null);
            setUser(null);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, loading, serverError, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}
export function useAuth() {
    return useContext(AuthContext);
}
