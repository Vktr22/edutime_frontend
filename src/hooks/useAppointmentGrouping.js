import { useMemo } from "react";

/*
ez a file ezert hasznos:
nincs useEffect + state‑halmaz
mindig konzisztens
diák / tanár egy sor eltéréssel
*/

export function useAppointmentGrouping(appointments, mode) {
  return useMemo(() => {
    const now = new Date();

    const cancelledStatus =
      mode === "student" ? "cancelled_by_teacher" : "cancelled_by_student";

    const cancelled = appointments.filter((a) => a.status === cancelledStatus);

    const future = appointments.filter(
      (a) => a.status === "active" && new Date(a.lesson_time) > now,
    );

    const past = appointments.filter(
      (a) => a.status === "active" && new Date(a.lesson_time) <= now,
    );

    function groupByDate(data) {
      return data.reduce((acc, appt) => {
        const date = appt.lesson_time.split(" ")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(appt);
        return acc;
      }, {});
    }

    return {
      cancelled,
      futureGrouped: groupByDate(future),
      pastGrouped: groupByDate(past),
    };
  }, [appointments, mode]);
}
