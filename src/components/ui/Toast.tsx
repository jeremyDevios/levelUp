import React from 'react';

type ToastProps = {
  type?: 'success' | 'error' | 'info';
  message: React.ReactNode;
  className?: string;
  // presentational only — no timers
  visible?: boolean;
};

export const toastClasses = {
  base: 'fixed left-1/2 transform -translate-x-1/2 bottom-6 z-50',
  panel: 'min-w-[220px] max-w-sm px-4 py-3 rounded-md shadow-lg',
  success: 'bg-green-50 text-green-800 border border-green-100',
  error: 'bg-red-50 text-red-800 border border-red-100',
  info: 'bg-slate-50 text-slate-800 border border-slate-100',
};

export default function Toast({ variant = 'info', message, className = '', visible = true, onClose, role = 'status' }: ToastProps) {
  if (!visible) return null;

  const tone = variant === 'success' ? toastClasses.success : variant === 'error' ? toastClasses.error : variant === 'warning' ? toastClasses.warning : toastClasses.info;

  return (
    <div className={`${toastClasses.base} ${className}`} role={role} aria-live={role === 'alert' ? 'assertive' : 'polite'}>
      <div className={`${toastClasses.panel} ${tone}`}>
        <div className="flex-1">{message}</div>
        {onClose && (
          <button aria-label="Dismiss" onClick={onClose} className="ml-3 rounded-md p-1 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-300">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

/*
Usage:
<Toast variant="success" message="Saved" onClose={() => setVisible(false)} />

Notes:
- Presentational. Consumers control `visible` and add timers/animations if needed.
- `role` prop allows switching between polite/status and assertive/alert when appropriate for accessibility.
*/