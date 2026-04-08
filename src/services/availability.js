// src/services/availability.js
import { myAxios } from "./api";

// Foglalható időpontok lekérése tanárhoz
export async function fetchAvailableSlots(token, teacherId) {
  const { data } = await myAxios.get(`/api/teachers/${teacherId}/available-slots`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// TEACHER – saját munkaidősávok lekérése
export async function fetchAvailability(token) {
  const { data } = await myAxios.get(
    "/api/teacher/availability",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
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