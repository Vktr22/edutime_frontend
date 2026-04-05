// src/services/availability.js
import { myAxios } from "./api";

// GET – saját availability lista
export async function fetchAvailability(token) {
  const { data } = await myAxios.get("/api/teacher/availability", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// POST – új availability létrehozása
export async function createAvailability(token, payload) {
  const { data } = await myAxios.post(
    "/api/teacher/availability",
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
}

// DELETE – availability törlése ID alapján
export async function deleteAvailability(token, id) {
  const { data } = await myAxios.delete(
    `/api/teacher/availability/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
}