import React, { useState } from 'react';

export default function WeightEntryForm({ userId }: { userId?: string }) {
  const [weight, setWeight] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // placeholder: in full impl this will call weightService.addWeightEntry
    console.log('Add weight', { userId, weight });
    setWeight('');
  };

  return (
    <form className="lu-form" onSubmit={handleSubmit}>
      <label>
        Poids (kg)
        <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="82.3" />
      </label>
      <button type="submit">Ajouter</button>
    </form>
  );
}
