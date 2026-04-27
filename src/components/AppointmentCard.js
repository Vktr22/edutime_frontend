import { parseSqlDateTimeLocal } from "../utils/datetimeLocal";
/*
    ✅ ugyanaz a kártya:

    diák oldalon
    tanár oldalon
    törölt / aktív / múltbeli állapotokra
*/
export default function AppointmentCard({
  appt,
  isCancelled = false,
  isPast = false,
  actionLabel,
  onAction,
  extraLabel,
}) {
  return (
    <div
      className={`appointment-card ${
        isCancelled ? "cancelled" : ""
      } ${isPast ? "disabled" : ""}`}
    >
      <p>
        <strong>Időpont:</strong>{" "}
        {parseSqlDateTimeLocal(appt.lesson_time).toLocaleDateString(
          "hu-HU",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}{" "}
        – {appt.lesson_time.slice(11, 16)}
      </p>

      <p>
        <strong>{extraLabel}:</strong>{" "}
        {extraLabel === "Tanár"
          ? appt.teacher.name
          : appt.student.name}
      </p>

      {onAction && (
        <button
          className={
            actionLabel === "Törlés"
              ? "delete"
              : "ack"
          }
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}