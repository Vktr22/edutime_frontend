// "YYYY-MM-DD HH:mm:ss" -> Date (helyi időzónában, biztosan)
export function parseSqlDateTimeLocal(str) {
    if (!str) return new Date(NaN);

    // ISO 8601 fallback (pl. 2026-05-02T22:00:00.000000Z)
    if (str.includes("T")) {
        return new Date(str); // ez lokális Date objektumot ad (helyi időben megjeleníthető)
    }

    // str: 2026-04-26 20:00:00
    const [datePart, timePart = "00:00:00"] = str.split(" ");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ss] = timePart.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm, ss || 0);
}

// "YYYY-MM-DD" -> Date (helyi)
export function parseYMDLocal(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
}
