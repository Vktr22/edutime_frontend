const KEY_STUDENT = "seen_cancelled_by_teacher_ids";

const KEY_TEACHER = "seen_cancelled_by_student_ids";

function getKey(role) {
    return role === "teacher" ? KEY_TEACHER : KEY_STUDENT;
}

export function getSeenCancelledIds(role) {
    try {
        const raw = localStorage.getItem(getKey(role));
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr.map(Number) : [];
    } catch {
        return [];
    }
}

export function addSeenCancelledId(role, id) {
    const ids = new Set(getSeenCancelledIds(role));
    ids.add(Number(id));
    localStorage.setItem(getKey(role), JSON.stringify([...ids]));
}
