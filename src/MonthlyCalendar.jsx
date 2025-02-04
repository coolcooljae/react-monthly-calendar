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
  // const [filteredEvents, setFilteredEvents] = useState([]);
  const monthSelection = new Date().getMonth();
  console.log(`selected month is ${monthSelection}`);

  const year = new Date().getFullYear()
  // getWeekRange(year, monthSelection);
  getWeeklySum(year, 1);
  // getWeeklyRangeOnlyMonth(year, 3);
  // console.log(`selected week is ${new Date().getDate()}`);
  //const [selectedMonth, setSelectedMonth] = useState(monthSelection); // Initial month

  // initial data loading
  useEffect(() => {
    const fetchEvents = async () => {
      // simulate api request, and get data from server eventually
      const initialEvents = [
        { id: "1", title: "1st", price: 50, start: "2025-02-04" },
        { id: "2", title: "2nd", price: 33, start: "2025-02-13" },
        { id: "3", title: "3rd", price: 66, start: "2025-02-11" }
      ];
      setEvents(initialEvents);
    };
    fetchEvents();
  }, []);

  function getWeeklySum(year, month) {
    // sort events by start
    // events.sort((a, b) => {
    //   if (a.start < b.start) {
    //     return -1;
    //   } else if (a.start > b.start) {
    //     return 1;
    //   } else {
    //     return 0;
    //   }
    // });
    //events.map(event => console.log(`event.${event.id} ${event.title} ${event.price}`));

    const weeks = getWeeklyRangeOnlyMonth(year, month);
    weeks.map(week => {
      console.log(`from ${week.start} to ${week.end}`);
      let sum = 0;
      events.map(event => {
        if (event.start >= week.start && event.start <= week.end) {
          sum += Number(event.price);
        }
      });
      console.log(`\tweekly sum is ${sum}`);
    });
  }

  // filter by month
  // useEffect(() => {
  //   const filtered = events.filter((event) => {
  //     const eventDate = new Date(event.start);
  //     return eventDate.getMonth() === selectedMonth;
  //   });
  //   setFilteredEvents(filtered);
  //   console.log(`filter event count = ${filtered.length}`);
  // }, [events, selectedMonth]);

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
    //console.log(`[handleChange] ${e.target.name}: ${e.target.value}`);
  };

  // Handle form submission
  const handleAddEvent = (e) => {
    e.preventDefault();
    // console.log(e)

    if (!newEvent.title || !newEvent.date) {
      alert("Please enter event title and date.");
      return;
    }

    // console.log(`event count (before) = ${events.length}`);
    // console.log(`new event title, ${newEvent.title}`);

    const eventToAdd = {
      id: String(events.length + 1),
      title: newEvent.title,
      price: newEvent.price,
      start: newEvent.date
    };

    setEvents([...events, eventToAdd]); // Add event to calendar
    // console.log(`event count (after) = ${events.length}`);
    setNewEvent({ title: "", price: 0, date: "" }); // Reset form

    // const monthlyTotal = events
    //     .filter(event => new Date(event.start).getMonth() === monthSelection)
    //     .reduce((sum, event) => sum + Number(event.price), 0);
    // console.log(`monthly sum = ${monthlyTotal}`);
  };


  return (
    <div className='demo-app'>
      <Sidebar
        currentEvents={events} monthSelection={monthSelection}
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
      <span style={{margin: "0 10px"}}>
          ${eventInfo.event.extendedProps.price}
        </span>
    </div>
  );
};

function Sidebar({ currentEvents, monthSelection }) {
  // console.log(`[Sidebar] event count = ${currentEvents.length}`);

  // monthly sum
  const monthlyTotal = currentEvents
      .filter(event => new Date(event.start).getMonth() === monthSelection)
      .reduce((sum, event) => sum + Number(event.price), 0);
  console.log(`monthly sum = ${monthlyTotal}`);

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

// 1st version, all inclusive: start date could be previous month, and end date could be next month
function getWeeklyRangeAllInclusive(year, month) {
  const weeks = [];
  const firstDayOfMonth = new Date(year, month, 1); // Month is 0-based
  const lastDayOfMonth = new Date(year, month+1, 0);

  let current = new Date(firstDayOfMonth);

  // Adjust to the first Sunday before or on the first day of the month
  current.setDate(current.getDate() - current.getDay());

  while (current <= lastDayOfMonth) {
    let weekStart = new Date(current);
    let weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6); // Move to Saturday

    weeks.push({
      start: weekStart.toISOString().split("T")[0],
      end: weekEnd.toISOString().split("T")[0],
    });

    // Move to the next week (next Sunday)
    current.setDate(current.getDate() + 7);
  }

  weeks.map(week => {
    console.log(`week from ${week.start} to ${week.end}`);
  });

  //return weeks;
}

// 2nd version, only contain the given month: start date is always 1st, and end date is the last of the current month
function getWeeklyRangeOnlyMonth(year, month) {
  const weeks = [];
  const firstDayOfMonth = new Date(year, month, 1); // Month is 0-based
  const lastDayOfMonth = new Date(year, month+1, 0);

  let current = new Date(firstDayOfMonth);

  // Adjust to the first Sunday before or on the first day of the month
  current.setDate(current.getDate() - current.getDay());

  while (current <= lastDayOfMonth) {
    let weekStart = new Date(current);
    let weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6); // Move to Saturday

    // adjust the first day
    if (weekStart < firstDayOfMonth) {
      weekStart = firstDayOfMonth;
    }

    // Ensure the end date doesn't exceed the month's last day
    if (weekEnd > lastDayOfMonth) {
      weekEnd = new Date(lastDayOfMonth);
    }

    weeks.push({
      start: weekStart.toISOString().split("T")[0],
      end: weekEnd.toISOString().split("T")[0],
    });

    // Move to the next week (next Sunday)
    current.setDate(current.getDate() + 7);
  }

  // weeks.map(week => {
  //   console.log(`week from ${week.start} to ${week.end}`);
  // });

  return weeks;
}


