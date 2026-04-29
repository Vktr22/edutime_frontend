import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

jest.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { role: "teacher", name: "teacher3" },
    loading: false,
  }),
}));

describe("Layout home greeting", () => {
  test("greets the authenticated user by name", () => {
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <Routes>
          <Route path="/home" element={<Layout />}>
            <Route index element={<div>HOME_CONTENT</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Üdvözöllek, teacher3!")).toBeInTheDocument();
    expect(screen.queryByText("Üdvözöllek, teacher!")).not.toBeInTheDocument();
  });
});