// Diák nézetben ezt a kulcsot használjuk arra, mikor látta utoljára a tanár által törölt időpont értesítéseit.
const KEY_STUDENT = "seen_cancelled_by_teacher_at";

// Tanár nézetben ezt a kulcsot használjuk arra, mikor látta utoljára a diák által törölt időpont értesítéseit.
const KEY_TEACHER = "seen_cancelled_by_student_at";

// Szerepkör alapján visszaadja a megfelelő localStorage kulcsot.
export function getSeenKeyForRole(role) {
  return role === "teacher" ? KEY_TEACHER : KEY_STUDENT;
}

// Kiolvassa a legutóbb látott értesítés időbélyegét (ISO string), vagy null-t ad vissza, ha még nincs mentve.
export function getSeenTimestamp(role) {
  const key = getSeenKeyForRole(role);
  return localStorage.getItem(key); // ISO string vagy null
}

// Elmenti a legutóbb látott értesítés időbélyegét localStorage-ba.
export function setSeenTimestamp(role, isoString) {
  const key = getSeenKeyForRole(role);
  localStorage.setItem(key, isoString);
}