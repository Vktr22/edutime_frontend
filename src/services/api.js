import axios from "axios";

export const myAxios = axios.create({
    /*baseURL=
    ha a frontend ezt hivja:
        myAxios.get("/api/profile")
    akk valojaban ezt a http kerest kuldi:
        GET http://localhost:8000/api/profile
    */
  baseURL: "http://localhost:8000", // <-- Laravel backend URL
  //ez meg, h a bongeszo MINDEN keresnel kuldje el a cookie-kat is erre a backendre
    //azert fontos mert sanctum cookie-s aut-ot haszn
  //withCredentials: true,            // <-- Küldje a cookie-kat (Sanctum)
});

export default myAxios;

/*
    a frontend úgy „látja” a backendet, hogy:

    * axios (myAxios) minden kérést a http://localhost:8000‑ra küld,
    * a Laravel oldalon ott vannak az API route‑ok (routes/api.php),
    * és Sanctum + auth middleware gondoskodik arról, hogy a kéréshez
        tartozó user ($request->user()) elérhető legyen – AuthContext
        pedig frontend oldalon segít ezt kezelni.
*/