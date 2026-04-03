import { myAxios } from "./api";

export async function fetchTeachers(token) {
  const { data } = await myAxios.get("/api/teachers", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}