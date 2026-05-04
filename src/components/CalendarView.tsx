import React from 'react'
import { DayPicker } from 'react-day-picker'
import type { DayContentProps } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

function DayContent({ date, activeModifiers }: DayContentProps) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
      <span>{date.getDate()}</span>
      {activeModifiers.hasSession && (
        <span
          style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: activeModifiers.selected ? '#fff' : 'var(--color-primary)',
            display: 'block',
          }}
        />
      )}
    </span>
  )
}

export default function CalendarView({
  markedDates = [],
  selectedDate,
  onDayClick,
}: {
  markedDates?: Date[]
  selectedDate?: Date | null
  onDayClick?: (d: Date) => void
}) {
  return (
    <div className="calendar-wrapper" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <DayPicker
        mode="single"
        selected={selectedDate ?? undefined}
        onDayClick={onDayClick}
        modifiers={{ hasSession: markedDates }}
        modifiersStyles={{
          hasSession: { fontWeight: 700 },
        }}
        components={{ DayContent }}
        locale={undefined}
        style={{ width: '100%' }}
      />
      <style>{`
        .calendar-wrapper .rdp {
          --rdp-accent-color: var(--color-primary);
          --rdp-background-color: rgba(59, 126, 248, 0.12);
          color: var(--text);
          margin: 0 auto;
          width: 100%;
        }
        .calendar-wrapper .rdp-month {
          width: 100%;
        }
        .calendar-wrapper .rdp-table {
          width: 100%;
          max-width: 100%;
        }
        .calendar-wrapper .rdp-cell {
          overflow: visible;
        }
        .calendar-wrapper .rdp-button {
          overflow: visible;
        }
        .calendar-wrapper .rdp-day_selected {
          background-color: var(--color-primary) !important;
          color: #fff !important;
        }
        .calendar-wrapper .rdp-button:hover:not([disabled]) {
          background-color: var(--surface-2);
          color: var(--text);
        }
        .calendar-wrapper .rdp-head_cell,
        .calendar-wrapper .rdp-caption_label {
          color: var(--text);
        }
        .calendar-wrapper .rdp-nav_button {
          color: var(--muted);
        }
        .calendar-wrapper .rdp-day {
          color: var(--text);
        }
        .calendar-wrapper .rdp-day_outside {
          color: var(--muted);
          opacity: 0.4;
        }
      `}</style>
    </div>
  )
}
