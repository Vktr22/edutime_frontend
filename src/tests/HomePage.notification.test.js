import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "../pages/HomePage";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// AuthContext mock
jest.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { role: "teacher", name: "teacher2" },
    loading: false,
  }),
}));

// services mock
jest.mock("../services/appointments", () => ({
  fetchTeacherAppointments: jest.fn(),
  fetchStudentAppointments: jest.fn(),
}));

jest.mock("../services/cancellationSeen", () => ({
  getSeenCancelledIds: jest.fn(() => []),
}));

import { fetchTeacherAppointments } from "../services/appointments";

describe("HomePage notification", () => {
  beforeEach(() => {
    fetchTeacherAppointments.mockReset();
    fetchTeacherAppointments.mockResolvedValue([
      { id: 1, status: "cancelled_by_student" },
    ]);
    localStorage.setItem("token", "dummy");
  });

  test("shows notification when teacher has unseen cancelled_by_student", async () => {
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route
            path="/teacher/appointments"
            element={<div>TEACHER_APPOINTMENTS_PAGE</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/lemondta|törlésre került/i)).toBeInTheDocument();
    });
  });

  test("clicking notification navigates to /teacher/appointments", async () => {
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route
            path="/teacher/appointments"
            element={<div>TEACHER_APPOINTMENTS_PAGE</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    const textNode = await screen.findByText(/lemondta|törlésre került/i);
    fireEvent.click(textNode.closest(".home-notice") || textNode);

    expect(
      await screen.findByText("TEACHER_APPOINTMENTS_PAGE")
    ).toBeInTheDocument();
  });
});