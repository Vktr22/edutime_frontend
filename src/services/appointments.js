import { myAxios } from "./api";

/**
 * Book an appointment with a teacher.
 * @param {string} token Bearer token
 * @param {string|number} teacherId teacher user id
 * @param {string} lessonTime datetime string: YYYY-MM-DD HH:MM:SS
 */

export async function bookAppointment(token, teacherId, lessonTime) {
    const { data } = await myAxios.post(
        `/api/teachers/${teacherId}/appointments`,
        { lesson_time: lessonTime },
        { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
}

export async function cancelStudentAppointment(token, appointmentId) {
    const { data } = await myAxios.delete(
        `/api/student/appointments/${appointmentId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    return data;
}

export async function cancelTeacherAppointment(token, appointmentId) {
    const { data } = await myAxios.delete(
        `/api/teacher/appointments/${appointmentId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    return data;
}

export async function fetchStudentAppointments(token) {
    const { data } = await myAxios.get("/api/student/appointments", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
}

export async function fetchTeacherAppointments(token) {
    const { data } = await myAxios.get("/api/teacher/appointments", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
}
