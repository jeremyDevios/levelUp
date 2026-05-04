import React from 'react';

export default function HistoryCalendar({ onSelect }: { onSelect?: (date: Date) => void }) {
  // Lightweight placeholder for calendar — will be replaced with react-day-picker in full implementation
  return (
    <div className="lu-calendar" role="region" aria-label="Calendar">
      <p>Calendar placeholder — select a day to view sessions.</p>
      <button onClick={() => onSelect && onSelect(new Date())}>Select Today</button>
    </div>
  );
}
