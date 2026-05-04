import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';

interface WeightFormProps {
  initialWeight?: number;
  onSubmit: (weight: number) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function WeightForm({ initialWeight = 0, onSubmit, onCancel, loading = false }: WeightFormProps) {
  const [value, setValue] = useState<string>(initialWeight ? String(initialWeight) : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(value);
    if (!Number.isFinite(n)) return;
    onSubmit(n);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-live="polite">
      <label className="block">
        <div className="text-sm text-muted mb-1">Weight</div>
        <Input
          aria-label="weight-input"
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 72.5"
        />
      </label>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="w-28">
          Cancel
        </Button>
      </div>
    </form>
  );
}
