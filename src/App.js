// src/App.js
import React from "react";
//router importok--->navigacioert kell
import {
  createBrowserRouter,  //ezzel hozzuk letre a router-t js objektumkent, ahol meghat az utvonalak listajat
  RouterProvider, //ezzel mukodnek a rout linkek
  Navigate, //atiranyit
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";  //ez a korbecsomagolo ->user mindenhol elerheto lesz
import Layout from "./components/Layout"; //oldalkeret (benne nav+ ahova az oldalak kerulnek)
import LoginPage from "./pages/LoginPage";   //siman csak a login
import HomePage from "./pages/HomePage";  //home
import NoPage from "./pages/NoPage";  //404

//utvonalak
//FONTOOSSS => a router egy sima JS objektum, NEM JSX KOMPONENS!!!!
const router = createBrowserRouter([
  {
    path: "/login",   //path-> melyik url-t figyelje
    element: <LoginPage />, //element-> melyik react component legyen renderelve
  },
  //a fentire pl:
  /*
    ha a searchbar: http://localhost:3000/login
    akk a react:
      -megnyitja a <LoginPage />-t
      - ennyi -> itt nincs layout, nincs nav, semmi mas
  */

  {
    path: "/",
    //!!!!a layout NEM OLDAL, HANEM EGY KERET:
      //nav + a tobbi oldal <Outlet />-be kerul
        //(ez olyan mint a laravel layouts/app.blade.php)
    element: <Layout />,    
    //children => ezek azok az oldalak amik a <layout> outlet-jebe kerulnek
    children: [
      //index trua = ha /-rol jon be valaki+ nincs megadva utvonal, EZT toltse be
        //pl: ha vki siman ezt irja be: http://localhost:3000/ akk atiranyitjuk a home page-re
      { index: true, element: <Navigate to="/home" replace /> },
      //  /home
      { path: "home", element: <HomePage /> },
      //____{ path: "teachers", element: <TeachersPage /> },
    ],
  },
  //a nopage path FONTOSSS h mindig utso legyen, igy minden nem letezo ut ide esik
  {
    path: "*",
    element: <NoPage />,
  },
]);

//ez a resz dont arrol, h ven e user, ki lathatja az oldalt, mukodik e a router
function App() {
  return (
    //AuthProvider => csrf cookie be + betolti az akt usert + ad user-login-load,stb. ---y ez minden szamara kb elerheto lesz
    //routerprovider Olyasmi, mint Laravel Routing, csak itt frontenden.
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;