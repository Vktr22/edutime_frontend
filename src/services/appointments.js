import { myAxios } from "./api";

/**
 * Book an appointment with a teacher.
 * @param {string} token Bearer token
 * @param {string|number} teacherId teacher user id
 * @param {string} lessonTime datetime string: YYYY-MM-DD HH:MM:SS
 */

//bookappointment egyetlen feladata elkuldeni a foglalast
//a token itt kerul headerbe->mert a backend auth:sanctumot hasznal
//a body mezo neve lesson_time (merta backend auth ezt varja)
export async function bookAppointment(token, teacherId, lessonTime) {
  const { data } = await myAxios.post(
    `/api/teachers/${teacherId}/appointments`,
    { lesson_time: lessonTime },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}


export async function fetchStudentAppointments(token) {
  const { data } = await myAxios.get("/api/student/appointments", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
