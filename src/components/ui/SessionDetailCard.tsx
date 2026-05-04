import React, { useState } from 'react';
import Button from './Button';

interface SetItem {
  reps: number;
  weight?: number;
}

interface SessionDetailCardProps {
  title?: string;
  date?: string;
  sets?: SetItem[];
  onClose: () => void;
  onDelete?: () => void;
  variant?: 'panel' | 'modal';
}

export default function SessionDetailCard({ title = 'Session', date, sets = [], onClose, onDelete, variant = 'modal' }: SessionDetailCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      role={variant === 'modal' ? 'dialog' : 'region'}
      aria-modal={variant === 'modal' ? true : undefined}
      aria-label={title}
      className="card-glass p-4 max-w-md w-full"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {date && <div className="text-sm text-muted">{date}</div>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="danger" onClick={() => setConfirmDelete(true)} aria-label="Delete session">
            🗑
          </Button>
          <Button variant="ghost" onClick={onClose} aria-label="Close session detail">
            ✕
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {sets.length === 0 && <div className="text-sm text-muted">No sets recorded.</div>}
        {sets.map((s, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-md" style={{ border: '1px solid var(--glass-border)' }}>
            <div className="text-sm">Set {i + 1}</div>
            <div className="text-sm font-medium">{s.reps} reps{typeof s.weight === 'number' ? ` · ${s.weight} kg` : ''}</div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800">
          <div className="text-sm font-semibold text-red-700">Confirm delete</div>
          <div className="text-xs text-muted">This action cannot be undone.</div>
          <div className="mt-3 flex gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(false)} aria-label="Cancel delete">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmDelete(false);
                onDelete?.();
              }}
              aria-label="Confirm delete"
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
