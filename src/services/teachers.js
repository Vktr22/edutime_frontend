import { myAxios } from "./api";

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
