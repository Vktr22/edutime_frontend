import { myAxios } from "./api";

/*
    ez a file kulon kezeli a tanarokkal kapcsis api hivasokat
    (gondoskodik arrol, h a vedett backend vegpontok hitelesitetten legyenek hivva)
    ahelyett, h minden oldalon kulon axios keres, eleg ezeket a fgveket meghivni (cleancode)
*/

export async function fetchTeachers(token) {
  const { data } = await myAxios.get("/api/teachers", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}


export async function fetchTeacherById(token, id) {
  const { data } = await myAxios.get(`/api/teachers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
