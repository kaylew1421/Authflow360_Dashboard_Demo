import React, { useState } from "react";
import {
  Calendar,
  Views,
  dateFnsLocalizer,
  Event as CalendarEvent,
} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import { add, startOfToday } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Locale setup
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Default events
const initialEvents: CalendarEvent[] = [
  {
    title: "Team Meeting",
    start: add(startOfToday(), { days: 1, hours: 9 }),
    end: add(startOfToday(), { days: 1, hours: 10 }),
  },
];

const WeeklyCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const handleAddEvent = () => {
    const { title, date, startTime, endTime } = formData;
    if (!title || !date || !startTime || !endTime) return;

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    const newEvent = { title, start, end };
    setEvents([...events, newEvent]);
    setFormData({ title: "", date: "", startTime: "", endTime: "" });
    setShowModal(false);
  };

  return (
    <div className="bg-white p-4 rounded shadow-md relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">📅 Weekly Calendar</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
        >
          + Add Event
        </button>
      </div>

      {/* Calendar */}
      <div style={{ height: 500 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.WEEK}
          views={{ week: true }}
          step={30}
          timeslots={2}
          min={new Date(1970, 1, 1, 6, 0)}
          max={new Date(1970, 1, 1, 19, 0)}
          style={{ height: "100%" }}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Event</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  className="px-4 py-2 rounded bg-gray-300"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                  onClick={handleAddEvent}
                >
                  Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendar;
