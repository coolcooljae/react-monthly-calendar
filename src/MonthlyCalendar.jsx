import React, { useEffect, useState, useRef } from 'react'
import { formatDate } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function MonthlyCalendar() {

  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    price: 0,
    date: ""
  });

  useEffect(() => {
    const fetchEvents = async () => {
      // simulate api request, and get data from server eventually
      const initialEvents = [
        { id: "1", title: "Concert", price: 50, start: "2025-02-04" },
        { id: "2", title: "Meeting", price: 33, start: "2025-02-10" }
      ];
      setEvents(initialEvents);
    };
    fetchEvents();
  }, []);

  // PDF print
  const calendarRef = useRef(null);

  const handleDownloadPDF = () => {
    if (!calendarRef.current) return;

    html2canvas(calendarRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("calendar.pdf");
    });
  };

  // Handle input change
  const handleChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) {
      alert("Please enter event title and date.");
      return;
    }

    const eventToAdd = {
      id: String(events.length + 1),
      title: newEvent.title,
      price: newEvent.price,
      start: newEvent.date
    };

    setEvents([...events, eventToAdd]); // Add event to calendar
    setNewEvent({ title: "", price: 0, date: "" }); // Reset form
  };


  return (
    <div className='demo-app'>
      <Sidebar
        currentEvents={events}
      />
      <div className='demo-app-main'>
        <button onClick={handleDownloadPDF}>Download PDF</button>

        <form onSubmit={handleAddEvent} style={{marginBottom: "20px"}}>
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={newEvent.price}
            onChange={handleChange}
          />
          <input
            type="date"
            name="date"
            value={newEvent.date}
            onChange={handleChange}
            required
          />
          <button type="submit">Add Event</button>
        </form>

        <div ref={calendarRef}>
          <FullCalendar
            plugins={[dayGridPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth'
            }}
            events={events}
            eventContent={renderEventContent} // custom render function
          />
        </div>
      </div>
    </div>
  )
}

// Custom render function for events
const renderEventContent = (eventInfo) => {
  return (
    <div style={{textAlign: "left"}}>
      <strong>{eventInfo.event.title}</strong>
      <br/>
      {/*<span style={{ color: "gray", fontSize: "0.9em" }}>*/}
      <span style={{fontSize: "0.9em"}}>
          ${eventInfo.event.extendedProps.price}
        </span>
    </div>
  );
};

function Sidebar({ currentEvents }) {
  return (
    <div className='demo-app-sidebar'>
      <div className='demo-app-sidebar-section'>
        <h2>All Events ({currentEvents.length})</h2>
        <ul>
          {currentEvents.map((event) => (
            <SidebarEvent key={event.id} event={event} />
          ))}
        </ul>
      </div>
    </div>
  )
}

function SidebarEvent({ event }) {
  return (
    <li key={event.id}>
      <b>{formatDate(event.start, {year: 'numeric', month: 'short', day: 'numeric'})}</b>
      <i>{event.title}</i>
      {/*<b>{event.extendedProps.price}</b>*/}
    </li>
  )
}
