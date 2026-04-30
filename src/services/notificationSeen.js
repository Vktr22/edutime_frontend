const KEY_STUDENT = "seen_cancelled_by_teacher_at";

const KEY_TEACHER = "seen_cancelled_by_student_at";

export function getSeenKeyForRole(role) {
    return role === "teacher" ? KEY_TEACHER : KEY_STUDENT;
}

export function getSeenTimestamp(role) {
    const key = getSeenKeyForRole(role);
    return localStorage.getItem(key);
}

export function setSeenTimestamp(role, isoString) {
    const key = getSeenKeyForRole(role);
    localStorage.setItem(key, isoString);
}
