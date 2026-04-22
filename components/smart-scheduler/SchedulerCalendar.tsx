"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const sampleEvents = [
  {
    title: "Sunday Service",
    start: "2026-04-19T09:00:00",
    end: "2026-04-19T11:30:00",
    backgroundColor: "var(--primary)",
    borderColor: "var(--primary)",
  },
  {
    title: "Wednesday Rehearsal",
    start: "2026-04-22T18:00:00",
    end: "2026-04-22T20:00:00",
    backgroundColor: "var(--secondary)",
    borderColor: "var(--secondary)",
  },
  {
    title: "Sunday Service",
    start: "2026-04-26T09:00:00",
    end: "2026-04-26T11:30:00",
    backgroundColor: "var(--primary)",
    borderColor: "var(--primary)",
  },
  {
    title: "Youth Night",
    start: "2026-04-24T19:00:00",
    end: "2026-04-24T21:00:00",
    backgroundColor: "var(--accent)",
    borderColor: "var(--accent)",
  },
  {
    title: "Team Meeting",
    start: "2026-04-21T10:00:00",
    end: "2026-04-21T11:00:00",
    backgroundColor: "var(--gradient-mid)",
    borderColor: "var(--gradient-mid)",
  },
  {
    title: "Sunday Service",
    start: "2026-05-03T09:00:00",
    end: "2026-05-03T11:30:00",
    backgroundColor: "var(--primary)",
    borderColor: "var(--primary)",
  },
  {
    title: "Wednesday Rehearsal",
    start: "2026-04-29T18:00:00",
    end: "2026-04-29T20:00:00",
    backgroundColor: "var(--secondary)",
    borderColor: "var(--secondary)",
  },
];

export function SchedulerCalendar() {
  return (
    <div className="scheduler-calendar">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek",
        }}
        events={sampleEvents}
        editable
        selectable
        dayMaxEvents={3}
        height="auto"
        eventDisplay="block"
        eventBorderColor="transparent"
      />
      <style>{`
        .scheduler-calendar .fc {
          --fc-border-color: var(--border);
          --fc-today-bg-color: color-mix(in srgb, var(--primary) 6%, transparent);
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: var(--surface);
          --fc-event-text-color: white;
          font-family: inherit;
        }
        .scheduler-calendar .fc .fc-toolbar-title {
          font-size: 1.125rem;
          font-weight: 700;
          letter-spacing: -0.025em;
        }
        .scheduler-calendar .fc .fc-button {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--foreground);
          font-size: 0.8125rem;
          font-weight: 500;
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          transition: all 150ms;
          text-transform: none;
        }
        .scheduler-calendar .fc .fc-button:hover {
          background: var(--primary);
          color: var(--primary-foreground);
          border-color: var(--primary);
        }
        .scheduler-calendar .fc .fc-button-active {
          background: var(--primary) !important;
          color: var(--primary-foreground) !important;
          border-color: var(--primary) !important;
        }
        .scheduler-calendar .fc .fc-daygrid-day-number {
          font-size: 0.8125rem;
          font-weight: 500;
          padding: 0.5rem;
        }
        .scheduler-calendar .fc .fc-event {
          border-radius: 0.375rem;
          padding: 0.125rem 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .scheduler-calendar .fc .fc-col-header-cell-cushion {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted);
          padding: 0.625rem 0;
        }
      `}</style>
    </div>
  );
}
