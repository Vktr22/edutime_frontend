// Diák oldalon ezt a kulcsot használjuk a tanár által törölt időpontok "láttam" listájához.
const KEY_STUDENT = "seen_cancelled_by_teacher_ids"; // student nézi: teacher törölt

// Tanár oldalon ezt a kulcsot használjuk a diák által törölt időpontok "láttam" listájához.
const KEY_TEACHER = "seen_cancelled_by_student_ids"; // teacher nézi: student törölt

// Szerepkör alapján kiválasztja a megfelelő localStorage kulcsot.
function getKey(role) {
  return role === "teacher" ? KEY_TEACHER : KEY_STUDENT;
}

// Visszaadja a már látott törölt időpontok azonosítóit számtömbként.
// Hibás vagy hiányzó localStorage adat esetén üres tömbbel tér vissza.
export function getSeenCancelledIds(role) {
  try {
    const raw = localStorage.getItem(getKey(role));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(Number) : [];
  } catch {
    return [];
  }
}

// Hozzáad egy új "látott" törölt időpont-azonosítót a listához.
// Set-et használunk, hogy ugyanaz az ID ne kerülhessen be többször.
export function addSeenCancelledId(role, id) {
  const ids = new Set(getSeenCancelledIds(role));
  ids.add(Number(id));
  localStorage.setItem(getKey(role), JSON.stringify([...ids]));
}
