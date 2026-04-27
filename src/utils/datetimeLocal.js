// "YYYY-MM-DD HH:mm:ss" -> Date (helyi időzónában, biztosan)
export function parseSqlDateTimeLocal(str) {
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