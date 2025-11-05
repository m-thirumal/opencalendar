"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "react-modal";
import { createEvent, createEvents } from "ics";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import EventModal from "./components/EventModal";

// --- Top Navigation Component ---
function TopNav({ currentView, setView, downloadICS }) {
  return (
    <div className="flex gap-4 mb-4">
      <button
        onClick={() => setView("year")}
        className={`px-3 py-1 border rounded ${currentView==="year"?"bg-gray-200":""}`}
      >
        Year
      </button>
      <button
        onClick={() => setView("month")}
        className={`px-3 py-1 border rounded ${currentView==="month"?"bg-gray-200":""}`}
      >
        Month
      </button>
      <button
        onClick={() => setView("day")}
        className={`px-3 py-1 border rounded ${currentView==="day"?"bg-gray-200":""}`}
      >
        Day
      </button>
            <button
        onClick={downloadICS}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Download ICS
      </button>
    </div>
  );
}

// --- Year View (12 months grid) ---
function YearView({ year, events = [], handleDateClick, handleEventClick, onMonthClick }) {
  const safeEvents = events.filter(e => e.start instanceof Date);

  return (
    <div className="grid grid-cols-3 gap-2">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="border rounded p-2 cursor-pointer hover:bg-gray-100"
          onClick={() => onMonthClick && onMonthClick(i)}
        >
          <h3 className="text-center font-semibold mb-2">
            {new Date(0, i).toLocaleString("default", { month: "long" })}
          </h3>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={new Date(year, i, 1)}
            editable={true}
            selectable={true}
            events={safeEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventContent={(eventInfo) => (
              <Tippy content={eventInfo.event.title}>
                <div className="cursor-pointer text-sm truncate">{eventInfo.event.title}</div>
              </Tippy>
            )}
            height="auto"
            headerToolbar={false}
          />
        </div>
      ))}
    </div>
  );
}



// --- Month View (calendar with arrows) ---
function MonthView({ selectedDate, onDateClick, onEventClick, events, setSelectedDate }) {
  const prevMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  const nextMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));

  return (
    <div>
      <div className="flex justify-between mb-2">
        <button onClick={prevMonth} className="px-2 py-1 border rounded hover:bg-gray-200">{'<'}</button>
        <span className="font-semibold">{selectedDate.toLocaleString("default",{month:"long", year:"numeric"})}</span>
        <button onClick={nextMonth} className="px-2 py-1 border rounded hover:bg-gray-200">{'>'}</button>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={selectedDate}
        editable={true}
        selectable={true}
        events={events}
        dateClick={onDateClick}
        eventClick={onEventClick}
        eventContent={(eventInfo) => (
  <div className="cursor-pointer text-sm truncate">{eventInfo.event.title}</div>
)}


      />
    </div>
  );
}

// --- Day View (single day) ---
function DayView({ selectedDate, onDateClick, onEventClick, events, setSelectedDate }) {
  const prevDay = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() -1));
  const nextDay = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() +1));

  return (
    <div>
      <div className="flex justify-between mb-2">
        <button onClick={prevDay} className="px-2 py-1 border rounded hover:bg-gray-200">{'<'}</button>
        <span className="font-semibold">{selectedDate.toDateString()}</span>
        <button onClick={nextDay} className="px-2 py-1 border rounded hover:bg-gray-200">{'>'}</button>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridDay"
        initialDate={selectedDate}
        editable={true}
        selectable={true}
        events={events}
        dateClick={onDateClick}
        eventClick={onEventClick}
        eventContent={(eventInfo) => (
          <Tippy content={eventInfo.event.title}>
            <div className="cursor-pointer">{eventInfo.event.title}</div>
          </Tippy>
        )}
      />
    </div>
  );
}

// --- Main Calendar Page ---
export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [titleInput, setTitleInput] = useState("");

  const [currentView, setCurrentView] = useState("year");
  const [selectedDate, setSelectedDate] = useState(new Date());
  //
  const [open, setOpen] = useState(false);

  // To persist events in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("calendarEvents");
    if (saved) setEvents(JSON.parse(saved));
  }, []);
  // Save events to localStorage on change
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  const handleDateClick = (arg) => {
    console.log("Clicked date:", arg.date);
    setEditingEvent({
      summary: "",
      description: "",
      location: "",
      start: arg.date.toISOString().slice(0, 16), // format for datetime-local
      end: arg.date.toISOString().slice(0, 16),
      organizer: "",
      attendees: "",
      status: "CONFIRMED",
      categories: "",
      priority: "5",
      url: "",
    });
    setOpen(true);
  };

  const handleEventClick = (arg) => {
    setEditingEvent({ id: arg.event.id, start: arg.event.start });
    setTitleInput(arg.event.title);
    setOpen(true);
  };

  const handleSave = () => {
    if(editingEvent?.id){
      setEvents(events.map(e => e.id===editingEvent.id ? {...e, title:titleInput} : e));
    } else {
      setEvents([...events, {id:Date.now(), title:titleInput, start:editingEvent.start, allDay:true}]);
    }
    setOpen(true);
    setEditingEvent(null);
    setTitleInput("");
  };

  const downloadICS = () => {
    const icsEvents = events.map(e=>({
      start:[e.start.getFullYear(), e.start.getMonth()+1, e.start.getDate(), 0,0],
      title:e.title
    }));
    const { error, value } = createEvents(icsEvents);
    if (!error && value) {
      const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "calendar.ics";
      link.click();
    } else if (error) {
      console.error("ICS generation failed:", error);
    }
  };

  // For Year view, selected year is selectedDate.getFullYear()
  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();

  const handleMonthClick = (monthIndex) => {
    setSelectedDate(new Date(selectedYear, monthIndex, 1));
    setCurrentView("month");
  };

  return (
    <div className="p-4">
      <TopNav currentView={currentView} setView={setCurrentView} downloadICS={downloadICS} />

      {currentView==="year" && (
        <YearView
          year={selectedYear}
          events={events}                // pass events
          handleDateClick={handleDateClick}
          handleEventClick={handleEventClick}
          onMonthClick={handleMonthClick} // optional: for clicking a month
        />
      )}

      {currentView==="month" && <MonthView selectedDate={selectedDate} setSelectedDate={setSelectedDate} onDateClick={handleDateClick} onEventClick={handleEventClick} events={events} />}
      {currentView==="day" && <DayView selectedDate={selectedDate} setSelectedDate={setSelectedDate} onDateClick={handleDateClick} onEventClick={handleEventClick} events={events} />}

      <EventModal open={open} onClose={() => setOpen(false)} onSave={handleSave} />
    </div>
  );
}
