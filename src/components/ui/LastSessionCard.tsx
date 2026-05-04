import React from 'react';

type Metric = {
  label: string;
  value: string | number;
};

type LastSessionCardProps = {
  title?: string;
  date?: string;
  primary?: string | number;
  secondary?: Metric[];
  className?: string;
};

export const lastSessionCardClasses = {
  root: 'card-glass p-4 rounded-lg',
  header: 'flex items-start justify-between space-x-3',
  title: 'text-sm font-semibold text-gray-800 dark:text-gray-100',
  date: 'text-xs text-gray-500 dark:text-gray-400',
  primary: 'mt-3 text-3xl font-bold text-transparent bg-clip-text bg-primary-gradient',
  metrics: 'mt-4 grid grid-cols-2 gap-2',
  metricLabel: 'text-xs text-gray-500 dark:text-gray-400',
  metricValue: 'text-sm font-medium text-gray-800 dark:text-gray-100',
};

export default function LastSessionCard({ title = 'Last session', date = '', primary = '', secondary = [], className = '' }: LastSessionCardProps) {
  return (
    <div className={`${lastSessionCardClasses.root} ${className}`}>
      <div className={lastSessionCardClasses.header}>
        <div>
          <div className={lastSessionCardClasses.title}>{title}</div>
          {date && <div className={lastSessionCardClasses.date}>{date}</div>}
        </div>
        <div className="ml-auto flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center shadow-sm text-white text-sm">✓</div>
        </div>
      </div>

      <div className={lastSessionCardClasses.primary as string}>{primary}</div>

      {secondary.length > 0 && (
        <div className={lastSessionCardClasses.metrics}>
          {secondary.map((m, i) => (
            <div key={i} className="p-2 rounded-md bg-transparent border border-transparent">
              <div className={lastSessionCardClasses.metricLabel}>{m.label}</div>
              <div className={lastSessionCardClasses.metricValue}>{m.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/*
Design notes:
- Uses CSS tokens and .bg-primary-gradient helper (defined in globals.css) for the accent.
- This component is presentational only. Use exported `lastSessionCardClasses` to match spacing and tokens when integrating.
*/