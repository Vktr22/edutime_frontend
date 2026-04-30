import React from "react";
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import NoPage from "./pages/NoPage";
import TeachersPage from "./pages/TeachersPage";
import TeacherDetailsPage from "./pages/TeacherDetailsPage";
import MyAppointmentsStudPage from "./pages/MyAppointmentsStudPage";
import TeacherAppointmentsPage from "./pages/TeacherAppointmentsPage";
import TeacherAvailabilityPage from "./pages/TeacherAvailabilityPage";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
    },

    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Navigate to="/home" replace /> },
            { path: "home", element: <HomePage /> },
            { path: "teachers", element: <TeachersPage /> },
            { path: "teachers/:id", element: <TeacherDetailsPage /> },
            { path: "my-appointments", element: <MyAppointmentsStudPage /> },
            {
                path: "teacher/appointments",
                element: <TeacherAppointmentsPage />,
            },
            {
                path: "teacher/availability",
                element: <TeacherAvailabilityPage />,
            },
        ],
    },
    {
        path: "*",
        element: <NoPage />,
    },
]);

function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

export default App;
