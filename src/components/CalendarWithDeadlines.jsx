import React from "react";
import "./calendar-grid.css";
import { buildMonthMatrix } from "../utils/buildMonthMatrix";
import { startOfDay, toLocalKey } from "../utils/dateUtils";

const CalendarWithDeadlines = ({ currentDate, events }) => {
  // Генерируем матрицу дней
  const monthMatrix = buildMonthMatrix(currentDate.getFullYear(), currentDate.getMonth());

  console.log("[CalendarDebug] Rendering month:", currentDate);
  console.log("[CalendarDebug] Days length:", monthMatrix.length);

  return (
    <div className="calendar-container">
      <div className="calendar-grid">
        {monthMatrix.map((day, index) => {
          const safeDay = startOfDay(day.date);
          const dayKey = toLocalKey(safeDay);
          const dayEvents = events?.[dayKey] || [];

          console.log("[CalendarDebug] Day:", dayKey, "Events:", dayEvents);

          return (
            <div key={index} className="calendar-cell">
              <div className="calendar-day-number">{safeDay.getDate()}</div>
              {dayEvents.length > 0 && (
                <ul className="calendar-events">
                  {dayEvents.map((event, idx) => (
                    <li key={idx} className="calendar-event">
                      {event.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWithDeadlines;
