import React from 'react';

type SessionTableProps = {
  className?: string;
  children?: React.ReactNode;
  // optional caption or empty state
  caption?: React.ReactNode;
};

export const sessionTableClasses = {
  wrapper: 'w-full',
  listMobile: 'space-y-3',
  tableDesktop: 'hidden md:table w-full',
  tableRow: 'bg-transparent',
  headerCell: 'text-sm font-medium text-gray-600 dark:text-gray-300 p-3 text-left',
  cell: 'p-3 align-top',
  empty: 'text-sm text-gray-500 dark:text-gray-400 p-4',
};

export default function SessionTable({ className = '', children, caption }: SessionTableProps) {
  return (
    <div className={`${sessionTableClasses.wrapper} ${className}`}>
      {/* Mobile: stacked list */}
      <div className={sessionTableClasses.listMobile + ' md:hidden'}>
        {children}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden md:block">
        <table className="w-full table-fixed">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {/* Presentational only - consumers should provide th via children if needed */}
              {/* Use semantic header cells but provide flexible slot via children */}
              <th className={sessionTableClasses.headerCell}>Session</th>
              <th className={sessionTableClasses.headerCell}>Sets</th>
              <th className={sessionTableClasses.headerCell}>Duration</th>
              <th className={sessionTableClasses.headerCell}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{children}</tbody>
        </table>
      </div>

      {/* empty state hint */}
      {!children && <div className={sessionTableClasses.empty}>No sessions yet.</div>}
    </div>
  );
}

/*
Usage (presentational wrapper):

<SessionTable>
  <SetRow ... />    // on mobile will render stacked, on desktop must be a <tr>
</SessionTable>

Notes:
- This component is purely presentational and expects children to be rows (cards or <tr>s).
- Use the exported `sessionTableClasses` to maintain consistent classNames when integrating.
*/