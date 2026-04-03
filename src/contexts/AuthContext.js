import { createContext, useContext, useEffect, useState } from "react";
import { myAxios } from "../services/api";


//az AuthContext lesz az, ahonnan  a gyerek componensek (nav, homepage, loginpage, stb.) elerik a usert, login fuggvenyt, logout fuggvenyt
//ezert => letrehoznk egy uj contextet, ami olyan mint egy globalis obj, emit barhol tudsz haszn
export const AuthContext = createContext();


export function AuthProvider({ children }) {            //AuthProvider egy komponens, ami a teljes appot (vagy annak egy részét) körbecsomagolja, és a context értékét adja.
    //user az aktual bejelentkezett felh adatai vaaagy null, ha nincs bejelentk
  const [user, setUser] = useState(null);
  const [serverError, setServerError] = useState(null);
    //toltodik amig nem tudjuk, h vane user (app indulasakor true ugye)
  const [loading, setLoading] = useState(true);



  const getToken = () => localStorage.getItem("token"); //kiolva atoken ha van

  const setToken = (token) => {                         //elmenti v torl a token
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  };

  //felhaszn betolt
  //OLDALFRISSITES UTAN IS!!!! visszatolti a usert, ha van token!!!!
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


  //bejelentk
  
  const login = async ({ email, password }) => {
    setServerError(null);
    try {
      const { data } = await myAxios.post("/api/login", { email, password });
      //backend: {token,user}
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


  //kijelentk:
  const logout = async () => {
    try {
      
        //backenden session+token torlese---post /logout
      await myAxios.post("/logout");
      //frontenden uritjuk a user state-t
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  //ez csak 1x fut le bejelentkezeskor-> amikor az AuthProvider componens eloszor renderel
  useEffect(() => {
    loadUser();
  }, []);


  //csomagolas
  return (
    <AuthContext.Provider value={{ user, loading, serverError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
//helper hook --- useContext(AuthContext) helyett tudom hasznalni a useAuth() -ot
export function useAuth() {
  return useContext(AuthContext);
}