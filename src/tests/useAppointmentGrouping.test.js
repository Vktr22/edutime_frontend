import { renderHook } from "@testing-library/react";
import { useAppointmentGrouping } from "../hooks/useAppointmentGrouping";

describe("useAppointmentGrouping", () => {
  const base = (overrides) => ({
    id: 1,
    lesson_time: "2099-01-01 10:00:00",
    status: "active",
    teacher: { name: "T" },
    student: { name: "S" },
    ...overrides,
  });

  test("student mode: cancelled_by_teacher goes into cancelled", () => {
    const appts = [
      base({ id: 1, status: "cancelled_by_teacher" }),
      base({ id: 2, status: "cancelled_by_student" }),
    ];

    const { result } = renderHook(() => useAppointmentGrouping(appts, "student"));
    expect(result.current.cancelled.map((a) => a.id)).toEqual([1]);
  });

  test("teacher mode: cancelled_by_student goes into cancelled", () => {
    const appts = [
      base({ id: 1, status: "cancelled_by_teacher" }),
      base({ id: 2, status: "cancelled_by_student" }),
    ];

    const { result } = renderHook(() => useAppointmentGrouping(appts, "teacher"));
    expect(result.current.cancelled.map((a) => a.id)).toEqual([2]);
  });

  test("futureGrouped / pastGrouped splits active by time", () => {
    const appts = [
      base({ id: 1, lesson_time: "2099-01-01 10:00:00", status: "active" }),
      base({ id: 2, lesson_time: "2000-01-01 10:00:00", status: "active" }),
    ];

    const { result } = renderHook(() => useAppointmentGrouping(appts, "student"));

    expect(result.current.futureGrouped["2099-01-01"][0].id).toBe(1);
    expect(result.current.pastGrouped["2000-01-01"][0].id).toBe(2);
  });
});