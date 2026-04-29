import { parseSqlDateTimeLocal, parseYMDLocal } from "../utils/datetimeLocal";

describe("datetimeLocal utils", () => {
  test("parseYMDLocal parses YYYY-MM-DD to local Date", () => {
    const d = parseYMDLocal("2026-04-26");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(3); // April = 3
    expect(d.getDate()).toBe(26);
  });

  test("parseSqlDateTimeLocal parses SQL datetime as local time", () => {
    const d = parseSqlDateTimeLocal("2026-04-26 20:00:00");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(3);
    expect(d.getDate()).toBe(26);
    expect(d.getHours()).toBe(20);
    expect(d.getMinutes()).toBe(0);
  });

  test("parseSqlDateTimeLocal supports ISO format", () => {
    const d = parseSqlDateTimeLocal("2026-05-02T22:00:00.000000Z");
    expect(Number.isNaN(d.getTime())).toBe(false);
  });

  test("parseSqlDateTimeLocal returns Invalid Date on empty", () => {
    const d = parseSqlDateTimeLocal("");
    expect(Number.isNaN(d.getTime())).toBe(true);
  });
});