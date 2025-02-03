import React from 'react'
import { createRoot } from 'react-dom/client'
import MonthlyCalendar from "./MonthlyCalendar.jsx";
import './index.css'

document.addEventListener('DOMContentLoaded', function() {
  createRoot(document.getElementById('root'))
    .render(<MonthlyCalendar />)
})
