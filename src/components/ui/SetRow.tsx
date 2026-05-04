import React from 'react';
import Input from './Input';
import Button from './Button';

type SetRowProps = {
  index?: number;
  name?: string;
  reps?: string | number;
  weight?: string | number;
  className?: string;
  // callbacks intentionally omitted — presentational only
};

export const setRowClasses = {
  mobileCard: 'card-glass p-3 flex flex-col space-y-2',
  rowContainer: 'flex items-center justify-between space-x-3',
  inputSmall: 'input-base text-sm',
  actions: 'flex items-center space-x-2',
  pill: 'text-xs px-2 py-1 rounded-full bg-opacity-10 text-current',
  desktopTr: 'hidden md:table-row',
  desktopTd: 'p-3 align-top',
};

export default function SetRow({ index, name = '', reps = '', weight = '', className = '' }: SetRowProps) {
  const label = typeof index === 'number' ? `Set ${index + 1}` : 'Set';

  const content = (
    <div className={"w-full " + setRowClasses.rowContainer}>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <Input className={`${setRowClasses.inputSmall} col-span-1`} value={name} readOnly />
          <Input className={`${setRowClasses.inputSmall} col-span-1`} value={String(reps)} readOnly />
          <Input className={`${setRowClasses.inputSmall} col-span-1`} value={String(weight)} readOnly />
        </div>
      </div>

      <div className={setRowClasses.actions}>
        <Button variant="ghost" size="sm" className="text-orange-500 hover:underline">+
        </Button>
        <Button variant="ghost" size="sm" className="text-red-500">−</Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile card */}
      <div className={`${setRowClasses.mobileCard} ${className} md:hidden`} role="listitem">
        {content}
      </div>

      {/* Desktop table row */}
      <tr className={`hidden md:table-row ${className}`}>
        <td className={setRowClasses.desktopTd} style={{ width: '35%' }}>
          <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{name}</div>
        </td>
        <td className={setRowClasses.desktopTd} style={{ width: '25%' }}>
          <div className="text-sm">{reps}</div>
        </td>
        <td className={setRowClasses.desktopTd} style={{ width: '25%' }}>
          <div className="text-sm">{weight}</div>
        </td>
        <td className={setRowClasses.desktopTd} style={{ width: '15%' }}>
          <div className="flex items-center justify-end space-x-2">
            <Button variant="ghost" size="sm" className="text-orange-500">Edit</Button>
            <Button variant="ghost" size="sm" className="text-red-500">Remove</Button>
          </div>
        </td>
      </tr>
    </>
  );
}

/*
Presentational notes:
- This component renders a mobile-first "card" (stacked inputs) and a desktop table row (<tr>).
- It purposely has no event handlers — integration code should wrap or clone and provide callbacks.
- Use exported `setRowClasses` to keep classNames consistent when integrating.
*/