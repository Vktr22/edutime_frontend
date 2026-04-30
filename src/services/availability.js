import { myAxios } from "./api";

export async function fetchAvailableSlots(token, teacherId) {
    const { data } = await myAxios.get(
        `/api/teachers/${teacherId}/available-slots`,
        {
            headers: { Authorization: `Bearer ${token}` },
        },
    );
    return data;
}

export async function fetchAvailability(token) {
    const { data } = await myAxios.get("/api/teacher/availability", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
}

export async function createAvailability(token, payload) {
    const { data } = await myAxios.post("/api/teacher/availability", payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
}

export async function deleteAvailability(token, id) {
    const { data } = await myAxios.delete(`/api/teacher/availability/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
}
