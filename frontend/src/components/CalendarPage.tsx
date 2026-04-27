"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Define the types for pickup/drop-off days
interface EventDays {
  [key: string]: 'pickup' | 'drop-off';
}

// Hardcoded event days for demonstration
const eventDays: EventDays = {
  '2024-07-05': 'pickup',
  '2024-07-12': 'drop-off',
  '2024-07-19': 'pickup',
  '2024-07-26': 'drop-off',
  '2024-08-02': 'pickup',
};

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 6)); // Default to July 2024

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const calendarDays = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="border-zinc-800 border rounded-lg"></div>);
  }
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const event = eventDays[dateString];
    
    let dayClass = "flex items-center justify-center h-12 w-12 rounded-full text-zinc-300 hover:bg-zinc-800 transition-colors";
    if (event === 'pickup') {
      dayClass += " bg-rose-500/20 border border-rose-500 text-rose-300";
    } else if (event === 'drop-off') {
      dayClass += " bg-cyan-500/20 border border-cyan-500 text-cyan-300";
    }

    calendarDays.push(
      <div key={day} className="flex items-center justify-center p-1">
        <div className={dayClass}>
          {day}
        </div>
      </div>
    );
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-4 pt-8 text-white bg-zinc-950 min-h-screen">
      <div className="max-w-md mx-auto bg-zinc-900/50 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-zinc-800">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
            <ChevronLeft size={24} className="text-zinc-400" />
          </button>
          <h2 className="text-xl font-bold text-zinc-100">{`${monthName} ${year}`}</h2>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
            <ChevronRight size={24} className="text-zinc-400" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 p-2 text-center text-zinc-500 text-sm">
          {daysOfWeek.map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 p-2">
          {calendarDays}
        </div>
      </div>
       <div className="mt-8 px-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-500/80 border border-rose-400"></div>
              <span className="text-zinc-300 font-medium">Pickup Day</span>
          </div>
          <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/80 border border-cyan-400"></div>
              <span className="text-zinc-300 font-medium">Drop-off Day</span>
          </div>
      </div>
    </div>
  );
};

export default CalendarPage;
