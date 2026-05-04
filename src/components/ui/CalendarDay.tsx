import React from 'react';
import { tokens } from '../../styles/tokens';

interface CalendarDayProps {
  date: string | Date;
  intensity?: number; // 0..1
  size?: number;
  onClick?: () => void;
  ariaLabel?: string;
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

export default function CalendarDay({ date, intensity = 0, size = 36, onClick, ariaLabel }: CalendarDayProps) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const label = ariaLabel ?? `${d.toDateString()}, intensity ${Math.round(intensity * 100)}%`;
  const colorHex = tokens.chart?.series?.[0] ?? '#F4941A';
  const rgb = hexToRgb(colorHex);
  const bg = `rgba(${rgb}, ${Math.max(0.06, Math.min(1, intensity))})`;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{ width: size, height: size }}
      className="rounded-md flex items-center justify-center focus:outline-none"
    >
      <span
        aria-hidden
        style={{
          width: size - 8,
          height: size - 8,
          background: bg,
          borderRadius: 8,
          display: 'inline-block',
        }}
      />
    </button>
  );
}
