export function parseSqlDateTimeLocal(str) {
    if (!str) return new Date(NaN);

    if (str.includes("T")) {
        return new Date(str);
    }

    const [datePart, timePart = "00:00:00"] = str.split(" ");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ss] = timePart.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm, ss || 0);
}

export function parseYMDLocal(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
}
