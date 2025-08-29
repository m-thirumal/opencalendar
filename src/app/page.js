"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "react-modal";
import { createEvent } from "ics";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

// --- Top Navigation Component ---
function TopNav({ currentView, setView, downloadICS }) {
  return (
    <div className="flex gap-4 mb-4">
      <button
        onClick={downloadICS}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Download ICS
      </button>
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
          <Tippy content={eventInfo.event.title}>
            <div className="cursor-pointer">{eventInfo.event.title}</div>
          </Tippy>
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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [titleInput, setTitleInput] = useState("");

  const [currentView, setCurrentView] = useState("year");
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => { Modal.setAppElement("body"); }, []);

  const handleDateClick = (arg) => {
    setEditingEvent({ start: arg.date, allDay: true });
    setTitleInput("");
    setModalIsOpen(true);
  };

  const handleEventClick = (arg) => {
    setEditingEvent({ id: arg.event.id, start: arg.event.start });
    setTitleInput(arg.event.title);
    setModalIsOpen(true);
  };

  const saveEvent = () => {
    if(editingEvent?.id){
      setEvents(events.map(e => e.id===editingEvent.id ? {...e, title:titleInput} : e));
    } else {
      setEvents([...events, {id:Date.now(), title:titleInput, start:editingEvent.start, allDay:true}]);
    }
    setModalIsOpen(false);
    setEditingEvent(null);
    setTitleInput("");
  };

  const downloadICS = () => {
    const icsEvents = events.map(e=>({
      start:[e.start.getFullYear(), e.start.getMonth()+1, e.start.getDate(), 0,0],
      title:e.title
    }));
    const { error,value } = icsEvents.length===1 ? createEvent(icsEvents[0]) : createEvent({events:icsEvents});
    if(!error){
      const blob = new Blob([value], {type:"text/calendar;charset=utf-8"});
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "calendar.ics";
      link.click();
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

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={()=>setModalIsOpen(false)}
        className="bg-white rounded p-6 max-w-md mx-auto mt-20 shadow-lg outline-none z-50 relative"
        overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-start z-40"
      >
        <h2 className="text-xl font-semibold mb-4">{editingEvent?.id ? "Edit Event" : "Add Event"}</h2>
        <input type="text" value={titleInput} onChange={e=>setTitleInput(e.target.value)} placeholder="Event Title" className="w-full border px-3 py-2 rounded mb-4"/>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" onClick={()=>setModalIsOpen(false)}>Cancel</button>
          <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={saveEvent}>Save</button>
        </div>
      </Modal>
    </div>
  );
}
