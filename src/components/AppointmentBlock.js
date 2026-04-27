import AppointmentCard from "./AppointmentCard";
import { parseYMDLocal } from "../utils/datetimeLocal";

export default function AppointmentBlock({
  title,
  grouped,
  isCancelled = false,
  isPast = false,
  onAction,
  actionLabel,
  extraLabel,
}) {
  if (Object.keys(grouped).length === 0) return null;

  return (
    <div className="section-block">
      <h3
        className={`section-title ${
          isCancelled ? "cancelled-title" : ""
        }`}
      >
        {title}
      </h3>

      {Object.keys(grouped).map((date) => (
        <div key={date} className="date-block">
          <h4>
            {parseYMDLocal(date).toLocaleDateString("hu-HU", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h4>

          {grouped[date].map((appt) => (
            <AppointmentCard
              key={appt.id}
              appt={appt}
              isCancelled={isCancelled}
              isPast={isPast}
              onAction={onAction ? () => onAction(appt) : null}
              actionLabel={actionLabel}
              extraLabel={extraLabel}
            />
          ))}
        </div>
      ))}
    </div>
  );
}